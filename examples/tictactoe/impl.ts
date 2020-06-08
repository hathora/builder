import { Methods } from "./.lsot/methods";
import {
    MoveType,
    PlayerData,
    ICreateGameRequest,
    IJoinGameRequest,
    IMakeMoveRequest,
    IStartGameRequest,
    PlayerState,
    PlayerName,
    GameStatus,
  } from "./.lsot/types";

interface InternalState {
    creator: PlayerName;
    firstPlayer: PlayerName;
    secondPlayer: PlayerName;
    board: MoveType[][];
}

export class Impl implements Methods<InternalState> {
    createGame(userData: PlayerData, request: ICreateGameRequest): InternalState {
        throw new Error("Method not implemented.");
    }
    joinGame(state: InternalState, userData: PlayerData, request: IJoinGameRequest): string | void {
        throw new Error("Method not implemented.");
    }
    startGame(state: InternalState, userData: PlayerData, request: IStartGameRequest): string | void {
        throw new Error("Method not implemented.");
    }
    makeMove(state: InternalState, userData: PlayerData, request: IMakeMoveRequest): string | void {
        throw new Error("Method not implemented.");
    }
    getUserState(state: InternalState, userData: PlayerData): PlayerState {
        throw new Error("Method not implemented.");
    }

}