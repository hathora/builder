import { Response } from "./base";
import {
  UserId,
  PlayerState as UserState,
  ICreateGameRequest,
  IJoinGameRequest,
  IChooseGestureRequest,
  INextRoundRequest,
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
  chooseGesture(state: T, userId: UserId, ctx: Context, request: IChooseGestureRequest): Response;
  nextRound(state: T, userId: UserId, ctx: Context, request: INextRoundRequest): Response;
  getUserState(state: T, userId: UserId): UserState;
}
