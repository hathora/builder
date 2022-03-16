import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  UserId,
  PlayerState,
  IJoinGameRequest,
  IStartGameRequest,
  IProposeQuestRequest,
  IVoteForProposalRequest,
  IVoteInQuestRequest,
  Role,
  Vote,
  GameStatus,
  QuestAttempt,
  QuestStatus,
} from "../api/types";

type InternalQuestAttempt = {
  roundNumber: number;
  attemptNumber: number;
  numPlayers: number;
  leader: UserId;
  members: UserId[];
  votes: Map<UserId, Vote>;
  results: Map<UserId, Vote>;
};

type InternalState = {
  creator: UserId;
  players: UserId[];
  roles: Map<UserId, Role>;
  quests: InternalQuestAttempt[];
};

const ROLES_INFO: Map<Role, { isEvil: boolean; knownRoles: Set<Role> }> = new Map([
  [Role.MERLIN, { isEvil: false, knownRoles: new Set([Role.MORGANA, Role.ASSASSIN, Role.MINION, Role.OBERON]) }],
  [Role.PERCIVAL, { isEvil: false, knownRoles: new Set([Role.MERLIN, Role.MORGANA]) }],
  [Role.LOYAL_SERVANT, { isEvil: false, knownRoles: new Set() }],
  [Role.MORGANA, { isEvil: true, knownRoles: new Set([Role.MORDRED, Role.ASSASSIN, Role.MINION]) }],
  [Role.MORDRED, { isEvil: true, knownRoles: new Set([Role.MORGANA, Role.ASSASSIN, Role.MINION]) }],
  [Role.OBERON, { isEvil: true, knownRoles: new Set() }],
  [Role.ASSASSIN, { isEvil: true, knownRoles: new Set([Role.MORGANA, Role.MORDRED, Role.MINION]) }],
  [Role.MINION, { isEvil: true, knownRoles: new Set([Role.MORGANA, Role.MORDRED, Role.ASSASSIN, Role.MINION]) }],
]);

const QUEST_CONFIGURATIONS = new Map([
  [5, [2, 3, 2, 3, 3]],
  [6, [2, 3, 4, 3, 4]],
  [7, [2, 3, 3, 4, 4]],
  [8, [3, 4, 4, 5, 5]],
  [9, [3, 4, 4, 5, 5]],
  [10, [3, 4, 4, 5, 5]],
]);

export class Impl implements Methods<InternalState> {
  async initialize(userId: UserId, ctx: Context): Promise<InternalState> {
    return { creator: userId, players: [userId], roles: new Map(), quests: [] };
  }
  async joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest) {
    if (state.players.find((player) => player === userId) !== undefined) {
      return Response.error("Already joined");
    }
    if (state.roles.size > 0) {
      return Response.error("Game already started");
    }
    state.players.push(userId);
    return Response.ok();
  }
  async startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest) {
    if (!QUEST_CONFIGURATIONS.has(state.players.length)) {
      return Response.error("Invalid number of players");
    }
    if (request.roleList.length !== state.players.length) {
      return Response.error("Wrong number of roles");
    }
    if (request.leader !== undefined && !state.players.includes(request.leader)) {
      return Response.error("Invalid leader");
    }
    if (request.playerOrder.length > 0) {
      if (
        request.playerOrder.length !== state.players.length ||
        !state.players.every((player) => request.playerOrder.includes(player))
      ) {
        return Response.error("Invalid player order");
      }
      state.players = request.playerOrder;
    } else {
      state.players = ctx.chance.shuffle(state.players);
    }
    state.roles = new Map(ctx.chance.shuffle(request.roleList).map((role, i) => [state.players[i], role]));
    const leader = request.leader ?? ctx.chance.pickone(state.players);
    state.quests.push(createQuest(1, 1, state.players.length, leader));
    return Response.ok();
  }
  async proposeQuest(state: InternalState, userId: UserId, ctx: Context, request: IProposeQuestRequest) {
    const quest = state.quests.find((q) => questId(q) === request.questId)!;
    if (quest === undefined) {
      return Response.error("Invalid questId");
    }
    if (quest.members.length > 0) {
      return Response.error("Quest already in progress");
    }
    if (quest.leader !== userId) {
      return Response.error("Not quest leader");
    }
    if (request.proposedMembers.length !== questSize(quest)) {
      return Response.error("Wrong quest size");
    }
    if (
      !request.proposedMembers.every((member) => state.players.includes(member)) ||
      new Set(request.proposedMembers).size < request.proposedMembers.length
    ) {
      return Response.error("Invalid members");
    }
    quest.members = request.proposedMembers;
    return Response.ok();
  }
  async voteForProposal(state: InternalState, userId: UserId, ctx: Context, request: IVoteForProposalRequest) {
    const quest = state.quests.find((q) => questId(q) === request.questId);
    if (quest === undefined) {
      return Response.error("Invalid questId");
    }
    if (questStatus(quest) !== QuestStatus.VOTING_FOR_PROPOSAL) {
      return Response.error("Not voting for proposal");
    }
    quest.votes.set(userId, request.vote);
    if (questStatus(quest) === QuestStatus.PROPOSAL_REJECTED && quest.attemptNumber < 5) {
      state.quests.push(
        createQuest(
          quest.roundNumber,
          quest.attemptNumber + 1,
          quest.numPlayers,
          getNextLeader(quest.leader, state.players)
        )
      );
    }
    return Response.ok();
  }
  async voteInQuest(state: InternalState, userId: UserId, ctx: Context, request: IVoteInQuestRequest) {
    const quest = state.quests.find((q) => questId(q) === request.questId);
    if (quest === undefined) {
      return Response.error("Invalid questId");
    }
    if (questStatus(quest) !== QuestStatus.VOTING_IN_QUEST) {
      return Response.error("Not voting in quest");
    }
    if (!quest.members.includes(userId)) {
      return Response.error("Not participating in quest");
    }
    quest.results.set(userId, request.vote);
    if (
      quest.results.size === questSize(quest) &&
      numQuestsForStatus(state.quests, QuestStatus.FAILED) < 3 &&
      numQuestsForStatus(state.quests, QuestStatus.PASSED) < 3
    ) {
      state.quests.push(
        createQuest(quest.roundNumber + 1, 1, quest.numPlayers, getNextLeader(quest.leader, state.players))
      );
    }
    return Response.ok();
  }
  async getUserState(state: InternalState, userId: UserId): Promise<PlayerState> {
    const role = state.roles.get(userId);
    const roles = [...state.roles];
    const knownRoles = role !== undefined ? ROLES_INFO.get(role)!.knownRoles : new Set();
    return {
      status: gameStatus(state.quests),
      rolesInfo: [...ROLES_INFO].map(([rl, info]) => ({
        role: rl,
        isEvil: info.isEvil,
        knownRoles: [...info.knownRoles],
        quantity: roles.filter(([_, r]) => r === rl).length,
      })),
      creator: state.creator,
      players: state.players,
      role,
      knownPlayers: roles.filter(([_, r]) => knownRoles.has(r)).map(([p, _]) => p),
      playersPerQuest: QUEST_CONFIGURATIONS.get(state.players.length) || [],
      quests: state.quests.map((q) => sanitizeQuest(q, userId)),
    };
  }
}

function createQuest(
  roundNumber: number,
  attemptNumber: number,
  numPlayers: number,
  leader: UserId
): InternalQuestAttempt {
  return {
    roundNumber,
    attemptNumber,
    numPlayers,
    leader,
    members: [],
    votes: new Map(),
    results: new Map(),
  };
}

function getNextLeader(leader: UserId, players: UserId[]) {
  const idx = players.findIndex((p) => p === leader);
  return players[(idx + 1) % players.length];
}

function sanitizeQuest(quest: InternalQuestAttempt, userId: UserId): QuestAttempt {
  return {
    id: questId(quest),
    status: questStatus(quest),
    roundNumber: quest.roundNumber,
    attemptNumber: quest.attemptNumber,
    leader: quest.leader,
    members: quest.members,
    proposalVotes: [...quest.votes].map(([player, vote]) => ({
      player,
      vote: player === userId || quest.votes.size === quest.numPlayers ? vote : undefined,
    })),
    results: [...quest.results].map(([player, vote]) => ({
      player,
      vote: player === userId ? vote : undefined,
    })),
    numFailures: quest.results.size === questSize(quest) ? numFails(quest.results) : 0,
  };
}

function gameStatus(quests: InternalQuestAttempt[]) {
  if (quests.length === 0) {
    return GameStatus.NOT_STARTED;
  } else if (numQuestsForStatus(quests, QuestStatus.FAILED) > 2 || exceededQuestAttempts(quests.slice(-1)[0])) {
    return GameStatus.EVIL_WON;
  } else if (numQuestsForStatus(quests, QuestStatus.PASSED) > 2) {
    return GameStatus.GOOD_WON;
  }
  return GameStatus.IN_PROGRESS;
}

function numQuestsForStatus(quests: InternalQuestAttempt[], status: QuestStatus): number {
  return quests.filter((q) => questStatus(q) === status).length;
}

function questId(quest: InternalQuestAttempt) {
  return (quest.roundNumber - 1) * QUEST_CONFIGURATIONS.get(quest.numPlayers)!.length + (quest.attemptNumber - 1);
}

function questStatus(quest: InternalQuestAttempt) {
  if (quest.members.length === 0) {
    return QuestStatus.PROPOSING_QUEST;
  } else if (quest.votes.size < quest.numPlayers) {
    return QuestStatus.VOTING_FOR_PROPOSAL;
  } else if (numFails(quest.votes) * 2 >= quest.numPlayers) {
    return QuestStatus.PROPOSAL_REJECTED;
  } else if (quest.results.size < questSize(quest)) {
    return QuestStatus.VOTING_IN_QUEST;
  }
  return numFails(quest.results) >= maxFails(quest) ? QuestStatus.FAILED : QuestStatus.PASSED;
}

function questSize(quest: InternalQuestAttempt) {
  return QUEST_CONFIGURATIONS.get(quest.numPlayers)![quest.roundNumber - 1];
}

function numFails(votes: Map<UserId, Vote>) {
  return [...votes].filter(([_, vote]) => vote === Vote.FAIL).length;
}

function maxFails(quest: InternalQuestAttempt): number {
  return quest.numPlayers > 6 && quest.roundNumber === 4 ? 2 : 1;
}

function exceededQuestAttempts(quest: InternalQuestAttempt): boolean {
  return quest.attemptNumber === 5 && questStatus(quest) === QuestStatus.PROPOSAL_REJECTED;
}
