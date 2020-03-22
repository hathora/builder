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
  PlayerData
} from "./lsot-types";
import { AbstractImpl } from "./lsot-server-common";

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

interface InternalState {
  creator: PlayerName;
  players: InternalPlayer[];
  quests: InternalQuestAttempt[];
}

function sanitizeQuest(
  quest: InternalQuestAttempt,
  player: PlayerName
): QuestAttempt {
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
    results: remainingResults == 0 ? quest.results.map(r => r.vote).sort() : [],
    remainingResults,
    numFailures:
      remainingResults == 0
        ? quest.results.filter(r => r.vote == Vote.FAIL).length
        : 0,
    playerVote: quest.votes.find(v => v.player == player)?.vote,
    playerResult: quest.results.find(v => v.player == player)?.vote,
    status: QuestStatus.PROPOSING_QUEST
  };
}

function createQuest(
  roundNumber: number,
  attemptNumber: number,
  numPlayers: number,
  leader: PlayerName
): InternalQuestAttempt {
  return {
    id: Math.random()
      .toString(36)
      .substring(2),
    roundNumber,
    attemptNumber,
    size: numPlayers,
    leader,
    members: [],
    votes: [],
    results: []
  };
}

function voteToInt(vote: Vote): number {
  return vote == Vote.PASS ? 1 : -1;
}

class LsotImpl {
  createGame(playerData: PlayerData): InternalState {
    return {
      creator: playerData.playerName,
      players: [{ name: playerData.playerName }],
      quests: []
    };
  }
  joinGame(state: InternalState, playerData: PlayerData) {
    state.players.push({ name: playerData.playerName });
  }
  startGame(
    state: InternalState,
    playerData: PlayerData,
    roleList: Role[],
    playerOrder: PlayerName[]
  ) {
    const numPlayers = state.players.length;
    const leader = state.players[Math.floor(Math.random() * numPlayers)].name;
    state.players.forEach((p, i) => (p.role = roleList[i]));
    state.quests.push(createQuest(1, 1, numPlayers, leader));
  }
  proposeQuest(
    state: InternalState,
    playerData: PlayerData,
    questId: QuestId,
    proposedMembers: PlayerName[]
  ) {
    const quest = state.quests.find(q => q.id == questId)!;
    quest.members = proposedMembers;
  }
  voteForProposal(
    state: InternalState,
    playerData: PlayerData,
    questId: QuestId,
    vote: Vote
  ) {
    const player = state.players.find(p => p.name == playerData.playerName)!;
    const quest = state.quests.find(q => q.id == questId)!;
    const numPlayers = state.players.length;
    quest.votes.push({ player: player.name, vote });
    if (
      quest.votes.length === numPlayers &&
      quest.votes.reduce((a, b) => a + voteToInt(b.vote), 0) <= 0
    ) {
      state.quests.push(
        createQuest(
          quest.roundNumber,
          quest.attemptNumber + 1,
          numPlayers,
          player.name
        )
      );
    }
  }
  voteInQuest(
    state: InternalState,
    playerData: PlayerData,
    questId: QuestId,
    vote: Vote
  ) {
    const player = state.players.find(p => p.name == playerData.playerName)!;
    const quest = state.quests.find(q => q.id == questId)!;
    quest.results.push({ player: player.name, vote });
  }
  getUserState(state: InternalState, playerData: PlayerData): PlayerState {
    const player = state.players.find(p => p.name == playerData.playerName)!;
    return {
      creator: state.creator,
      playersPerQuest: [],
      rolesInfo: [],
      players: [],
      roles: [],
      playerName: player.name,
      playerRole: player.role,
      knownRoles: [],
      currentQuest: sanitizeQuest(
        state.quests[state.quests.length - 1],
        player.name
      ),
      questHistory: [],
      status: GameStatus.NOT_STARTED
    };
  }
}

export default new LsotImpl();
