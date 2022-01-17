import { Response } from "./base";
import {
  UserId,
  PlayerState as UserState,
  ICreateGameRequest,
  IJoinGameRequest,
  IStartGameRequest,
  IProposeQuestRequest,
  IVoteForProposalRequest,
  IVoteInQuestRequest,
} from "./types";

export interface Context {
  rand(): number;
  randInt(limit?: number): number;
  time(): number;
}

type State =
  | undefined
  | string
  | number
  | boolean
  | readonly State[]
  | { [k: string]: State }
  | Set<State>
  | Map<State, State>
  | (object & { _modCnt: number });
export interface Methods<T extends State> {
  createGame(userId: UserId, ctx: Context, request: ICreateGameRequest): T;
  joinGame(state: T, userId: UserId, ctx: Context, request: IJoinGameRequest): Response;
  startGame(state: T, userId: UserId, ctx: Context, request: IStartGameRequest): Response;
  proposeQuest(state: T, userId: UserId, ctx: Context, request: IProposeQuestRequest): Response;
  voteForProposal(state: T, userId: UserId, ctx: Context, request: IVoteForProposalRequest): Response;
  voteInQuest(state: T, userId: UserId, ctx: Context, request: IVoteInQuestRequest): Response;
  getUserState(state: T, userId: UserId): UserState;
}
