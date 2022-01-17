import {
  NO_DIFF,
  DeepPartial,
  PlayerStatus,
  Card,
  PlayerInfo,
  PlayerState,
  UserId,
} from "./types";

function diffCard(obj: Card, prevObj: Card): DeepPartial<Card> | typeof NO_DIFF {
  return diffObj({
    rank: diffPrimitive(obj.rank, prevObj.rank),
    suit: diffPrimitive(obj.suit, prevObj.suit),
  });
}

function diffPlayerInfo(obj: PlayerInfo, prevObj: PlayerInfo): DeepPartial<PlayerInfo> | typeof NO_DIFF {
  return diffObj({
    id: diffPrimitive(obj.id, prevObj.id),
    chipCount: diffPrimitive(obj.chipCount, prevObj.chipCount),
    chipsInPot: diffPrimitive(obj.chipsInPot, prevObj.chipsInPot),
    cards: diffArray(obj.cards, prevObj.cards, (a, b) => diffCard(a, b)),
    status: diffPrimitive(obj.status, prevObj.status),
  });
}

function diffPlayerState(obj: PlayerState, prevObj: PlayerState): DeepPartial<PlayerState> | typeof NO_DIFF {
  return diffObj({
    players: diffArray(obj.players, prevObj.players, (a, b) => diffPlayerInfo(a, b)),
    dealer: diffPrimitive(obj.dealer, prevObj.dealer),
    activePlayer: diffPrimitive(obj.activePlayer, prevObj.activePlayer),
    revealedCards: diffArray(obj.revealedCards, prevObj.revealedCards, (a, b) => diffCard(a, b)),
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
