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

function patchPiece(obj: Piece, patch: DeepPartial<Piece>) {
  if (patch.color !== NO_DIFF) {
    obj.color = patch.color;
  }
  if (patch.type !== NO_DIFF) {
    obj.type = patch.type;
  }
  if (patch.square !== NO_DIFF) {
    obj.square = patch.square;
  }
  return obj;
}

function patchPlayerState(obj: PlayerState, patch: DeepPartial<PlayerState>) {
  if (patch.board !== NO_DIFF) {
    obj.board = patchArray(obj.board, patch.board, (a, b) => patchPiece(a, b));
  }
  if (patch.status !== NO_DIFF) {
    obj.status = patch.status;
  }
  if (patch.color !== NO_DIFF) {
    obj.color = patch.color;
  }
  if (patch.opponent !== NO_DIFF) {
    obj.opponent = patchOptional(obj.opponent, patch.opponent, (a, b) => b);
  }
  return obj;
}

function patchArray<T>(arr: T[], patch: (typeof NO_DIFF | any)[], innerPatch: (a: T, b: DeepPartial<T>) => T) {
  patch.forEach((val, i) => {
    if (val !== NO_DIFF) {
      if (i >= arr.length) {
        arr.push(val as T);
      } else {
        arr[i] = innerPatch(arr[i], val);
      }
    }
  });
  if (patch.length < arr.length) {
    arr.splice(patch.length);
  }
  return arr;
}

function patchOptional<T>(obj: T | undefined, patch: any, innerPatch: (a: T, b: DeepPartial<T>) => T) {
  if (patch === undefined) {
    return undefined;
  } else if (obj === undefined) {
    return patch as T;
  } else {
    return innerPatch(obj, patch);
  }
}

export function computePatch(state: PlayerState, patch: DeepPartial<PlayerState>) {
  return patchPlayerState(state, patch);
}
