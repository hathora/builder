import {
  NO_DIFF,
  DeepPartial,
  Direction,
  Point,
  Player,
  PlayerState,
  UserId,
} from "./types";

function diffPoint(obj: Point, prevObj: Point): DeepPartial<Point> | typeof NO_DIFF {
  return diffObj({
    x: diffPrimitive(obj.x, prevObj.x),
    y: diffPrimitive(obj.y, prevObj.y),
  });
}

function diffPlayer(obj: Player, prevObj: Player): DeepPartial<Player> | typeof NO_DIFF {
  return diffObj({
    paddle: diffPrimitive(obj.paddle, prevObj.paddle),
    score: diffPrimitive(obj.score, prevObj.score),
  });
}

function diffPlayerState(obj: PlayerState, prevObj: PlayerState): DeepPartial<PlayerState> | typeof NO_DIFF {
  return diffObj({
    playerA: diffPlayer(obj.playerA, prevObj.playerA),
    playerB: diffPlayer(obj.playerB, prevObj.playerB),
    ball: diffPoint(obj.ball, prevObj.ball),
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
