import {
  NO_DIFF,
  DeepPartial,
  QuestId,
  Role,
  Vote,
  QuestStatus,
  GameStatus,
  RoleInfo,
  PlayerAndVote,
  QuestAttempt,
  PlayerState,
  UserId,
} from "./types";

function patchRoleInfo(obj: RoleInfo, patch: DeepPartial<RoleInfo>) {
  if (patch.role !== NO_DIFF) {
    obj.role = patch.role;
  }
  if (patch.isEvil !== NO_DIFF) {
    obj.isEvil = patch.isEvil;
  }
  if (patch.knownRoles !== NO_DIFF) {
    obj.knownRoles = patchArray(obj.knownRoles, patch.knownRoles, (a, b) => b);
  }
  if (patch.quantity !== NO_DIFF) {
    obj.quantity = patch.quantity;
  }
  return obj;
}

function patchPlayerAndVote(obj: PlayerAndVote, patch: DeepPartial<PlayerAndVote>) {
  if (patch.player !== NO_DIFF) {
    obj.player = patch.player;
  }
  if (patch.vote !== NO_DIFF) {
    obj.vote = patchOptional(obj.vote, patch.vote, (a, b) => b);
  }
  return obj;
}

function patchQuestAttempt(obj: QuestAttempt, patch: DeepPartial<QuestAttempt>) {
  if (patch.id !== NO_DIFF) {
    obj.id = patch.id;
  }
  if (patch.status !== NO_DIFF) {
    obj.status = patch.status;
  }
  if (patch.roundNumber !== NO_DIFF) {
    obj.roundNumber = patch.roundNumber;
  }
  if (patch.attemptNumber !== NO_DIFF) {
    obj.attemptNumber = patch.attemptNumber;
  }
  if (patch.leader !== NO_DIFF) {
    obj.leader = patch.leader;
  }
  if (patch.members !== NO_DIFF) {
    obj.members = patchArray(obj.members, patch.members, (a, b) => b);
  }
  if (patch.proposalVotes !== NO_DIFF) {
    obj.proposalVotes = patchArray(obj.proposalVotes, patch.proposalVotes, (a, b) => patchPlayerAndVote(a, b));
  }
  if (patch.results !== NO_DIFF) {
    obj.results = patchArray(obj.results, patch.results, (a, b) => patchPlayerAndVote(a, b));
  }
  if (patch.numFailures !== NO_DIFF) {
    obj.numFailures = patch.numFailures;
  }
  return obj;
}

function patchPlayerState(obj: PlayerState, patch: DeepPartial<PlayerState>) {
  if (patch.status !== NO_DIFF) {
    obj.status = patch.status;
  }
  if (patch.rolesInfo !== NO_DIFF) {
    obj.rolesInfo = patchArray(obj.rolesInfo, patch.rolesInfo, (a, b) => patchRoleInfo(a, b));
  }
  if (patch.creator !== NO_DIFF) {
    obj.creator = patch.creator;
  }
  if (patch.players !== NO_DIFF) {
    obj.players = patchArray(obj.players, patch.players, (a, b) => b);
  }
  if (patch.role !== NO_DIFF) {
    obj.role = patchOptional(obj.role, patch.role, (a, b) => b);
  }
  if (patch.knownPlayers !== NO_DIFF) {
    obj.knownPlayers = patchArray(obj.knownPlayers, patch.knownPlayers, (a, b) => b);
  }
  if (patch.playersPerQuest !== NO_DIFF) {
    obj.playersPerQuest = patchArray(obj.playersPerQuest, patch.playersPerQuest, (a, b) => b);
  }
  if (patch.quests !== NO_DIFF) {
    obj.quests = patchArray(obj.quests, patch.quests, (a, b) => patchQuestAttempt(a, b));
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
