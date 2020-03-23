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
} from "./generated/types";

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
  playerOrder: PlayerName[];
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

function validateRoles(roleList: Role[], numPlayers: number): boolean {
  if (roleList.length != numPlayers) {
    // not enough roles
    return false;
  }

  const roleCount = new Map();
  for (var role of roleList) {
    if (roleCount.has(role)) {
      roleCount.set(role, roleCount.get(role) + 1);
    } else {
      roleCount.set(role, 1);
    }
  }

  // strong assumption here that roles are exclusively good/evil - revisit if implementing Lancelot
  const goodRoles = [Role.LOYAL_SERVANT, Role.MERLIN, Role.PERCIVAL];
  const numGood = goodRoles.reduce(
    (count, role) => count + (roleCount.has(role) ? roleCount.get(role) : 0),
    0
  );
  const goodPlayerCount = { 5: 3, 6: 4, 7: 4, 8: 5, 9: 6, 10: 6 };
  if (numGood != goodPlayerCount[numPlayers]) {
    // incorrect good/evil role distribution
    return false;
  }

  if (roleCount.has(Role.ASSASSIN) && roleCount.get(Role.ASSASSIN) > 1) {
    // more than one assassin
    return false;
  }

  // No validation for uniqueness of other roles or combinations that make sense - play with two Merlins and no Assassins if you want!

  return true;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export class Impl {
  createGame(playerData: PlayerData): InternalState {
    return {
      creator: playerData.playerName,
      players: [{ name: playerData.playerName }],
      quests: [],
      playerOrder: []
    };
  }

  joinGame(state: InternalState, playerData: PlayerData): boolean {
    if (playerData.playerName in state.players.map(player => player.name)) {
      // player already in the game is trying to join game
      return false;
    }

    if (state.players.length >= 10) {
      // can't have more than 10 players
      return false;
    }

    if (state.quests.length > 0) {
      // can't join if the game has started
      return false;
    }

    state.players.push({ name: playerData.playerName });
    return true;
  }

  startGame(
    state: InternalState,
    playerData: PlayerData,
    roleList: Role[],
    playerOrder: PlayerName[]
  ): boolean {
    if (!(playerData.playerName in state.players.map(player => player.name))) {
      // player not in the game is trying to start game
      return false;
    }

    if (state.quests.length > 0) {
      // can't start if the game has started
      return false;
    }

    const numPlayers = state.players.length;
    if (!validateRoles(roleList, numPlayers)) return false;
    shuffleArray(roleList);

    const leader = state.players[Math.floor(Math.random() * numPlayers)].name;
    state.players.forEach((p, i) => (p.role = roleList[i]));
    state.quests.push(createQuest(1, 1, numPlayers, leader));
    state.playerOrder = playerOrder;
    return true;
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
