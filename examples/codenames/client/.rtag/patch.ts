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

function patchPlayerInfo(obj: PlayerInfo, patch: DeepPartial<PlayerInfo>) {
  if (patch.id !== NO_DIFF) {
    obj.id = patch.id;
  }
  if (patch.team !== NO_DIFF) {
    obj.team = patch.team;
  }
  if (patch.isSpymaster !== NO_DIFF) {
    obj.isSpymaster = patch.isSpymaster;
  }
  return obj;
}

function patchCard(obj: Card, patch: DeepPartial<Card>) {
  if (patch.word !== NO_DIFF) {
    obj.word = patch.word;
  }
  if (patch.color !== NO_DIFF) {
    obj.color = patchOptional(obj.color, patch.color, (a, b) => b);
  }
  if (patch.selectedBy !== NO_DIFF) {
    obj.selectedBy = patchOptional(obj.selectedBy, patch.selectedBy, (a, b) => b);
  }
  return obj;
}

function patchTurnInfo(obj: TurnInfo, patch: DeepPartial<TurnInfo>) {
  if (patch.hint !== NO_DIFF) {
    obj.hint = patch.hint;
  }
  if (patch.amount !== NO_DIFF) {
    obj.amount = patch.amount;
  }
  if (patch.guessed !== NO_DIFF) {
    obj.guessed = patch.guessed;
  }
  return obj;
}

function patchPlayerState(obj: PlayerState, patch: DeepPartial<PlayerState>) {
  if (patch.players !== NO_DIFF) {
    obj.players = patchArray(obj.players, patch.players, (a, b) => patchPlayerInfo(a, b));
  }
  if (patch.gameStatus !== NO_DIFF) {
    obj.gameStatus = patch.gameStatus;
  }
  if (patch.currentTurn !== NO_DIFF) {
    obj.currentTurn = patch.currentTurn;
  }
  if (patch.turnInfo !== NO_DIFF) {
    obj.turnInfo = patchOptional(obj.turnInfo, patch.turnInfo, (a, b) => patchTurnInfo(a, b));
  }
  if (patch.redRemaining !== NO_DIFF) {
    obj.redRemaining = patch.redRemaining;
  }
  if (patch.blueRemaining !== NO_DIFF) {
    obj.blueRemaining = patch.blueRemaining;
  }
  if (patch.cards !== NO_DIFF) {
    obj.cards = patchArray(obj.cards, patch.cards, (a, b) => patchCard(a, b));
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
