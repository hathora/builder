import { UserId, PlayerName, QuestId, Role, Vote } from "./types";

export interface ILsotClient {
  joinGame(): void;
  startGame(roleList: Role[], playerOrder: PlayerName[]): void;
  proposeQuest(questId: QuestId, proposal: PlayerName[]): void;
  voteForProposal(questId: QuestId, vote: Vote): void;
  voteInQuest(questId: QuestId, vote: Vote): void;
  disconnect(): void;
}

export type StateId = string;

export interface ISocketIOClientConfig {
  api: string;
  agent?: string;
}

export interface IPrivateUserData {
  username: PlayerName;
  userId: UserId;
}

export class LsotClient implements ILsotClient {
  constructor(private socket: SocketIOClient.Socket) {}

  public static registerUser(username: PlayerName): Promise<IPrivateUserData> {
    return fetch("/register", {
      method: "POST",
      body: JSON.stringify({ playerName: username }),
    })
      .then(res => res.json())
      .then(({ userId }) => ({ userId, username }));
  }

  public static connect(userId: UserId, { api, agent }: ISocketIOClientConfig): Promise<LsotClient> {
    return this.createState(userId).then(stateId => new LsotClient(io(api, { agent, query: { stateId, userId } })));
  }

  private static createState(userId: UserId): Promise<StateId> {
    return fetch("/new?userId=" + userId, { method: "POST" })
      .then(res => res.json())
      .then(({ stateId }) => stateId);
  }

  public joinGame(): void {
    this.socket.emit("joinGame");
  }

  public startGame(roleList: Role[], playerOrder: PlayerName[]): void {
    this.socket.emit("startGame", roleList, playerOrder);
  }

  public proposeQuest(questId: string, proposal: PlayerName[]): void {
    this.socket.emit("proposeQuest", questId, proposal);
  }

  public voteForProposal(questId: string, vote: Vote): void {
    this.socket.emit("voteForProposal", questId, vote);
  }

  public voteInQuest(questId: string, vote: Vote): void {
    this.socket.emit("voteInQuest", questId, vote);
  }

  public disconnect(): void {
    this.socket.close();
  }
}
