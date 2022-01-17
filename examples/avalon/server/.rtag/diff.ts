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

function diffRoleInfo(obj: RoleInfo, prevObj: RoleInfo): DeepPartial<RoleInfo> | typeof NO_DIFF {
  return diffObj({
    role: diffPrimitive(obj.role, prevObj.role),
    isEvil: diffPrimitive(obj.isEvil, prevObj.isEvil),
    knownRoles: diffArray(obj.knownRoles, prevObj.knownRoles, (a, b) => diffPrimitive(a, b)),
    quantity: diffPrimitive(obj.quantity, prevObj.quantity),
  });
}

function diffPlayerAndVote(obj: PlayerAndVote, prevObj: PlayerAndVote): DeepPartial<PlayerAndVote> | typeof NO_DIFF {
  return diffObj({
    player: diffPrimitive(obj.player, prevObj.player),
    vote: diffOptional(obj.vote, prevObj.vote, (a, b) => diffPrimitive(a, b)),
  });
}

function diffQuestAttempt(obj: QuestAttempt, prevObj: QuestAttempt): DeepPartial<QuestAttempt> | typeof NO_DIFF {
  return diffObj({
    id: diffPrimitive(obj.id, prevObj.id),
    status: diffPrimitive(obj.status, prevObj.status),
    roundNumber: diffPrimitive(obj.roundNumber, prevObj.roundNumber),
    attemptNumber: diffPrimitive(obj.attemptNumber, prevObj.attemptNumber),
    leader: diffPrimitive(obj.leader, prevObj.leader),
    members: diffArray(obj.members, prevObj.members, (a, b) => diffPrimitive(a, b)),
    proposalVotes: diffArray(obj.proposalVotes, prevObj.proposalVotes, (a, b) => diffPlayerAndVote(a, b)),
    results: diffArray(obj.results, prevObj.results, (a, b) => diffPlayerAndVote(a, b)),
    numFailures: diffPrimitive(obj.numFailures, prevObj.numFailures),
  });
}

function diffPlayerState(obj: PlayerState, prevObj: PlayerState): DeepPartial<PlayerState> | typeof NO_DIFF {
  return diffObj({
    status: diffPrimitive(obj.status, prevObj.status),
    rolesInfo: diffArray(obj.rolesInfo, prevObj.rolesInfo, (a, b) => diffRoleInfo(a, b)),
    creator: diffPrimitive(obj.creator, prevObj.creator),
    players: diffArray(obj.players, prevObj.players, (a, b) => diffPrimitive(a, b)),
    role: diffOptional(obj.role, prevObj.role, (a, b) => diffPrimitive(a, b)),
    knownPlayers: diffArray(obj.knownPlayers, prevObj.knownPlayers, (a, b) => diffPrimitive(a, b)),
    playersPerQuest: diffArray(obj.playersPerQuest, prevObj.playersPerQuest, (a, b) => diffPrimitive(a, b)),
    quests: diffArray(obj.quests, prevObj.quests, (a, b) => diffQuestAttempt(a, b)),
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
