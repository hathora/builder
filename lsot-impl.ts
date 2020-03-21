import {
    UserId,
    QuestId,
    PlayerName,
    Role,
    Vote,
    QuestStatus,
    GameStatus,
    PlayerAndVote,
    QuestAttempt,
    PlayerState
} from "./lsot-types";
import { AbstractImpl } from "./lsot-server-common";

interface InternalPlayer {
    id: UserId;
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
        results:
            remainingResults == 0 ? quest.results.map(r => r.vote).sort() : [],
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

class LsotImpl implements AbstractImpl<InternalState> {
    createGame(playerId: UserId, playerName: PlayerName): InternalState {
        return {
            creator: playerName,
            players: [{ id: playerId, name: playerName }],
            quests: []
        };
    }
    joinGame(state: InternalState, playerId: UserId, playerName: PlayerName) {
        state.players.push({ id: playerId, name: playerName });
    }
    startGame(
        state: InternalState,
        playerId: UserId,
        roleList: Role[],
        playerOrder: PlayerName[]
    ) {}
    proposeQuest(
        state: InternalState,
        playerId: UserId,
        questId: QuestId,
        proposedMembers: PlayerName[]
    ) {
        const quest = state.quests.find(q => q.id == questId)!;
        quest.members = proposedMembers;
    }
    voteForProposal(
        state: InternalState,
        playerId: UserId,
        questId: QuestId,
        vote: Vote
    ) {
        const player = state.players.find(p => p.id == playerId)!;
        const quest = state.quests.find(q => q.id == questId)!;
        quest.votes.push({ player: player.name, vote });
    }
    voteInQuest(
        state: InternalState,
        playerId: UserId,
        questId: QuestId,
        vote: Vote
    ) {
        const player = state.players.find(p => p.id == playerId)!;
        const quest = state.quests.find(q => q.id == questId)!;
        quest.results.push({ player: player.name, vote });
    }
    getUserState(state: InternalState, playerId: UserId): PlayerState {
        const player = state.players.find(p => p.id == playerId)!;
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
