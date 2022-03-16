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
  async initialize(userId: UserId, ctx: Context): Promise<RoomState> {
    return { createdBy: userId, users: [userId], messages: [] };
  }
  async joinRoom(state: RoomState, userId: string, ctx: Context, request: IJoinRoomRequest) {
    if (state.users.includes(userId)) {
      return Response.error("Already joined");
    }
    state.users.push(userId);
    return Response.ok();
  }
  async leaveRoom(state: RoomState, userId: string, ctx: Context, request: ILeaveRoomRequest) {
    if (!state.users.includes(userId)) {
      return Response.error("Not joined");
    }
    state.users.splice(state.users.indexOf(userId), 1);
    return Response.ok();
  }
  async sendPublicMessage(state: RoomState, userId: UserId, ctx: Context, request: ISendPublicMessageRequest) {
    if (!state.users.includes(userId)) {
      return Response.error("Not joined");
    }
    state.messages.push({ text: request.text, sentAt: ctx.time, sentBy: userId });
    return Response.ok();
  }
  async sendPrivateMessage(state: RoomState, userId: UserId, ctx: Context, request: ISendPrivateMessageRequest) {
    if (!state.users.includes(userId)) {
      return Response.error("Not joined");
    }
    if (!state.users.includes(request.to)) {
      return Response.error("Recpient not joined");
    }
    state.messages.push({ text: request.text, sentAt: ctx.time, sentBy: userId, sentTo: request.to });
    return Response.ok();
  }
  async getUserState(state: RoomState, userId: UserId): Promise<RoomState> {
    return {
      createdBy: state.createdBy,
      users: state.users,
      messages: state.messages.filter(
        (msg) => msg.sentBy === userId || msg.sentTo === userId || msg.sentTo === undefined
      ),
    };
  }
}
