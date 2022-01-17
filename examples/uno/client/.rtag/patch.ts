import {
  NO_DIFF,
  DeepPartial,
  Color,
  Card,
  PlayerState,
  UserId,
} from "./types";

function patchCard(obj: Card, patch: DeepPartial<Card>) {
  if (patch.value !== NO_DIFF) {
    obj.value = patch.value;
  }
  if (patch.color !== NO_DIFF) {
    obj.color = patch.color;
  }
  return obj;
}

function patchPlayerState(obj: PlayerState, patch: DeepPartial<PlayerState>) {
  if (patch.hand !== NO_DIFF) {
    obj.hand = patchArray(obj.hand, patch.hand, (a, b) => patchCard(a, b));
  }
  if (patch.players !== NO_DIFF) {
    obj.players = patchArray(obj.players, patch.players, (a, b) => b);
  }
  if (patch.turn !== NO_DIFF) {
    obj.turn = patch.turn;
  }
  if (patch.pile !== NO_DIFF) {
    obj.pile = patchOptional(obj.pile, patch.pile, (a, b) => patchCard(a, b));
  }
  if (patch.winner !== NO_DIFF) {
    obj.winner = patchOptional(obj.winner, patch.winner, (a, b) => b);
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
