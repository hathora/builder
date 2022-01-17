import { Response } from "./base";
import {
  UserId,
  PlayerState as UserState,
  ICreateGameRequest,
  ISetDirectionRequest,
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
  setDirection(state: T, userId: UserId, ctx: Context, request: ISetDirectionRequest): Response;
  getUserState(state: T, userId: UserId): UserState;
  onTick(state: T, ctx: Context, timeDelta: number): void;
}
