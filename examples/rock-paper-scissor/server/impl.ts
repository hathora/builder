import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import { UserId, PlayerState, IJoinGameRequest, IChooseGestureRequest, INextRoundRequest, Gesture } from "../api/types";

export class Impl implements Methods<PlayerState> {
  initialize(ctx: Context): PlayerState {
    return { round: 0 };
  }
  joinGame(state: PlayerState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    if (state.player1?.id === userId || state.player2?.id === userId) {
      return Response.error("Already joined");
    }
    if (state.player1 === undefined) {
      state.player1 = { id: userId, score: 0 };
    } else if (state.player2 === undefined) {
      state.player2 = { id: userId, score: 0 };
    } else {
      return Response.error("Game full");
    }
    return Response.ok();
  }
  chooseGesture(state: PlayerState, userId: UserId, ctx: Context, request: IChooseGestureRequest): Response {
    if (state.player1 === undefined || state.player2 === undefined) {
      return Response.error("Game not started");
    }
    const player = [state.player1, state.player2].find((p) => p.id === userId);
    if (player === undefined) {
      return Response.error("Invalid player");
    }
    if (player.gesture !== undefined) {
      return Response.error("Already picked");
    }
    player.gesture = request.gesture;
    const otherPlayer = userId === state.player1.id ? state.player2 : state.player1;
    if (otherPlayer.gesture !== undefined) {
      if (gestureWins(player.gesture, otherPlayer.gesture)) {
        player.score++;
      } else if (gestureWins(otherPlayer.gesture, player.gesture)) {
        otherPlayer.score++;
      }
    }
    return Response.ok();
  }
  nextRound(state: PlayerState, userId: UserId, ctx: Context, request: INextRoundRequest): Response {
    if (state.player1 === undefined || state.player2 === undefined) {
      return Response.error("Game not started");
    }
    if (state.player1.gesture === undefined || state.player2.gesture === undefined) {
      return Response.error("Round still in progress");
    }
    state.round++;
    state.player1.gesture = undefined;
    state.player2.gesture = undefined;
    return Response.ok();
  }
  getUserState(state: PlayerState, userId: UserId): PlayerState {
    if (state.player1 === undefined || state.player2 === undefined) {
      return state;
    }
    if (state.player1.gesture !== undefined && state.player2.gesture !== undefined) {
      return state;
    }
    return {
      round: state.round,
      player1: userId === state.player1.id ? state.player1 : { ...state.player1, gesture: undefined },
      player2: userId === state.player2.id ? state.player2 : { ...state.player2, gesture: undefined },
    };
  }
}

function gestureWins(gesture: Gesture, otherGesture: Gesture) {
  return (
    (gesture === Gesture.ROCK && otherGesture === Gesture.SCISSOR) ||
    (gesture === Gesture.SCISSOR && otherGesture === Gesture.PAPER) ||
    (gesture === Gesture.PAPER && otherGesture === Gesture.ROCK)
  );
}
