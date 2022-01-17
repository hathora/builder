import { Response } from "./base";
import {
  UserId,
  RoomState as UserState,
  ICreateRoomRequest,
  ISendPublicMessageRequest,
  ISendPrivateMessageRequest,
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
  createRoom(userId: UserId, ctx: Context, request: ICreateRoomRequest): T;
  sendPublicMessage(state: T, userId: UserId, ctx: Context, request: ISendPublicMessageRequest): Response;
  sendPrivateMessage(state: T, userId: UserId, ctx: Context, request: ISendPrivateMessageRequest): Response;
  getUserState(state: T, userId: UserId): UserState;
}
