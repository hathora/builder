import { Methods } from "./.lsot/methods";
import {
  PlayerData,
  ICreateGameRequest,
  IJoinGameRequest,
  IStartGameRequest,
  IProposeQuestRequest,
  IVoteForProposalRequest,
  IVoteInQuestRequest,
  PlayerState,
  PlayerName,
  Role,
  QuestId,
  Vote,
  GameStatus,
  QuestAttempt,
  QuestStatus,
} from "./.lsot/types";

interface InternalPlayer {
  name: PlayerName;
  role?: Role;
}

interface InternalQuestAttempt {
  id: QuestId;
  roundNumber: number;
  attemptNumber: number;
  size: number;
  leader: PlayerName;
  members: PlayerName[];
  votes: Map<PlayerName, Vote>;
  results: Map<PlayerName, Vote>;
}

interface InternalState {
  creator: PlayerName;
  players: InternalPlayer[];
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
  createGame(userData: PlayerData, request: ICreateGameRequest): InternalState {
    return {
      creator: userData.playerName,
      players: [{ name: userData.playerName }],
      quests: [],
    };
  }
  joinGame(state: InternalState, userData: PlayerData, request: IJoinGameRequest): string | void {
    state.players.push({ name: userData.playerName });
  }
  startGame(state: InternalState, userData: PlayerData, request: IStartGameRequest): string | void {
    const numPlayers = state.players.length;
    const leader = state.players[Math.floor(Math.random() * numPlayers)].name;
    shuffle(request.roleList).forEach((role, i) => (state.players[i].role = role));
    state.quests.push(createQuest(1, 1, numPlayers, leader));
  }
  proposeQuest(state: InternalState, userData: PlayerData, request: IProposeQuestRequest): string | void {
    const quest = state.quests.find((q) => q.id == request.questId)!;
    quest.members = request.proposedMembers;
  }
  voteForProposal(state: InternalState, userData: PlayerData, request: IVoteForProposalRequest): string | void {
    const player = state.players.find((p) => p.name == userData.playerName)!;
    const quest = state.quests.find((q) => q.id == request.questId)!;
    const numPlayers = state.players.length;
    quest.votes.set(player.name, request.vote);
    if (quest.votes.size === numPlayers && numFails(quest.votes) * 2 >= numPlayers) {
      state.quests.push(
        createQuest(quest.roundNumber, quest.attemptNumber + 1, numPlayers, getNextLeader(quest.leader, state.players))
      );
    }
  }
  voteInQuest(state: InternalState, userData: PlayerData, request: IVoteInQuestRequest): string | void {
    const player = state.players.find((p) => p.name == userData.playerName)!;
    const quest = state.quests.find((q) => q.id == request.questId)!;
    const numPlayers = state.players.length;
    quest.results.set(player.name, request.vote);
    if (quest.results.size == quest.size && quest.roundNumber <= 5) {
      state.quests.push(createQuest(quest.roundNumber + 1, 1, numPlayers, getNextLeader(quest.leader, state.players)));
    }
  }
  getUserState(state: InternalState, userData: PlayerData): PlayerState {
    const player = state.players.find((p) => p.name == userData.playerName);
    const numPlayers = state.players.length;
    const roleCounts = histogram(state.players.flatMap((p) => (p.role != undefined ? [p.role] : [])));
    return {
      status: gameStatus(state.quests, numPlayers),
      rolesInfo: [...ROLE_KNOWLEDGE].map(([role, knownRoles]) => ({
        role,
        knownRoles,
        isEvil: EVIL_ROLES.has(role),
        quantity: roleCounts.get(role) || 0,
      })),
      creator: state.creator,
      players: state.players.map((p) => p.name),
      role: player?.role,
      knownPlayers: state.players
        .filter((p) => (ROLE_KNOWLEDGE.get(player?.role!) || []).includes(p.role!))
        .map((p) => p.name),
      playersPerQuest: QUEST_CONFIGURATIONS.get(numPlayers) || [],
      quests: state.quests.map((q) => sanitizeQuest(q, userData.playerName, numPlayers)),
    };
  }
}

function createQuest(
  roundNumber: number,
  attemptNumber: number,
  numPlayers: number,
  leader: PlayerName
): InternalQuestAttempt {
  return {
    id: Math.random().toString(36).substring(2),
    roundNumber,
    attemptNumber,
    size: QUEST_CONFIGURATIONS.get(numPlayers)![roundNumber - 1],
    leader,
    members: [],
    votes: new Map(),
    results: new Map(),
  };
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function numFails(votes: Map<PlayerName, Vote>) {
  return [...votes.values()].filter((vote) => vote == Vote.FAIL).length;
}

function getNextLeader(leader: PlayerName, players: InternalPlayer[]) {
  const idx = players.findIndex((p) => p.name == leader);
  return players[(idx + 1) % players.length].name;
}

function histogram<T>(items: T[]) {
  const histo = new Map<T, number>();
  items.forEach((item) => histo.set(item, (histo.get(item) || 0) + 1));
  return histo;
}

function gameStatus(quests: InternalQuestAttempt[], numPlayers: number) {
  if (quests.length == 0) {
    return GameStatus.NOT_STARTED;
  } else if (quests.filter((q) => questStatus(q, numPlayers) == QuestStatus.FAILED).length > 2) {
    return GameStatus.EVIL_WON;
  } else if (quests.filter((q) => questStatus(q, numPlayers) == QuestStatus.PASSED).length > 2) {
    return GameStatus.GOOD_WON;
  }
  return GameStatus.IN_PROGRESS;
}

function sanitizeQuest(quest: InternalQuestAttempt, playerName: string, numPlayers: number): QuestAttempt {
  return {
    id: quest.id,
    status: questStatus(quest, numPlayers),
    roundNumber: quest.roundNumber,
    attemptNumber: quest.attemptNumber,
    leader: quest.leader,
    members: quest.members,
    proposalVotes: [...quest.votes.entries()].map(([player, vote]) => ({
      player,
      vote: player == playerName || quest.votes.size == numPlayers ? vote : undefined,
    })),
    results: [...quest.results.entries()].map(([player, vote]) => ({
      player,
      vote: player == playerName || quest.results.size == quest.size ? vote : undefined,
    })),
    numFailures: numFails(quest.results),
  };
}

function questStatus(quest: InternalQuestAttempt, numPlayers: number) {
  if (quest.members.length == 0) {
    return QuestStatus.PROPOSING_QUEST;
  } else if (quest.votes.size < numPlayers) {
    return QuestStatus.VOTING_FOR_PROPOSAL;
  } else if (numFails(quest.votes) * 2 >= numPlayers) {
    return QuestStatus.PROPOSAL_REJECTED;
  } else if (quest.results.size < quest.size) {
    return QuestStatus.VOTING_IN_QUEST;
  }
  return numFails(quest.results) == 0 ? QuestStatus.PASSED : QuestStatus.FAILED;
}
