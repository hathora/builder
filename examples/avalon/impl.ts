import { Methods } from "./.rtag/methods";
import {
  UserId,
  ICreateGameRequest,
  IJoinGameRequest,
  IStartGameRequest,
  IProposeQuestRequest,
  IVoteForProposalRequest,
  IVoteInQuestRequest,
  PlayerState,
  Role,
  QuestId,
  Vote,
  GameStatus,
  QuestAttempt,
  QuestStatus,
} from "./.rtag/types";
import { shuffle, histogram } from "./utils";

interface InternalQuestAttempt {
  id: QuestId;
  roundNumber: number;
  attemptNumber: number;
  numPlayers: number;
  size: number;
  leader: UserId;
  members: UserId[];
  votes: Map<UserId, Vote>;
  results: Map<UserId, Vote>;
}

interface InternalState {
  creator: UserId;
  players: UserId[];
  roles?: Map<UserId, Role>;
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
  createGame(user: UserId, request: ICreateGameRequest): InternalState {
    return {
      creator: user,
      players: [user],
      quests: [],
    };
  }
  joinGame(state: InternalState, user: UserId, request: IJoinGameRequest): string | void {
    state.players.push(user);
  }
  startGame(state: InternalState, user: UserId, request: IStartGameRequest): string | void {
    if (request.playerOrder !== undefined && request.playerOrder.length > 0) {
      const order = request.playerOrder;
      state.players.sort((a, b) => order.findIndex((u) => u === a) - order.findIndex((u) => u === b));
    } else {
      state.players = shuffle(state.players);
    }
    const leader = request.leader ?? state.players[Math.floor(Math.random() * state.players.length)];
    state.roles = new Map(shuffle(request.roleList).map((role, i) => [state.players[i], role]));
    state.quests.push(createQuest(1, 1, state.players.length, leader));
  }
  proposeQuest(state: InternalState, user: UserId, request: IProposeQuestRequest): string | void {
    const quest = state.quests.find((q) => q.id === request.questId)!;
    quest.members = request.proposedMembers;
  }
  voteForProposal(state: InternalState, user: UserId, request: IVoteForProposalRequest): string | void {
    const quest = state.quests.find((q) => q.id === request.questId)!;
    quest.votes.set(user, request.vote);
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
  }
  voteInQuest(state: InternalState, user: UserId, request: IVoteInQuestRequest): string | void {
    const quest = state.quests.find((q) => q.id === request.questId)!;
    quest.results.set(user, request.vote);
    if (
      quest.results.size === quest.size &&
      numQuestsForStatus(state.quests, QuestStatus.FAILED) < 3 &&
      numQuestsForStatus(state.quests, QuestStatus.PASSED) < 3
    ) {
      state.quests.push(
        createQuest(quest.roundNumber + 1, 1, quest.numPlayers, getNextLeader(quest.leader, state.players))
      );
    }
  }
  getUserState(state: InternalState, user: UserId): PlayerState {
    const role = state.roles?.get(user);
    const roleCounts = histogram([...(state.roles?.values() || [])]);
    return {
      status: gameStatus(state.quests),
      rolesInfo: [...ROLE_KNOWLEDGE].map(([role, knownRoles]) => ({
        role,
        knownRoles,
        isEvil: EVIL_ROLES.has(role),
        quantity: roleCounts.get(role) || 0,
      })),
      creator: state.creator,
      players: state.players,
      role,
      knownPlayers: [...(state.roles?.entries() || [])]
        .filter(([_, r]) => (ROLE_KNOWLEDGE.get(role!) || []).includes(r))
        .map(([p, _]) => p),
      playersPerQuest: QUEST_CONFIGURATIONS.get(state.players.length) || [],
      quests: state.quests.map((q) => sanitizeQuest(q, user)),
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
    id: Math.random().toString(36).substring(2),
    roundNumber,
    attemptNumber,
    numPlayers: numPlayers,
    size: QUEST_CONFIGURATIONS.get(numPlayers)![roundNumber - 1],
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

function sanitizeQuest(quest: InternalQuestAttempt, user: UserId): QuestAttempt {
  return {
    id: quest.id,
    status: questStatus(quest),
    roundNumber: quest.roundNumber,
    attemptNumber: quest.attemptNumber,
    leader: quest.leader,
    members: quest.members,
    proposalVotes: [...quest.votes.entries()].map(([player, vote]) => ({
      player,
      vote: player === user || quest.votes.size === quest.numPlayers ? vote : undefined,
    })),
    results: [...quest.results.entries()].map(([player, vote]) => ({
      player,
      vote: player === user || quest.results.size === quest.size ? vote : undefined,
    })),
    numFailures: numFails(quest.results),
  };
}

function gameStatus(quests: InternalQuestAttempt[]) {
  if (quests.length === 0) {
    return GameStatus.NOT_STARTED;
  } else if (numQuestsForStatus(quests, QuestStatus.FAILED) > 2 || exceededQuestAttempts(quests[quests.length - 1])) {
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
  return numFails(quest.results) >= maxFails(quest.numPlayers, quest.roundNumber)
    ? QuestStatus.FAILED
    : QuestStatus.PASSED;
}

function numQuestsForStatus(quests: InternalQuestAttempt[], status: QuestStatus): number {
  return quests.filter((q) => questStatus(q) === status).length;
}

function numFails(votes: Map<UserId, Vote>) {
  return [...votes.values()].filter((vote) => vote === Vote.FAIL).length;
}

function maxFails(numPlayers: number, round: number): number {
  return numPlayers > 6 && round === 4 ? 2 : 1;
}

function exceededQuestAttempts(quest: InternalQuestAttempt): boolean {
  return quest.attemptNumber === 5 && questStatus(quest) === QuestStatus.PROPOSAL_REJECTED;
}
