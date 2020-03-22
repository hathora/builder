import {
  UserId,
  QuestId,
  PlayerName,
  Role,
  Vote,
  PlayerState,
  PlayerData
} from "./lsot-types";

export interface AbstractImpl<T> {
  createGame(playerData: PlayerData): T;
  joinGame(state: T, playerData: PlayerData): void;
  startGame(
    state: T,
    playerData: PlayerData,
    roleList: Role[],
    playerOrder: PlayerName[]
  ): void;
  proposeQuest(
    state: T,
    playerData: PlayerData,
    questId: QuestId,
    proposedMembers: PlayerName[]
  ): void;
  voteForProposal(
    state: T,
    playerData: PlayerData,
    questId: QuestId,
    vote: Vote
  ): void;
  voteInQuest(
    state: T,
    playerData: PlayerData,
    questId: QuestId,
    vote: Vote
  ): void;
  getUserState(state: T, playerData: PlayerData): PlayerState;
}
