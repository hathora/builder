import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import { Player, PlayerState, UserId, IInitializeRequest, IPingRequest, IJoinRequest } from "../api/types";

type InternalState = PlayerState;

export class Impl implements Methods<InternalState> {
  initialize(ctx: Context, request: IInitializeRequest): InternalState {
    return {
      players: [],
    };
  }
  join(state: PlayerState, userId: string, ctx: Context, request: IJoinRequest): Response {
    if (state.players.some((p) => p.id === userId)) {
      return Response.error("Player already joined");
    }
    state.players.push({ id: userId, seqArray: [] });
    return Response.ok();
  }
  ping(state: InternalState, userId: UserId, ctx: Context, request: IPingRequest): Response {
    const myPlayer = state.players.find((p) => p.id === userId);
    if (!myPlayer) {
      return Response.error("Not in game");
    }
    myPlayer.seqArray.push(request.message);
    return Response.ok();
  }
  getUserState(state: InternalState, userId: UserId): PlayerState {
    return state;
  }
  onTick(state: InternalState, ctx: Context, timeDelta: number): void {}
}
