import {
  NO_DIFF,
  DeepPartial,
  Direction,
  Point,
  Player,
  PlayerState,
  UserId,
} from "./types";

function patchPoint(obj: Point, patch: DeepPartial<Point>) {
  if (patch.x !== NO_DIFF) {
    obj.x = patch.x;
  }
  if (patch.y !== NO_DIFF) {
    obj.y = patch.y;
  }
  return obj;
}

function patchPlayer(obj: Player, patch: DeepPartial<Player>) {
  if (patch.paddle !== NO_DIFF) {
    obj.paddle = patch.paddle;
  }
  if (patch.score !== NO_DIFF) {
    obj.score = patch.score;
  }
  return obj;
}

function patchPlayerState(obj: PlayerState, patch: DeepPartial<PlayerState>) {
  if (patch.playerA !== NO_DIFF) {
    obj.playerA = patchPlayer(obj.playerA, patch.playerA);
  }
  if (patch.playerB !== NO_DIFF) {
    obj.playerB = patchPlayer(obj.playerB, patch.playerB);
  }
  if (patch.ball !== NO_DIFF) {
    obj.ball = patchPoint(obj.ball, patch.ball);
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
