import { Methods, Context } from "./.rtag/methods";
import { UserData, Response } from "./.rtag/base";
import { RoomState, ICreateRoomRequest, ISendPublicMessageRequest, ISendPrivateMessageRequest } from "./.rtag/types";

export class Impl implements Methods<RoomState> {
  createRoom(user: UserData, ctx: Context, request: ICreateRoomRequest): RoomState {
    return { name: request.name, createdBy: user.name, messages: [] };
  }
  sendPublicMessage(state: RoomState, user: UserData, ctx: Context, request: ISendPublicMessageRequest): Response {
    state.messages.push({ text: request.text, sentAt: ctx.time(), sentBy: user.name });
    return Response.ok();
  }
  sendPrivateMessage(state: RoomState, user: UserData, ctx: Context, request: ISendPrivateMessageRequest): Response {
    state.messages.push({ text: request.text, sentAt: ctx.time(), sentBy: user.name, sentTo: request.to });
    return Response.ok();
  }
  getUserState(state: RoomState, user: UserData): RoomState {
    return {
      name: state.name,
      createdBy: state.createdBy,
      messages: state.messages.filter(
        (msg) => msg.sentBy === user.name || msg.sentTo === user.name || msg.sentTo === undefined
      ),
    };
  }
}
