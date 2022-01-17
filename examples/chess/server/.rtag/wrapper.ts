import onChange from "on-change";
import { Context } from "./methods";
import { Response, Method } from "./base";
import {
  UserId,
  ICreateGameRequest,
  IStartGameRequest,
  IMovePieceRequest,
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
      case Method.START_GAME:
        return impl.startGame(state, userId, ctx, IStartGameRequest.decode(argsBuffer));
      case Method.MOVE_PIECE:
        return impl.movePiece(state, userId, ctx, IMovePieceRequest.decode(argsBuffer));
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
