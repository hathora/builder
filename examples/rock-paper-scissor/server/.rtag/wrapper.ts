import onChange from "on-change";
import { Context } from "./methods";
import { Response, Method } from "./base";
import {
  UserId,
  ICreateGameRequest,
  IJoinGameRequest,
  IChooseGestureRequest,
  INextRoundRequest,
} from "./types";

let impl = new (await import("../impl")).Impl();
setInterval(async () => {
  impl = new (await import("../impl")).Impl();
}, 100);

type State = ReturnType<typeof impl.createGame>;

let changedAt: number | undefined = undefined;

export const ImplWrapper = {
  initialize(userId: UserId, ctx: Context, argsBuffer: Buffer): State {
    const state = impl.createGame(userId, ctx, ICreateGameRequest.decode(argsBuffer));
    return onChange(state, () => {
      changedAt = Date.now();
    });
  },
  getResult(state: State, userId: UserId, method: Method, ctx: Context, argsBuffer: Buffer): Response | undefined {
    switch (method) {
      case Method.JOIN_GAME:
        return impl.joinGame(state, userId, ctx, IJoinGameRequest.decode(argsBuffer));
      case Method.CHOOSE_GESTURE:
        return impl.chooseGesture(state, userId, ctx, IChooseGestureRequest.decode(argsBuffer));
      case Method.NEXT_ROUND:
        return impl.nextRound(state, userId, ctx, INextRoundRequest.decode(argsBuffer));
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
