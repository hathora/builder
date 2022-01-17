import {
  NO_DIFF,
  DeepPartial,
  Gesture,
  PlayerInfo,
  PlayerState,
  UserId,
} from "./types";

function diffPlayerInfo(obj: PlayerInfo, prevObj: PlayerInfo): DeepPartial<PlayerInfo> | typeof NO_DIFF {
  return diffObj({
    id: diffPrimitive(obj.id, prevObj.id),
    score: diffPrimitive(obj.score, prevObj.score),
    gesture: diffOptional(obj.gesture, prevObj.gesture, (a, b) => diffPrimitive(a, b)),
  });
}

function diffPlayerState(obj: PlayerState, prevObj: PlayerState): DeepPartial<PlayerState> | typeof NO_DIFF {
  return diffObj({
    round: diffPrimitive(obj.round, prevObj.round),
    player1: diffPlayerInfo(obj.player1, prevObj.player1),
    player2: diffOptional(obj.player2, prevObj.player2, (a, b) => diffPlayerInfo(a, b)),
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
