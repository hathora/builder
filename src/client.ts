import { UserId, PlayerName, QuestId, PlayerState, Role, Vote } from "./types";
import { NullableValue } from "./nullableValue";

interface IBaseResponse {
    error?: string | null;
}

export interface ICreateGameResponse extends IBaseResponse {}

export interface IJoinGameResponse extends IBaseResponse {}

export interface IStartGameResponse extends IBaseResponse {}

export interface IProposeQuestResponse extends IBaseResponse {}

export interface IVoteOnQuestProposalResponse extends IBaseResponse {}

export interface IVoteOnQuestResponse extends IBaseResponse {}

export interface IRejoinResponse extends IBaseResponse {}

export interface IAssassinateResponse extends IBaseResponse {}

export interface ILsotClient {
    createGame(): Promise<ICreateGameResponse>;
    joinGame(gameId: string): Promise<IJoinGameResponse>;
    startGame(gameId: string, roleList: Role[], playerOrder: PlayerName[]): Promise<IStartGameResponse>;
    proposeQuest(questId: QuestId, proposal: PlayerName[]): Promise<IProposeQuestResponse>;
    voteForProposal(questId: QuestId, vote: Vote): Promise<IVoteOnQuestProposalResponse>;
    voteInQuest(questId: QuestId, vote: Vote): Promise<IVoteOnQuestResponse>;
    assassinate(questId: QuestId, target: PlayerName): Promise<IAssassinateResponse>;
    listenForStateChanges(callback: (playerState: PlayerState) => void): void;
    stopListeningForStateChanges(): void;
}

export interface IPlayerData {
    playerId: UserId;
    playerName: PlayerName;
}

export interface ISocketIOClientConfig {
    api: string;
    agent?: string;
}

export class LsotClient implements ILsotClient {
    private socket: SocketIOClient.Socket;
    private playerData: IPlayerData | null;

    constructor({ api, agent }: ISocketIOClientConfig) {
        this.socket = io(api, { agent });
        this.playerData = null;
    }

    public registerPlayer() {
        return new Promise<IJoinGameResponse>((resolve, reject) => {
            this.socket.emit("registerPlayer", this.emitCallback(resolve, reject));
        });
    }

    public createGame(): Promise<ICreateGameResponse> {
        return new Promise<ICreateGameResponse>((resolve, reject) => {
            this.socket.emit("createGame", this.getPlayerId(), this.emitCallback(resolve, reject));
        });
    }

    public joinGame(gameId: string): Promise<IJoinGameResponse> {
        return new Promise<IJoinGameResponse>((resolve, reject) => {
            this.socket.emit("joinGame", gameId, this.getPlayerId(), this.emitCallback(resolve, reject));
        });
    }

    public startGame(gameId: string, roleList: Role[], playerOrder: string[]): Promise<IStartGameResponse> {
        return new Promise<IStartGameResponse>((resolve, reject) => {
            this.socket.emit(
                "startGame",
                gameId,
                this.getPlayerId(),
                roleList,
                playerOrder,
                this.emitCallback(resolve, reject),
            );
        });
    }

    public proposeQuest(questId: string, proposal: string[]): Promise<IProposeQuestResponse> {
        return new Promise<IProposeQuestResponse>((resolve, reject) => {
            this.socket.emit("proposeQuest", questId, this.getPlayerId(), proposal, this.emitCallback(resolve, reject));
        });
    }

    public voteForProposal(questId: string, vote: Vote): Promise<IVoteOnQuestProposalResponse> {
        return new Promise<IVoteOnQuestProposalResponse>((resolve, reject) => {
            this.socket.emit("voteForProposal", questId, this.getPlayerId(), vote, this.emitCallback(resolve, reject));
        });
    }

    public voteInQuest(questId: string, vote: Vote): Promise<IVoteOnQuestResponse> {
        return new Promise<IVoteOnQuestProposalResponse>((resolve, reject) => {
            this.socket.emit("voteInQuest", questId, this.getPlayerId(), vote, this.emitCallback(resolve, reject));
        });
    }

    public assassinate(questId: string, target: string): Promise<IAssassinateResponse> {
        return new Promise<IAssassinateResponse>((resolve, reject) => {
            this.socket.emit("assassinate", questId, this.getPlayerId(), target, this.emitCallback(resolve, reject));
        });
    }

    public listenForStateChanges(callback: (playerState: PlayerState) => void): void {
        this.socket.on("connect", () => {
            this.socket.emit("rejoinGame", this.getPlayerId(), callback);
        });
    }

    public stopListeningForStateChanges(): void {
        this.socket.close();
    }

    private emitCallback = <T extends IBaseResponse>(
        resolve: (value?: T | PromiseLike<T>) => void,
        reject: (reason?: any) => void,
    ) => (response: T) => {
        if (response.error == null) {
            resolve(response);
        } else {
            reject(response.error);
        }
    };

    private getPlayerId(): UserId {
        return NullableValue.of(this.playerData)
            .map(playerData => playerData.playerId)
            .getOrThrow(new ReferenceError("Player not logged in"));
    }
}
