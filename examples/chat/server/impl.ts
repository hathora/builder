import { Methods, Context } from "./.rtag/methods";
import { Response } from "./.rtag/base";
import {
  UserId,
  RoomState,
  ICreateRoomRequest,
  ISendPublicMessageRequest,
  ISendPrivateMessageRequest,
} from "./.rtag/types";

export class Impl implements Methods<RoomState> {
  createRoom(userId: UserId, ctx: Context, request: ICreateRoomRequest): RoomState {
    return { name: request.name, createdBy: userId, messages: [] };
  }
  sendPublicMessage(state: RoomState, userId: UserId, ctx: Context, request: ISendPublicMessageRequest): Response {
    state.messages.push({ text: request.text, sentAt: ctx.time(), sentBy: userId });
    return Response.ok();
  }
  sendPrivateMessage(state: RoomState, userId: UserId, ctx: Context, request: ISendPrivateMessageRequest): Response {
    state.messages.push({ text: request.text, sentAt: ctx.time(), sentBy: userId, sentTo: request.to });
    return Response.ok();
  }
  getUserState(state: RoomState, userId: UserId): RoomState {
    return {
      name: state.name,
      createdBy: state.createdBy,
      messages: state.messages.filter(
        (msg) => msg.sentBy === userId || msg.sentTo === userId || msg.sentTo === undefined
      ),
    };
  }
}
