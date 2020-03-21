import {
    UserId,
    PlayerName,
    Role,
    QuestId,
    Vote,
    PlayerState
} from "./lsot-types";

export interface AbstractImpl<T> {
    createGame(playerId: UserId, playerName: PlayerName): T;
    joinGame(state: T, playerId: UserId, playerName: PlayerName): void;
    startGame(
        state: T,
        playerId: UserId,
        roleList: Role[],
        playerOrder: PlayerName[]
    ): void;
    proposeQuest(
        state: T,
        playerId: UserId,
        questId: QuestId,
        proposedMembers: PlayerName[]
    ): void;
    voteForProposal(
        state: T,
        playerId: UserId,
        questId: QuestId,
        vote: Vote
    ): void;
    voteInQuest(state: T, playerId: UserId, questId: QuestId, vote: Vote): void;
    getUserState(state: T, playerId: UserId): PlayerState;
}
