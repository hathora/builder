import WebSocket from "isomorphic-ws";
// @ts-ignore
import getRandomValues from "get-random-values";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { UserData, Response, Method } from "./base";
import { ConnectionFailure, transformCoordinatorFailure } from "./failures";
import { computePatch } from "./patch";
import {
  decodeStateUpdate,
  PlayerState as UserState,
  ICreateGameRequest,
  IJoinGameRequest,
  IStartGameRequest,
  IGiveClueRequest,
  ISelectCardRequest,
  IEndTurnRequest,
} from "./types";

const COORDINATOR_HOST = "rtag.dev";

export type StateId = string;
export type UpdateArgs = { state: UserState; updatedAt: number };

export class RtagClient {
  public constructor(private appId: string) {}

  public static getUserFromToken(token: string): UserData {
    return jwtDecode(token);
  }

  public async loginAnonymous(): Promise<string> {
    return (await axios.post(`https://${COORDINATOR_HOST}/${this.appId}/login/anonymous`)).data.token;
  }

  public async loginGoogle(idToken: string): Promise<string> {
    return (await axios.post(`https://${COORDINATOR_HOST}/${this.appId}/login/google`, { idToken })).data.token;
  }

  public connectNew(
    token: string,
    request: ICreateGameRequest,
    onUpdate: (updateArgs: UpdateArgs) => void,
    onConnectionFailure: (failure: ConnectionFailure) => void
  ): Promise<RtagConnection> {
    return new Promise((resolve) => {
      const socket = this.initSocket(onConnectionFailure);
      socket.onopen = () => {
        socket.send(token);
        socket.send(ICreateGameRequest.encode(request).toBuffer());
      };
      socket.onmessage = ({ data }) => resolve(new RtagConnection(data as StateId, socket, onUpdate));
    });
  }

  public connectExisting(
    token: string,
    stateId: StateId,
    onUpdate: (updateArgs: UpdateArgs) => void,
    onConnectionFailure: (failure: ConnectionFailure) => void
  ): RtagConnection {
    const socket = this.initSocket(onConnectionFailure);
    socket.onopen = () => {
      socket.send(token);
      socket.send(stateId);
    };
    return new RtagConnection(stateId, socket, onUpdate);
  }

  private initSocket(onConnectionFailure: (failure: ConnectionFailure) => void) {
    const socket = new WebSocket(`wss://${COORDINATOR_HOST}/${this.appId}`);
    socket.binaryType = "arraybuffer";
    socket.onclose = (e) => onConnectionFailure(transformCoordinatorFailure(e));
    return socket;
  }
}

export class RtagConnection {
  private callbacks: Record<string, (response: Response) => void> = {};
  private state?: UserState = undefined;
  private changedAt = 0;

  public constructor(public stateId: StateId, private socket: WebSocket, onUpdate: (updateArgs: UpdateArgs) => void) {
    socket.onmessage = ({ data }) => {
      if (this.state === undefined) {
        this.state = UserState.decode(new Uint8Array(data as ArrayBuffer));
        onUpdate({ state: JSON.parse(JSON.stringify(this.state)), updatedAt: 0 });
        return;
      }
      const { stateDiff, changedAtDiff, responses } = decodeStateUpdate(new Uint8Array(data as ArrayBuffer));
      this.changedAt += changedAtDiff;
      if (stateDiff !== undefined) {
        this.state = computePatch(this.state, stateDiff);
        onUpdate({ state: JSON.parse(JSON.stringify(this.state)), updatedAt: this.changedAt });
      }
      Object.entries(responses).forEach(([msgId, response]) => {
        if (msgId in this.callbacks) {
          this.callbacks[msgId](response);
          delete this.callbacks[msgId];
        }
      });
    };
  }

  public joinGame(request: IJoinGameRequest): Promise<Response> {
    return this.callMethod(Method.JOIN_GAME, IJoinGameRequest.encode(request).toBuffer());
  }

  public startGame(request: IStartGameRequest): Promise<Response> {
    return this.callMethod(Method.START_GAME, IStartGameRequest.encode(request).toBuffer());
  }

  public giveClue(request: IGiveClueRequest): Promise<Response> {
    return this.callMethod(Method.GIVE_CLUE, IGiveClueRequest.encode(request).toBuffer());
  }

  public selectCard(request: ISelectCardRequest): Promise<Response> {
    return this.callMethod(Method.SELECT_CARD, ISelectCardRequest.encode(request).toBuffer());
  }

  public endTurn(request: IEndTurnRequest): Promise<Response> {
    return this.callMethod(Method.END_TURN, IEndTurnRequest.encode(request).toBuffer());
  }

  public disconnect(): void {
    this.socket.onclose = () => {};
    this.socket.close();
  }

  private callMethod(method: Method, request: Uint8Array): Promise<Response> {
    return new Promise((resolve, reject) => {
      if (this.socket.readyState === this.socket.CLOSED) {
        reject("Connection is closed");
      } else {
        const msgId: Uint8Array = getRandomValues(new Uint8Array(4));
        this.socket.send(new Uint8Array([...new Uint8Array([method]), ...msgId, ...request]));
        this.callbacks[new DataView(msgId.buffer).getUint32(0, true)] = resolve;
      }
    });
  }
}
