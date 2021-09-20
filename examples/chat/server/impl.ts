import { Methods, Context } from "./.rtag/methods";
import { UserData, Response } from "./.rtag/base";
import {
  RoomState,
  ICreateRoomRequest,
  ISendPublicMessageRequest,
  ISendPrivateMessageRequest,
} from "./.rtag/types";

type InternalState = {};

export class Impl implements Methods<InternalState> {
  createRoom(user: UserData, ctx: Context, request: ICreateRoomRequest): InternalState {
    return {};
  }
  sendPublicMessage(state: InternalState, user: UserData, ctx: Context, request: ISendPublicMessageRequest): Response {
    return Response.error("Not implemented");
  }
  sendPrivateMessage(state: InternalState, user: UserData, ctx: Context, request: ISendPrivateMessageRequest): Response {
    return Response.error("Not implemented");
  }
  getUserState(state: InternalState, user: UserData): RoomState {
    return {
      name: "",
      createdBy: "",
      messages: [],
    };
  }
}
