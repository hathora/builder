import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  Tile,
  PlayerState,
  UserId,
  IInitializeRequest,
  IJoinGameRequest,
  IStartGameRequest,
  IPlayTileRequest,
} from "../api/types";

type InternalState = PlayerState;

export class Impl implements Methods<InternalState> {
  initialize(ctx: Context, request: IInitializeRequest): InternalState {
    return {
      board: [],
      players: [],
      turn: undefined,
      winner: undefined,
    };
  }
  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    if (state.players.includes(userId)) {
      return Response.error("You are already in the game");
    } else if (state.players.length >= 2) {
      return Response.error("Game is full");
    }
    state.players.push(userId);
    return Response.ok();
  }
  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    if (state.players.length < 2) {
      return Response.error("Not enough players");
    } else if (state.turn !== undefined) {
      return Response.error("Game already started");
    }
    state.turn = state.players[0];
    state.board = [
      Tile.EMPTY,
      Tile.EMPTY,
      Tile.EMPTY,
      Tile.EMPTY,
      Tile.EMPTY,
      Tile.EMPTY,
      Tile.EMPTY,
      Tile.EMPTY,
      Tile.EMPTY,
    ];
    return Response.ok();
  }
  playTile(state: InternalState, userId: UserId, ctx: Context, request: IPlayTileRequest): Response {
    if (state.turn !== userId) {
      return Response.error("It is not your turn");
    }
    const { x, y } = request;
    const tileIndex = y * 3 + x;
    if (state.board[tileIndex] !== Tile.EMPTY) {
      return Response.error("Tile is already taken");
    }
    state.board[tileIndex] = state.players.indexOf(userId) === 0 ? Tile.X : Tile.O;
    state.turn = state.players.find((player) => player !== userId);
    if (this.checkWinner(state.board)) {
      state.winner = userId;
    }

    return Response.ok();
  }
  checkWinner(board: Tile[]): boolean {
    const winningLines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const line of winningLines) {
      const [a, b, c] = line;
      if (board[a] !== Tile.EMPTY && board[a] === board[b] && board[a] === board[c]) {
        return true;
      }
    }
    return false;
  }
  getUserState(state: InternalState, userId: UserId): PlayerState {
    return state;
  }
}
