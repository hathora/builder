import { Response } from "./base";
import {
  UserId,
  PlayerState as UserState,
  ICreateGameRequest,
  IJoinGameRequest,
  IStartRoundRequest,
  IFoldRequest,
  ICallRequest,
  IRaiseRequest,
} from "./types";

export interface Context {
  rand(): number;
  randInt(limit?: number): number;
  time(): number;
}

type State =
  | undefined
  | string
  | number
  | boolean
  | readonly State[]
  | { [k: string]: State }
  | Set<State>
  | Map<State, State>
  | (object & { _modCnt: number });
export interface Methods<T extends State> {
  createGame(userId: UserId, ctx: Context, request: ICreateGameRequest): T;
  joinGame(state: T, userId: UserId, ctx: Context, request: IJoinGameRequest): Response;
  startRound(state: T, userId: UserId, ctx: Context, request: IStartRoundRequest): Response;
  fold(state: T, userId: UserId, ctx: Context, request: IFoldRequest): Response;
  call(state: T, userId: UserId, ctx: Context, request: ICallRequest): Response;
  raise(state: T, userId: UserId, ctx: Context, request: IRaiseRequest): Response;
  getUserState(state: T, userId: UserId): UserState;
}
