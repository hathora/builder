import { Methods, Context } from "./.rtag/methods";
import { UserData, Response } from "./.rtag/base";
import {
  PlayerInfo,
  PlayerState,
  ICreateGameRequest,
  IJoinGameRequest,
  IChooseGestureRequest,
  INextRoundRequest,
  Gesture,
} from "./.rtag/types";

export class Impl implements Methods<PlayerState> {
  createGame(user: UserData, ctx: Context, request: ICreateGameRequest): PlayerState {
    return {
      round: 0,
      player1: { name: user.name, score: 0 },
    };
  }
  joinGame(state: PlayerState, user: UserData, ctx: Context, request: IJoinGameRequest): Response {
    if (state.player1.name === user.name || state.player2?.name === user.name) {
      return Response.error("Already joined");
    }
    if (state.player2 !== undefined) {
      return Response.error("Game full");
    }
    state.player2 = { name: user.name, score: 0 };
    return Response.ok();
  }
  chooseGesture(state: PlayerState, user: UserData, ctx: Context, request: IChooseGestureRequest): Response {
    if (state.player2 === undefined) {
      return Response.error("Game not started");
    }
    if (state.player1.name === user.name) {
      return handleChoice(state.player1, state.player2, request.guesture);
    } else if (state.player2.name === user.name) {
      return handleChoice(state.player2, state.player1, request.guesture);
    } else {
      return Response.error("Invalid player");
    }
  }
  nextRound(state: PlayerState, user: UserData, ctx: Context, request: INextRoundRequest): Response {
    if (state.player2 === undefined) {
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
  getUserState(state: PlayerState, user: UserData): PlayerState {
    if (state.player2 === undefined) {
      return state;
    }
    if (state.player1.gesture !== undefined && state.player2.gesture !== undefined) {
      return state;
    }
    return {
      round: state.round,
      player1: user.name === state.player1.name ? state.player1 : { ...state.player1, gesture: undefined },
      player2: user.name === state.player2.name ? state.player2 : { ...state.player2, gesture: undefined },
    };
  }
}

function handleChoice(player: PlayerInfo, otherPlayer: PlayerInfo, guesture: Gesture) {
  if (player.gesture !== undefined) {
    return Response.error("Already picked");
  }
  player.gesture = guesture;
  if (otherPlayer.gesture !== undefined) {
    if (gestureWins(player.gesture, otherPlayer.gesture)) {
      player.score++;
    } else if (gestureWins(otherPlayer.gesture, player.gesture)) {
      otherPlayer.score++;
    }
  }
  return Response.ok();
}

function gestureWins(gesture: Gesture, otherGesture: Gesture) {
  return (
    (gesture === Gesture.ROCK && otherGesture === Gesture.SCISSOR) ||
    (gesture === Gesture.SCISSOR && otherGesture === Gesture.PAPER) ||
    (gesture === Gesture.PAPER && otherGesture === Gesture.ROCK)
  );
}
