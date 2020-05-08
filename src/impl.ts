import {
  QuestId,
  PlayerName,
  Role,
  Vote,
  QuestStatus,
  GameStatus,
  PlayerAndVote,
  QuestAttempt,
  PlayerState,
  PlayerData,
  RoleInfo,
  PlayerAndRole,
} from "./generated/types";
import {
  IJoinGameRequest,
  IStartGameRequest,
  IVoteForProposalRequest,
  IProposeQuestRequest,
  IVoteInQuestRequest,
} from "./generated/types";
import { keyBy } from "./utils";

const ROLES_INFO: RoleInfo[] = [
  {
    role: Role.MERLIN,
    isEvil: false,
    description: "",
  },
  {
    role: Role.PERCIVAL,
    isEvil: false,
    description: "",
  },
  {
    role: Role.LOYAL_SERVANT,
    isEvil: false,
    description: "",
  },
  {
    role: Role.MINION,
    isEvil: true,
    description: "",
  },
  {
    role: Role.ASSASSIN,
    isEvil: true,
    description: "",
  },
  {
    role: Role.MORGANA,
    isEvil: true,
    description: "",
  },
  {
    role: Role.OBERON,
    isEvil: true,
    description: "",
  },
  {
    role: Role.MORDRED,
    isEvil: true,
    description: "",
  },
];

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
  votes: PlayerAndVote[];
  results: PlayerAndVote[];
}

export interface InternalState {
  creator: PlayerName;
  players: InternalPlayer[];
  quests: InternalQuestAttempt[];
}

function sanitizeQuest(quest: InternalQuestAttempt, player: PlayerName): QuestAttempt {
  const remainingVotes = quest.size - quest.votes.length;
  const remainingResults = quest.size - quest.results.length;
  return {
    id: quest.id,
    roundNumber: quest.roundNumber,
    attemptNumber: quest.attemptNumber,
    size: quest.size,
    leader: quest.leader,
    members: quest.members,
    votes: remainingVotes == 0 ? quest.votes.sort() : [],
    remainingVotes,
    results: remainingResults == 0 ? quest.results.map((r) => r.vote).sort() : [],
    remainingResults,
    numFailures: remainingResults == 0 ? quest.results.filter((r) => r.vote == Vote.FAIL).length : 0,
    playerVote: quest.votes.find((v) => v.player == player)?.vote,
    playerResult: quest.results.find((v) => v.player == player)?.vote,
    status: QuestStatus.PROPOSING_QUEST,
  };
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
    size: numPlayers,
    leader,
    members: [],
    votes: [],
    results: [],
  };
}

function voteToInt(vote: Vote): number {
  return vote == Vote.PASS ? 1 : -1;
}

function getGameStatus(quests: QuestAttempt[]): GameStatus {
  if (quests.length === 0) {
    return GameStatus.NOT_STARTED;
  } else if (quests.length >= 5) {
    const lastFiveQuests = quests.slice(quests.length - 5, quests.length);
    const isAllRejects = lastFiveQuests.reduce((result, quest) => {
      return result && quest.status === QuestStatus.PROPOSAL_REJECTED;
    }, true);
    if (isAllRejects) {
      return GameStatus.EVIL_WON;
    }
  }
  const results = quests.reduce(
    (results, quest) => {
      return {
        evilWins: results.evilWins + (quest.status === QuestStatus.FAILED ? 1 : 0),
        goodWins: results.goodWins + (quest.status === QuestStatus.PASSED ? 1 : 0),
      };
    },
    { evilWins: 0, goodWins: 0 }
  );

  if (results.evilWins >= 3) {
    return GameStatus.EVIL_WON;
  } else if (results.goodWins >= 3) {
    //TODO: handle GameStatus.ASSASSINATING
    return GameStatus.GOOD_WON;
  }

  return GameStatus.IN_PROGRESS;
}

function getKnownRoles(playerRole: Role | undefined, players: PlayerAndRole[]): PlayerAndRole[] {
  const rolesInfoMap: Map<Role, RoleInfo> = keyBy(ROLES_INFO, "role");
  if (playerRole === undefined) {
    return [];
  } else if (playerRole === Role.MERLIN) {
    return players.filter((p) => p.role === playerRole || (rolesInfoMap.get(p.role)!.isEvil && p.role != Role.MORDRED));
  } else if (playerRole === Role.PERCIVAL) {
    return players.filter((p) => p.role === playerRole || p.role === Role.MERLIN || p.role === Role.MORGANA);
  } else if (playerRole === Role.OBERON) {
    return players.filter((p) => p.role === playerRole);
  } else if (rolesInfoMap.get(playerRole)!.isEvil) {
    return players.filter((p) => rolesInfoMap.get(p.role)!.isEvil && p.role !== Role.OBERON);
  }
  return [];
}

export class Impl {
  createGame(playerData: PlayerData): InternalState {
    return {
      creator: playerData.playerName,
      players: [{ name: playerData.playerName }],
      quests: [],
    };
  }
  joinGame(state: InternalState, playerData: PlayerData, request: IJoinGameRequest) {
    state.players.push({ name: playerData.playerName });
  }
  startGame(state: InternalState, playerData: PlayerData, { roleList, playerOrder }: IStartGameRequest) {
    const numPlayers = state.players.length;
    const leader = state.players[Math.floor(Math.random() * numPlayers)].name;
    state.players.forEach((p, i) => (p.role = roleList[i]));
    state.quests.push(createQuest(1, 1, numPlayers, leader));
  }
  proposeQuest(state: InternalState, playerData: PlayerData, { questId, proposedMembers }: IProposeQuestRequest) {
    const quest = state.quests.find((q) => q.id == questId)!;
    quest.members = proposedMembers;
  }
  voteForProposal(state: InternalState, playerData: PlayerData, { questId, vote }: IVoteForProposalRequest) {
    const player = state.players.find((p) => p.name == playerData.playerName)!;
    const quest = state.quests.find((q) => q.id == questId)!;
    const numPlayers = state.players.length;
    quest.votes.push({ player: player.name, vote });
    if (quest.votes.length === numPlayers && quest.votes.reduce((a, b) => a + voteToInt(b.vote), 0) <= 0) {
      state.quests.push(createQuest(quest.roundNumber, quest.attemptNumber + 1, numPlayers, player.name));
    }
  }
  voteInQuest(state: InternalState, playerData: PlayerData, { questId, vote }: IVoteInQuestRequest) {
    const player = state.players.find((p) => p.name == playerData.playerName)!;
    const quest = state.quests.find((q) => q.id == questId)!;
    quest.results.push({ player: player.name, vote });
  }
  getUserState(state: InternalState, playerData: PlayerData): PlayerState {
    const { playerName } = playerData;
    const player = state.players.find((p) => p.name === playerName);
    const quests = state.quests.map((quest) => sanitizeQuest(quest, playerName));
    return {
      creator: state.creator,
      playersPerQuest: quests.map((q) => q.size),
      rolesInfo: ROLES_INFO,
      players: state.players.map((p) => p.name),
      roles: state.players.map((p) => p.role!).filter((r) => !!r),
      playerName: playerData.playerName,
      playerRole: player && player.role,
      knownRoles: getKnownRoles(
        player && player.role,
        state.players.map((p) => ({ player: p.name, role: p.role! }))
      ),
      currentQuest: quests[quests.length - 1],
      questHistory: quests.slice(0, state.quests.length - 1),
      status: getGameStatus(quests),
    };
  }
}
