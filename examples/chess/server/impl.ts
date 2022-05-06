import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import { UserId, GameStatus, Color, Piece, PlayerState, IMovePieceRequest, PieceType } from "../api/types";
import { Chess, ChessInstance, Piece as ChessPiece, Square } from "chess.js";

type InternalUser = {
  id: UserId;
  color: Color;
};
type InternalState = {
  chess: ChessInstance;
  users: InternalUser[];
  turnCount: number;
};

export class Impl implements Methods<InternalState> {
  initialize(): InternalState {
    return { chess: new Chess(), users: [], turnCount: 0 };
  }
  joinGame(state: InternalState, userId: string): Response {
    if (state.users.length === 0) {
      state.users.push({ id: userId, color: Color.WHITE });
    } else if (state.users.length === 1) {
      state.users.push({ id: userId, color: Color.BLACK });
    } else {
      return Response.error("Game is full");
    }
    return Response.ok();
  }
  movePiece(state: InternalState, userId: UserId, ctx: Context, request: IMovePieceRequest): Response {
    if (gameStatus(state) === GameStatus.WAITING) {
      return Response.error("Game not started");
    }
    const color = state.users.find((u) => u.id === userId)?.color;
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
  getUserState(state: InternalState): PlayerState {
    return {
      board: state.chess.board().flatMap((pieces, i) => {
        return pieces.flatMap((piece, j) => (piece === null ? [] : convertPiece(piece, i, j)));
      }),
      status: gameStatus(state),
      players: state.users,
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
