import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  UserId,
  ICreateGameRequest,
  IJoinGameRequest,
  IStartGameRequest,
  IGiveClueRequest,
  ISelectCardRequest,
  IEndTurnRequest,
  PlayerState,
  Card,
  Color,
  PlayerInfo,
  GameStatus,
  TurnInfo,
} from "../api/types";
import { wordList } from "./words";

type InternalState = {
  players: PlayerInfo[];
  currentTurn: Color;
  cards: Card[];
  turnInfo?: TurnInfo;
};

export class Impl implements Methods<InternalState> {
  createGame(userId: UserId, ctx: Context, request: ICreateGameRequest): InternalState {
    return {
      players: [createPlayer(userId)],
      currentTurn: Color.YELLOW,
      cards: [],
    };
  }
  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    if (getGameStatus(state.cards) !== GameStatus.NOT_STARTED) {
      return Response.error("Game already started");
    }
    if (state.players.find((player) => player.id === userId)) {
      return Response.error("Already joined");
    }
    state.players.push(createPlayer(userId));
    return Response.ok();
  }
  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    if (getGameStatus(state.cards) === GameStatus.IN_PROGRESS) {
      return Response.error("Game is in progress");
    }
    if (state.players.length < 4) {
      return Response.error("Not enough players joined");
    }

    // set up cards
    const shuffledList = ctx.chance.shuffle(wordList);
    state.cards = [];
    state.cards.push(...chooseCards(shuffledList, 9, Color.RED));
    state.cards.push(...chooseCards(shuffledList, 8, Color.BLUE));
    state.cards.push(...chooseCards(shuffledList, 7, Color.YELLOW));
    state.cards.push(...chooseCards(shuffledList, 1, Color.BLACK));
    state.cards = ctx.chance.shuffle(state.cards);

    // set up teams
    state.players = ctx.chance.shuffle(state.players);
    for (let i = 0; i < state.players.length; i++) {
      state.players[i].team = i * 2 < state.players.length ? Color.RED : Color.BLUE;
      state.players[i].isSpymaster = false;
    }
    state.players[0].isSpymaster = true;
    state.players[state.players.length - 1].isSpymaster = true;
    state.currentTurn = Color.RED;
    return Response.ok();
  }
  giveClue(state: InternalState, userId: UserId, ctx: Context, request: IGiveClueRequest): Response {
    if (getGameStatus(state.cards) !== GameStatus.IN_PROGRESS) {
      return Response.error("Game is over");
    }
    const player = state.players.find((p) => p.id === userId);
    if (player === undefined) {
      return Response.error("Invalid player");
    }
    if (!player.isSpymaster) {
      return Response.error("Only spymaster can give clue");
    }
    if (player.team !== state.currentTurn) {
      return Response.error("Not your turn");
    }
    state.turnInfo = { hint: request.hint, amount: request.amount, guessed: 0 };
    return Response.ok();
  }
  selectCard(state: InternalState, userId: UserId, ctx: Context, request: ISelectCardRequest): Response {
    if (getGameStatus(state.cards) !== GameStatus.IN_PROGRESS) {
      return Response.error("Game is over");
    }
    const player = state.players.find((p) => p.id === userId);
    if (player === undefined) {
      return Response.error("Invalid player");
    }
    if (player.isSpymaster) {
      return Response.error("Spymaster cannot select card");
    }
    if (player.team !== state.currentTurn) {
      return Response.error("Not your turn");
    }
    if (state.turnInfo === undefined) {
      return Response.error("Spymaster has not yet given clue");
    }
    const selectedCard = state.cards.find((card) => card.word === request.word);
    if (selectedCard === undefined) {
      return Response.error("Invalid card selection");
    }
    if (selectedCard.selectedBy !== undefined) {
      return Response.error("Card already selected");
    }
    selectedCard.selectedBy = player.team;
    state.turnInfo.guessed += 1;
    if (selectedCard.color !== state.currentTurn || state.turnInfo.guessed > state.turnInfo.amount) {
      state.currentTurn = nextTurn(state.currentTurn);
      state.turnInfo = undefined;
    }
    return Response.ok();
  }
  endTurn(state: InternalState, userId: UserId, ctx: Context, request: IEndTurnRequest): Response {
    if (getGameStatus(state.cards) !== GameStatus.IN_PROGRESS) {
      return Response.error("Game is over");
    }
    const player = state.players.find((p) => p.id === userId);
    if (player === undefined) {
      return Response.error("Invalid player");
    }
    if (player.isSpymaster) {
      return Response.error("Spymaster cannot end turn");
    }
    if (player.team !== state.currentTurn) {
      return Response.error("Not your turn");
    }
    if (state.turnInfo === undefined) {
      return Response.error("Spymaster has not yet given clue");
    }
    state.currentTurn = nextTurn(state.currentTurn);
    state.turnInfo = undefined;
    return Response.ok();
  }
  getUserState(state: InternalState, userId: UserId): PlayerState {
    const player = state.players.find((p) => p.id === userId);
    const gameStatus = getGameStatus(state.cards);
    return {
      players: state.players,
      gameStatus,
      currentTurn: state.currentTurn,
      turnInfo: state.turnInfo,
      cards: player?.isSpymaster || gameStatus !== GameStatus.IN_PROGRESS ? state.cards : state.cards.map(sanitizeCard),
      redRemaining: remainingCards(state.cards, Color.RED),
      blueRemaining: remainingCards(state.cards, Color.BLUE),
    };
  }
}

function createPlayer(id: UserId): PlayerInfo {
  return { id, team: Color.YELLOW, isSpymaster: false };
}

function getGameStatus(cards: Card[]): GameStatus {
  const blackCard = cards.find((card) => card.color === Color.BLACK);
  if (blackCard === undefined) {
    return GameStatus.NOT_STARTED;
  }
  if (blackCard.selectedBy === Color.BLUE || remainingCards(cards, Color.RED) === 0) {
    return GameStatus.RED_WON;
  } else if (blackCard.selectedBy === Color.RED || remainingCards(cards, Color.BLUE) === 0) {
    return GameStatus.BLUE_WON;
  }
  return GameStatus.IN_PROGRESS;
}

function chooseCards(words: string[], num: number, color: Color): Card[] {
  return [...Array(num).keys()].map((_) => ({ word: words.pop()!, color, selectedBy: undefined }));
}

function nextTurn(turn: Color): Color {
  return turn === Color.BLUE ? Color.RED : Color.BLUE;
}

function sanitizeCard(card: Card): Card {
  return card.selectedBy !== undefined ? card : { ...card, color: undefined };
}

function remainingCards(cards: Card[], color: Color): number {
  return cards.filter((card) => card.selectedBy === undefined && card.color === color).length;
}
