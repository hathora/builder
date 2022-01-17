import onChange from "on-change";
import { Context } from "./methods";
import { Response, Method } from "./base";
import {
  UserId,
  ICreateRoomRequest,
  ISendPublicMessageRequest,
  ISendPrivateMessageRequest,
} from "./types";

let impl = new (await import("../impl")).Impl();
setInterval(async () => {
  impl = new (await import("../impl")).Impl();
}, 100);

type State = ReturnType<typeof impl.createRoom>;

let changedAt: number | undefined = undefined;

export const ImplWrapper = {
  initialize(userId: UserId, ctx: Context, argsBuffer: Buffer): State {
    const state = impl.createRoom(userId, ctx, ICreateRoomRequest.decode(argsBuffer));
    return onChange(state, () => {
      changedAt = Date.now();
    });
  },
  getResult(state: State, userId: UserId, method: Method, ctx: Context, argsBuffer: Buffer): Response | undefined {
    switch (method) {
      case Method.SEND_PUBLIC_MESSAGE:
        return impl.sendPublicMessage(state, userId, ctx, ISendPublicMessageRequest.decode(argsBuffer));
      case Method.SEND_PRIVATE_MESSAGE:
        return impl.sendPrivateMessage(state, userId, ctx, ISendPrivateMessageRequest.decode(argsBuffer));
    }
  },
  getUserState(state: State, userId: UserId) {
    return impl.getUserState(onChange.target(state), userId);
  },
  changedAt(): number | undefined {
    const res = changedAt;
    changedAt = undefined;
    return res;
  },
};
