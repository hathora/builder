import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  UserId,
  RoomState,
  IJoinRoomRequest,
  ILeaveRoomRequest,
  ISendPublicMessageRequest,
  ISendPrivateMessageRequest,
} from "../api/types";

export class Impl implements Methods<RoomState> {
  initialize(userId: UserId, ctx: Context): RoomState {
    return { createdBy: userId, users: [userId], messages: [] };
  }
  joinRoom(state: RoomState, userId: string, ctx: Context, request: IJoinRoomRequest): Response {
    if (state.users.includes(userId)) {
      return Response.error("Already joined");
    }
    state.users.push(userId);
    return Response.ok();
  }
  leaveRoom(state: RoomState, userId: string, ctx: Context, request: ILeaveRoomRequest): Response {
    if (!state.users.includes(userId)) {
      return Response.error("Not joined");
    }
    state.users.splice(state.users.indexOf(userId), 1);
    return Response.ok();
  }
  sendPublicMessage(state: RoomState, userId: UserId, ctx: Context, request: ISendPublicMessageRequest): Response {
    if (!state.users.includes(userId)) {
      return Response.error("Not joined");
    }
    state.messages.push({ text: request.text, sentAt: ctx.time, sentBy: userId });
    return Response.ok();
  }
  sendPrivateMessage(state: RoomState, userId: UserId, ctx: Context, request: ISendPrivateMessageRequest): Response {
    if (!state.users.includes(userId)) {
      return Response.error("Not joined");
    }
    if (!state.users.includes(request.to)) {
      return Response.error("Recpient not joined");
    }
    state.messages.push({ text: request.text, sentAt: ctx.time, sentBy: userId, sentTo: request.to });
    return Response.ok();
  }
  getUserState(state: RoomState, userId: UserId): RoomState {
    return {
      createdBy: state.createdBy,
      users: state.users,
      messages: state.messages.filter(
        (msg) => msg.sentBy === userId || msg.sentTo === userId || msg.sentTo === undefined
      ),
    };
  }
}
