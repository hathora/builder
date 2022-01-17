import {
  NO_DIFF,
  DeepPartial,
  Square,
  Board,
  Color,
  PieceType,
  GameStatus,
  Piece,
  PlayerState,
  UserId,
} from "./types";

function diffPiece(obj: Piece, prevObj: Piece): DeepPartial<Piece> | typeof NO_DIFF {
  return diffObj({
    color: diffPrimitive(obj.color, prevObj.color),
    type: diffPrimitive(obj.type, prevObj.type),
    square: diffPrimitive(obj.square, prevObj.square),
  });
}

function diffPlayerState(obj: PlayerState, prevObj: PlayerState): DeepPartial<PlayerState> | typeof NO_DIFF {
  return diffObj({
    board: diffArray(obj.board, prevObj.board, (a, b) => diffPiece(a, b)),
    status: diffPrimitive(obj.status, prevObj.status),
    color: diffPrimitive(obj.color, prevObj.color),
    opponent: diffOptional(obj.opponent, prevObj.opponent, (a, b) => diffPrimitive(a, b)),
  });
}

export function computeDiff(state: PlayerState, prevState: PlayerState): DeepPartial<PlayerState> | typeof NO_DIFF {
  return diffPlayerState(state, prevState);
}

function diffPrimitive<T>(a: T, b: T) {
  return a === b ? NO_DIFF : a;
}

function diffOptional<T>(
  a: T | undefined,
  b: T | undefined,
  innerDiff: (x: T, y: T) => DeepPartial<T> | typeof NO_DIFF
) {
  if (a !== undefined && b !== undefined) {
    return innerDiff(a, b);
  } else if (a !== undefined || b !== undefined) {
    return a;
  }
  return NO_DIFF;
}

function diffArray<T>(a: T[], b: T[], innerDiff: (x: T, y: T) => DeepPartial<T> | typeof NO_DIFF) {
  const arr = a.map((val, i) => (i < b.length ? innerDiff(val, b[i]) : val));
  return a.length === b.length && arr.every((v) => v === NO_DIFF) ? NO_DIFF : arr;
}

function diffObj<T>(obj: T) {
  return Object.values(obj).every((v) => v === NO_DIFF) ? NO_DIFF : obj;
}
