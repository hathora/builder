import {
  NO_DIFF,
  DeepPartial,
  Gesture,
  PlayerInfo,
  PlayerState,
  UserId,
} from "./types";

function patchPlayerInfo(obj: PlayerInfo, patch: DeepPartial<PlayerInfo>) {
  if (patch.id !== NO_DIFF) {
    obj.id = patch.id;
  }
  if (patch.score !== NO_DIFF) {
    obj.score = patch.score;
  }
  if (patch.gesture !== NO_DIFF) {
    obj.gesture = patchOptional(obj.gesture, patch.gesture, (a, b) => b);
  }
  return obj;
}

function patchPlayerState(obj: PlayerState, patch: DeepPartial<PlayerState>) {
  if (patch.round !== NO_DIFF) {
    obj.round = patch.round;
  }
  if (patch.player1 !== NO_DIFF) {
    obj.player1 = patchPlayerInfo(obj.player1, patch.player1);
  }
  if (patch.player2 !== NO_DIFF) {
    obj.player2 = patchOptional(obj.player2, patch.player2, (a, b) => patchPlayerInfo(a, b));
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
