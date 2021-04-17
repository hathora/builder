import { Context, Methods } from "./.rtag/methods";
import {
  UserData,
  Result,
  PlayerState,
  ICreateGameRequest,
  IJoinGameRequest,
  IStartGameRequest,
  IProposeQuestRequest,
  IVoteForProposalRequest,
  IVoteInQuestRequest,
  Username,
  Role,
  QuestId,
  Vote,
  GameStatus,
  QuestAttempt,
  QuestStatus,
} from "./.rtag/types";
import { shuffle } from "./utils";

interface InternalQuestAttempt {
  id: QuestId;
  roundNumber: number;
  attemptNumber: number;
  numPlayers: number;
  size: number;
  leader: Username;
  members: Username[];
  votes: Map<Username, Vote>;
  results: Map<Username, Vote>;
}

interface InternalState {
  creator: Username;
  players: Username[];
  roles: Map<Username, Role>;
  quests: InternalQuestAttempt[];
}

const ROLE_KNOWLEDGE = new Map([
  [Role.MERLIN, [Role.MORGANA, Role.ASSASSIN, Role.MINION, Role.OBERON]],
  [Role.PERCIVAL, [Role.MERLIN, Role.MORGANA]],
  [Role.LOYAL_SERVANT, []],
  [Role.MORGANA, [Role.MORDRED, Role.ASSASSIN, Role.MINION]],
  [Role.MORDRED, [Role.MORGANA, Role.ASSASSIN, Role.MINION]],
  [Role.OBERON, []],
  [Role.ASSASSIN, [Role.MORGANA, Role.MORDRED, Role.MINION]],
  [Role.MINION, [Role.MORGANA, Role.MORDRED, Role.ASSASSIN, Role.MINION]],
]);

const EVIL_ROLES = new Set([Role.MORGANA, Role.MORGANA, Role.OBERON, Role.ASSASSIN, Role.MINION]);

const QUEST_CONFIGURATIONS = new Map([
  [5, [2, 3, 2, 3, 3]],
  [6, [2, 3, 4, 3, 4]],
  [7, [2, 3, 3, 4, 4]],
  [8, [3, 4, 4, 5, 5]],
  [9, [3, 4, 4, 5, 5]],
  [10, [3, 4, 4, 5, 5]],
]);

export class Impl implements Methods<InternalState> {
  createGame(user: UserData, ctx: Context, request: ICreateGameRequest): InternalState {
    return {
      creator: user.name,
      players: [user.name],
      roles: new Map(),
      quests: [],
    };
  }
  joinGame(state: InternalState, user: UserData, ctx: Context, request: IJoinGameRequest): Result {
    state.players.push(user.name);
    return Result.success();
  }
  startGame(state: InternalState, user: UserData, ctx: Context, request: IStartGameRequest): Result {
    if (!QUEST_CONFIGURATIONS.has(state.players.length)) {
      return Result.error("Invalid number of players");
    }
    if (request.playerOrder !== undefined && request.playerOrder.length > 0) {
      state.players = request.playerOrder;
    } else {
      state.players = shuffle(ctx.randInt, state.players);
    }
    const leader = request.leader ?? state.players[ctx.randInt() % state.players.length];
    state.roles = new Map(shuffle(ctx.randInt, request.roleList).map((role, i) => [state.players[i], role]));
    state.quests.push(createQuest(1, 1, state.players.length, leader));
    return Result.success();
  }
  proposeQuest(state: InternalState, user: UserData, ctx: Context, request: IProposeQuestRequest): Result {
    const quest = state.quests.find((q) => q.id === request.questId)!;
    quest.members = request.proposedMembers;
    return Result.success();
  }
  voteForProposal(state: InternalState, user: UserData, ctx: Context, request: IVoteForProposalRequest): Result {
    const quest = state.quests.find((q) => q.id === request.questId)!;
    quest.votes.set(user.name, request.vote);
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
    return Result.success();
  }
  voteInQuest(state: InternalState, user: UserData, ctx: Context, request: IVoteInQuestRequest): Result {
    const quest = state.quests.find((q) => q.id === request.questId)!;
    quest.results.set(user.name, request.vote);
    if (
      quest.results.size === quest.size &&
      numQuestsForStatus(state.quests, QuestStatus.FAILED) < 3 &&
      numQuestsForStatus(state.quests, QuestStatus.PASSED) < 3
    ) {
      state.quests.push(
        createQuest(quest.roundNumber + 1, 1, quest.numPlayers, getNextLeader(quest.leader, state.players))
      );
    }
    return Result.success();
  }
  getUserState(state: InternalState, user: UserData, ctx: Context): PlayerState {
    const role = state.roles.get(user.name);
    return {
      status: gameStatus(state.quests),
      rolesInfo: [...ROLE_KNOWLEDGE].map(([role, knownRoles]) => ({
        role,
        knownRoles,
        isEvil: EVIL_ROLES.has(role),
        quantity: [...state.roles.values()].filter((r) => r === role).length,
      })),
      creator: state.creator,
      players: state.players,
      role,
      knownPlayers: [...state.roles.entries()]
        .filter(([_, r]) => (ROLE_KNOWLEDGE.get(role!) || []).includes(r))
        .map(([p, _]) => p),
      playersPerQuest: QUEST_CONFIGURATIONS.get(state.players.length) || [],
      quests: state.quests.map((q) => sanitizeQuest(q, user.name)),
    };
  }
}

function createQuest(
  roundNumber: number,
  attemptNumber: number,
  numPlayers: number,
  leader: Username
): InternalQuestAttempt {
  const playersPerRound = QUEST_CONFIGURATIONS.get(numPlayers)!;
  return {
    id: (roundNumber - 1) * playersPerRound.length + (attemptNumber - 1),
    roundNumber,
    attemptNumber,
    numPlayers,
    size: playersPerRound[roundNumber - 1],
    leader,
    members: [],
    votes: new Map(),
    results: new Map(),
  };
}

function getNextLeader(leader: Username, players: Username[]) {
  const idx = players.findIndex((p) => p === leader);
  return players[(idx + 1) % players.length];
}

function sanitizeQuest(quest: InternalQuestAttempt, username: Username): QuestAttempt {
  return {
    id: quest.id,
    status: questStatus(quest),
    roundNumber: quest.roundNumber,
    attemptNumber: quest.attemptNumber,
    leader: quest.leader,
    members: quest.members,
    proposalVotes: [...quest.votes.entries()].map(([player, vote]) => ({
      player,
      vote: player === username || quest.votes.size === quest.numPlayers ? vote : undefined,
    })),
    results: [...quest.results.entries()].map(([player, vote]) => ({
      player,
      vote: player === username || quest.results.size === quest.size ? vote : undefined,
    })),
    numFailures: numFails(quest.results),
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

function questStatus(quest: InternalQuestAttempt) {
  if (quest.members.length === 0) {
    return QuestStatus.PROPOSING_QUEST;
  } else if (quest.votes.size < quest.numPlayers) {
    return QuestStatus.VOTING_FOR_PROPOSAL;
  } else if (numFails(quest.votes) * 2 >= quest.numPlayers) {
    return QuestStatus.PROPOSAL_REJECTED;
  } else if (quest.results.size < quest.size) {
    return QuestStatus.VOTING_IN_QUEST;
  }
  return numFails(quest.results) >= maxFails(quest) ? QuestStatus.FAILED : QuestStatus.PASSED;
}

function numQuestsForStatus(quests: InternalQuestAttempt[], status: QuestStatus): number {
  return quests.filter((q) => questStatus(q) === status).length;
}

function numFails(votes: Map<Username, Vote>) {
  return [...votes.values()].filter((vote) => vote === Vote.FAIL).length;
}

function maxFails(quest: InternalQuestAttempt): number {
  return quest.numPlayers > 6 && quest.roundNumber === 4 ? 2 : 1;
}

function exceededQuestAttempts(quest: InternalQuestAttempt): boolean {
  return quest.attemptNumber === 5 && questStatus(quest) === QuestStatus.PROPOSAL_REJECTED;
}
