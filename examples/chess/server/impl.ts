import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  UserId,
  GameStatus,
  Color,
  Piece,
  PlayerState,
  ICreateGameRequest,
  IStartGameRequest,
  IMovePieceRequest,
  PieceType,
} from "../api/types";
import { Chess, ChessInstance, Piece as ChessPiece, Square } from "chess.js";

type InternalUser = {
  name: UserId;
  color: Color;
};
type InternalState = {
  chess: ChessInstance;
  users: InternalUser[];
  turnCount: number;
};

export class Impl implements Methods<InternalState> {
  createGame(userId: UserId, ctx: Context, request: ICreateGameRequest): InternalState {
    return {
      chess: new Chess(),
      users: [{ name: userId, color: Color.WHITE }],
      turnCount: 0,
    };
  }
  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    if (state.users.find((u) => u.name === userId) !== undefined) {
      return Response.error("Need opponent to start game");
    }
    state.users.push({ name: userId, color: Color.BLACK });
    return Response.ok();
  }
  movePiece(state: InternalState, userId: UserId, ctx: Context, request: IMovePieceRequest): Response {
    if (gameStatus(state) === GameStatus.WAITING) {
      return Response.error("Game not started");
    }
    const color = state.users.find((u) => u.name === userId)?.color;
    if (convertColor(state.chess.turn()) !== color) {
      return Response.error("Not your turn");
    }
    const move = state.chess.move({ from: request.from as Square, to: request.to as Square });
    if (move === null) {
      return Response.error("Invalid move");
    }
    state.turnCount++;
    return Response.ok();
  }
  getUserState(state: InternalState, userId: UserId): PlayerState {
    const internalUser = state.users.find((u) => u.name === userId);
    return {
      board: state.chess.board().flatMap((pieces, i) => {
        return pieces.flatMap((piece, j) => (piece === null ? [] : convertPiece(piece, i, j)));
      }),
      status: gameStatus(state),
      color: internalUser?.color ?? Color.WHITE,
      opponent: internalUser !== undefined ? state.users.find((u) => u.name !== userId)?.name : undefined,
    };
  }
}

function gameStatus(state: InternalState) {
  if (state.users.length < 2) {
    return GameStatus.WAITING;
  }
  return state.chess.turn() === "w" ? GameStatus.WHITE_TURN : GameStatus.BLACK_TURN;
}

function convertPiece(piece: ChessPiece, i: number, j: number): Piece {
  const color = convertColor(piece.color);
  const type = convertType(piece.type);
  const square = ["a", "b", "c", "d", "e", "f", "g", "h"][j] + (8 - i);
  return {
    color,
    type,
    square,
  };
}

function convertColor(color: "w" | "b"): Color {
  switch (color) {
    case "w":
      return Color.WHITE;
    case "b":
      return Color.BLACK;
  }
}

function convertType(type: "p" | "n" | "b" | "r" | "q" | "k"): PieceType {
  switch (type) {
    case "p":
      return PieceType.PAWN;
    case "n":
      return PieceType.KNIGHT;
    case "b":
      return PieceType.BISHOP;
    case "r":
      return PieceType.ROOK;
    case "q":
      return PieceType.QUEEN;
    case "k":
      return PieceType.KING;
  }
}
