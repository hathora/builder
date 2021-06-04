import { Methods, Context, Result } from "./.rtag/methods";
import {
  UserData,
  PlayerState,
  ICreateGameRequest,
  IJoinGameRequest,
  IStartRoundRequest,
  IFoldRequest,
  ICallRequest,
  IRaiseRequest,
  Username,
  PlayerStatus,
} from "./.rtag/types";
import { shuffle } from "./utils";
import { Cards, createDeck, drawCardsFromDeck, findHighestHands } from "@pairjacks/poker-cards";

const INITIAL_CHIP_COUNT = 100;
const SMALL_BLIND_AMOUNT = 1;
const BIG_BLIND_AMOUNT = 2;

interface InternalPlayerInfo {
  name: Username;
  chipCount: number;
  chipsInPot: number;
  cards: Cards;
  status: PlayerStatus;
}

interface InternalState {
  players: InternalPlayerInfo[];
  dealerIdx: number;
  activePlayerIdx: number;
  revealedCards: Cards;
  deck: Cards;
}

export class Impl implements Methods<InternalState> {
  createGame(user: UserData, ctx: Context, request: ICreateGameRequest): InternalState {
    return {
      players: [createPlayer(user.name)],
      dealerIdx: 0,
      activePlayerIdx: 0,
      revealedCards: [],
      deck: [],
    };
  }
  joinGame(state: InternalState, user: UserData, ctx: Context, request: IJoinGameRequest): Result {
    if (state.players.find((p) => p.name === user.name) !== undefined) {
      return Result.unmodified("Already joined");
    }
    state.players.push(createPlayer(user.name));
    return Result.modified();
  }
  startRound(state: InternalState, user: UserData, ctx: Context, request: IStartRoundRequest): Result {
    if (state.players.length < 2) {
      return Result.unmodified("At least 2 players required");
    }
    if (state.players.some((p) => p.chipsInPot > 0)) {
      return Result.unmodified("Round in progress");
    }
    state.dealerIdx = (state.dealerIdx + 1) % state.players.length;
    state.revealedCards = [];
    state.deck = shuffle(ctx.randInt, createDeck());
    makeBet(state.players[(state.dealerIdx + 1) % state.players.length], SMALL_BLIND_AMOUNT);
    makeBet(state.players[(state.dealerIdx + 2) % state.players.length], BIG_BLIND_AMOUNT);
    state.activePlayerIdx = (state.dealerIdx + 3) % state.players.length;
    state.players.forEach((player) => {
      player.status = PlayerStatus.WAITING;
      const { cards, deck } = drawCardsFromDeck(state.deck, 2);
      player.cards = cards;
      state.deck = deck;
    });
    return Result.modified();
  }
  fold(state: InternalState, user: UserData, ctx: Context, request: IFoldRequest): Result {
    const player = state.players[state.activePlayerIdx];
    if (player.name !== user.name || player.status !== PlayerStatus.WAITING) {
      return Result.unmodified("Not your turn");
    }
    player.status = PlayerStatus.FOLDED;
    advanceRound(state);
    return Result.modified();
  }
  call(state: InternalState, user: UserData, ctx: Context, request: ICallRequest): Result {
    const player = state.players[state.activePlayerIdx];
    if (player.name !== user.name || player.status !== PlayerStatus.WAITING) {
      return Result.unmodified("Not your turn");
    }
    const betAmount = getAmountToCall(state.players, player);
    if (betAmount > player.chipCount) {
      return Result.unmodified("Not enough chips");
    }
    makeBet(player, betAmount);
    advanceRound(state);
    return Result.modified();
  }
  raise(state: InternalState, user: UserData, ctx: Context, request: IRaiseRequest): Result {
    const player = state.players[state.activePlayerIdx];
    if (player.name !== user.name || player.status !== PlayerStatus.WAITING) {
      return Result.unmodified("Not your turn");
    }
    const betAmount = getAmountToCall(state.players, player) + request.amount;
    if (betAmount > player.chipCount) {
      return Result.unmodified("Not enough chips");
    }
    state.players.filter((p) => p.status === PlayerStatus.PLAYED).forEach((p) => (p.status = PlayerStatus.WAITING));
    makeBet(player, betAmount);
    advanceRound(state);
    return Result.modified();
  }
  getUserState(state: InternalState, user: UserData): PlayerState {
    const showdown =
      state.players.filter((p) => p.status === PlayerStatus.WAITING).length === 0 &&
      state.players.filter((p) => p.status === PlayerStatus.PLAYED).length > 1;
    return {
      players: state.players.map((player) => {
        const shouldReveal = player.name === user.name || (showdown && player.status === PlayerStatus.PLAYED);
        return {
          ...player,
          cards: shouldReveal ? player.cards.map((card) => ({ rank: card[0], suit: card[1] })) : [],
        };
      }),
      dealer: state.players[state.dealerIdx].name,
      activePlayer: state.players[state.activePlayerIdx].name,
      revealedCards: state.revealedCards.map((card) => ({ rank: card[0], suit: card[1] })),
    };
  }
}

function createPlayer(name: Username): InternalPlayerInfo {
  return {
    name,
    chipCount: INITIAL_CHIP_COUNT,
    chipsInPot: 0,
    cards: [],
    status: PlayerStatus.WAITING,
  };
}

function getAmountToCall(players: InternalPlayerInfo[], player: InternalPlayerInfo) {
  return Math.max(...players.map((p) => p.chipsInPot)) - player.chipsInPot;
}

function makeBet(player: InternalPlayerInfo, amount: number) {
  player.chipCount -= amount;
  player.chipsInPot += amount;
  player.status = PlayerStatus.PLAYED;
}

function advanceRound(state: InternalState) {
  const activePlayers = state.players.filter((p) => p.status !== PlayerStatus.FOLDED);
  // if there is only 1 player left, they are the winner
  if (activePlayers.length === 1) {
    distributeWinnings(state.players, [activePlayers[0]]);
    return;
  }
  // advance to the next waiting player, if any
  for (let i = 1; i < state.players.length; i++) {
    const idx = (state.activePlayerIdx + i) % state.players.length;
    if (state.players[idx].status === PlayerStatus.WAITING) {
      state.activePlayerIdx = idx;
      return;
    }
  }
  // if there are no waiting players and we've revaled 5 cards, determine the winners
  if (state.revealedCards.length === 5) {
    const highestHands = findHighestHands(
      activePlayers.map((p) => ({ pocketCards: p.cards, communityCards: state.revealedCards }))
    );
    distributeWinnings(
      state.players,
      highestHands.map(({ candidateIndex }) => activePlayers[candidateIndex])
    );
    return;
  }
  // if round is still in progress, reveal the next cards and reset the active player
  const amountToReveal = state.revealedCards.length === 0 ? 3 : 1;
  const { cards, deck } = drawCardsFromDeck(state.deck, amountToReveal);
  state.revealedCards = state.revealedCards.concat(cards);
  state.deck = deck;
  state.activePlayerIdx = (state.dealerIdx + 1) % state.players.length;
  state.players.filter((p) => p.status === PlayerStatus.PLAYED).forEach((p) => (p.status = PlayerStatus.WAITING));
}

function distributeWinnings(players: InternalPlayerInfo[], winners: InternalPlayerInfo[]) {
  // TODO: handle case where pot isn't evenly divisible by the number of winners
  const pot = players.reduce((sum, player) => sum + player.chipsInPot, 0);
  winners.forEach((winner) => (winner.chipCount += Math.floor(pot / winners.length)));
  players.forEach((p) => (p.chipsInPot = 0));
}
