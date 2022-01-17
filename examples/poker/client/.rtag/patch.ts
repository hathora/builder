import {
  NO_DIFF,
  DeepPartial,
  PlayerStatus,
  Card,
  PlayerInfo,
  PlayerState,
  UserId,
} from "./types";

function patchCard(obj: Card, patch: DeepPartial<Card>) {
  if (patch.rank !== NO_DIFF) {
    obj.rank = patch.rank;
  }
  if (patch.suit !== NO_DIFF) {
    obj.suit = patch.suit;
  }
  return obj;
}

function patchPlayerInfo(obj: PlayerInfo, patch: DeepPartial<PlayerInfo>) {
  if (patch.id !== NO_DIFF) {
    obj.id = patch.id;
  }
  if (patch.chipCount !== NO_DIFF) {
    obj.chipCount = patch.chipCount;
  }
  if (patch.chipsInPot !== NO_DIFF) {
    obj.chipsInPot = patch.chipsInPot;
  }
  if (patch.cards !== NO_DIFF) {
    obj.cards = patchArray(obj.cards, patch.cards, (a, b) => patchCard(a, b));
  }
  if (patch.status !== NO_DIFF) {
    obj.status = patch.status;
  }
  return obj;
}

function patchPlayerState(obj: PlayerState, patch: DeepPartial<PlayerState>) {
  if (patch.players !== NO_DIFF) {
    obj.players = patchArray(obj.players, patch.players, (a, b) => patchPlayerInfo(a, b));
  }
  if (patch.dealer !== NO_DIFF) {
    obj.dealer = patch.dealer;
  }
  if (patch.activePlayer !== NO_DIFF) {
    obj.activePlayer = patch.activePlayer;
  }
  if (patch.revealedCards !== NO_DIFF) {
    obj.revealedCards = patchArray(obj.revealedCards, patch.revealedCards, (a, b) => patchCard(a, b));
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
