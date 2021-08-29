import { Methods, Context } from "./.rtag/methods";
import { UserData, Response, Method } from "./.rtag/base";
import {
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
  PlayerName,
  GameStatus,
  TurnInfo,
} from "./.rtag/types";
import { wordList } from "./words";
import { shuffle } from "./utils";

type InternalState = {
  players: PlayerInfo[];
  currentTurn: Color;
  cards: Card[];
  turnInfo?: TurnInfo;
};

export class Impl implements Methods<InternalState> {
  createGame(userData: UserData, ctx: Context, request: ICreateGameRequest): InternalState {
    return {
      players: [createPlayer(userData.name)],
      currentTurn: Color.YELLOW,
      cards: [],
    };
  }
  async flow(state: InternalState) {
    for (let i = 0; i < 4; i++) {
      await getUserInput(unjoinedUsers(), Method.JOIN_GAME);
    }
    while (state.currentTurn === Color.YELLOW) {
      await getUserInput([
        [unjoinedUsers(), Method.JOIN_GAME],
        [state.players.map((p) => p.name), Method.START_GAME],
      ]);
    }

    while (getGameStatus(state.cards) === GameStatus.IN_PROGRESS) {
      if (state.turnInfo === undefined) {
        const spyMaster = state.players.find((p) => p.isSpymaster && p.team === state.currentTurn);
        await getUserInput(spyMaster, Method.GIVE_CLUE);
      }
      const team = state.players.find((p) => !p.isSpymaster && p.team === state.currentTurn);
      await getUserInput([
        [team, Method.SELECT_CARD],
        [team, Method.END_TURN],
      ]);
    }
  }
  joinGame(state: InternalState, userData: UserData, ctx: Context, request: IJoinGameRequest): Response {
    state.players.push(createPlayer(userData.name));
    return Response.ok();
  }
  startGame(state: InternalState, userData: UserData, ctx: Context, request: IStartGameRequest): Response {
    // set up cards
    const shuffledList = shuffle(ctx.randInt, wordList);
    state.cards = [];
    state.cards.push(...chooseCards(shuffledList, 9, Color.RED));
    state.cards.push(...chooseCards(shuffledList, 8, Color.BLUE));
    state.cards.push(...chooseCards(shuffledList, 7, Color.YELLOW));
    state.cards.push(...chooseCards(shuffledList, 1, Color.BLACK));
    state.cards = shuffle(ctx.randInt, state.cards);

    // set up teams
    state.players = shuffle(ctx.randInt, state.players);
    for (let i = 0; i < state.players.length; i++) {
      state.players[i].team = i * 2 < state.players.length ? Color.RED : Color.BLUE;
      state.players[i].isSpymaster = false;
    }
    state.players[0].isSpymaster = true;
    state.players[state.players.length - 1].isSpymaster = true;
    state.currentTurn = Color.RED;
    return Response.ok();
  }
  giveClue(state: InternalState, userData: UserData, ctx: Context, request: IGiveClueRequest): Response {
    state.turnInfo = { hint: request.hint, amount: request.amount, guessed: 0 };
    return Response.ok();
  }
  selectCard(state: InternalState, userData: UserData, ctx: Context, request: ISelectCardRequest): Response {
    const player = state.players.find((p) => p.name === userData.name)!;
    const selectedCard = state.cards.find((card) => card.word === request.word);
    if (selectedCard === undefined) {
      return Response.error("Invalid card selection");
    }
    if (selectedCard.selectedBy !== undefined) {
      return Response.error("Card already selected");
    }
    selectedCard.selectedBy = player.team;
    state.turnInfo!.guessed += 1;
    if (selectedCard.color !== state.currentTurn || state.turnInfo!.guessed > state.turnInfo!.amount) {
      state.currentTurn = nextTurn(state.currentTurn);
      state.turnInfo = undefined;
    }
    return Response.ok();
  }
  endTurn(state: InternalState, userData: UserData, ctx: Context, request: IEndTurnRequest): Response {
    state.currentTurn = nextTurn(state.currentTurn);
    state.turnInfo = undefined;
    return Response.ok();
  }
  getUserState(state: InternalState, userData: UserData): PlayerState {
    const player = state.players.find((p) => p.name === userData.name);
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

function createPlayer(name: PlayerName) {
  return { name, team: Color.YELLOW, isSpymaster: false };
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
