import {
  NO_DIFF,
  DeepPartial,
  Cards,
  Color,
  PlayerInfo,
  Card,
  GameStatus,
  TurnInfo,
  PlayerState,
  UserId,
} from "./types";

function diffPlayerInfo(obj: PlayerInfo, prevObj: PlayerInfo): DeepPartial<PlayerInfo> | typeof NO_DIFF {
  return diffObj({
    id: diffPrimitive(obj.id, prevObj.id),
    team: diffPrimitive(obj.team, prevObj.team),
    isSpymaster: diffPrimitive(obj.isSpymaster, prevObj.isSpymaster),
  });
}

function diffCard(obj: Card, prevObj: Card): DeepPartial<Card> | typeof NO_DIFF {
  return diffObj({
    word: diffPrimitive(obj.word, prevObj.word),
    color: diffOptional(obj.color, prevObj.color, (a, b) => diffPrimitive(a, b)),
    selectedBy: diffOptional(obj.selectedBy, prevObj.selectedBy, (a, b) => diffPrimitive(a, b)),
  });
}

function diffTurnInfo(obj: TurnInfo, prevObj: TurnInfo): DeepPartial<TurnInfo> | typeof NO_DIFF {
  return diffObj({
    hint: diffPrimitive(obj.hint, prevObj.hint),
    amount: diffPrimitive(obj.amount, prevObj.amount),
    guessed: diffPrimitive(obj.guessed, prevObj.guessed),
  });
}

function diffPlayerState(obj: PlayerState, prevObj: PlayerState): DeepPartial<PlayerState> | typeof NO_DIFF {
  return diffObj({
    players: diffArray(obj.players, prevObj.players, (a, b) => diffPlayerInfo(a, b)),
    gameStatus: diffPrimitive(obj.gameStatus, prevObj.gameStatus),
    currentTurn: diffPrimitive(obj.currentTurn, prevObj.currentTurn),
    turnInfo: diffOptional(obj.turnInfo, prevObj.turnInfo, (a, b) => diffTurnInfo(a, b)),
    redRemaining: diffPrimitive(obj.redRemaining, prevObj.redRemaining),
    blueRemaining: diffPrimitive(obj.blueRemaining, prevObj.blueRemaining),
    cards: diffArray(obj.cards, prevObj.cards, (a, b) => diffCard(a, b)),
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
