import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  UserId,
  PlayerState,
  ICreateGameRequest,
  IJoinGameRequest,
  IStartRoundRequest,
  IFoldRequest,
  ICallRequest,
  IRaiseRequest,
  PlayerStatus,
} from "../api/types";
import { Card, Cards, createDeck, drawCardsFromDeck, findHighestHands } from "@pairjacks/poker-cards";

type InternalPlayerInfo = {
  id: UserId;
  chipCount: number;
  chipsInPot: number;
  cards: Cards;
  status: PlayerStatus;
};

type InternalState = {
  players: InternalPlayerInfo[];
  dealerIdx: number;
  activePlayerIdx: number;
  revealedCards: Cards;
  startingChips: number;
  smallBlindAmt: number;
  deck: Cards;
};

export class Impl implements Methods<InternalState> {
  createGame(userId: UserId, ctx: Context, request: ICreateGameRequest): InternalState {
    return {
      players: [createPlayer(userId, request.startingChips)],
      dealerIdx: 0,
      activePlayerIdx: 0,
      revealedCards: [],
      startingChips: request.startingChips,
      smallBlindAmt: request.startingBlind,
      deck: [],
    };
  }
  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    if (state.players.find((p) => p.id === userId) !== undefined) {
      return Response.error("Already joined");
    }
    state.players.push(createPlayer(userId, state.startingChips));
    return Response.ok();
  }
  startRound(state: InternalState, userId: UserId, ctx: Context, request: IStartRoundRequest): Response {
    if (state.players.length < 2) {
      return Response.error("At least 2 players required");
    }
    if (state.players.some((p) => p.chipsInPot > 0)) {
      return Response.error("Round in progress");
    }
    state.dealerIdx = (state.dealerIdx + 1) % state.players.length;
    state.revealedCards = [];
    state.deck = ctx.shuffle(createDeck() as Card[]);
    makeBet(state.players[(state.dealerIdx + 1) % state.players.length], state.smallBlindAmt);
    makeBet(state.players[(state.dealerIdx + 2) % state.players.length], state.smallBlindAmt * 2);
    state.activePlayerIdx = (state.dealerIdx + 3) % state.players.length;
    state.players.forEach((player) => {
      player.status = PlayerStatus.WAITING;
      const { cards, deck } = drawCardsFromDeck(state.deck, 2);
      player.cards = cards;
      state.deck = deck;
    });
    return Response.ok();
  }
  fold(state: InternalState, userId: UserId, ctx: Context, request: IFoldRequest): Response {
    const player = state.players[state.activePlayerIdx];
    if (player.id !== userId || player.status !== PlayerStatus.WAITING) {
      return Response.error("Not your turn");
    }
    player.status = PlayerStatus.FOLDED;
    advanceRound(state);
    return Response.ok();
  }
  call(state: InternalState, userId: UserId, ctx: Context, request: ICallRequest): Response {
    const player = state.players[state.activePlayerIdx];
    if (player.id !== userId || player.status !== PlayerStatus.WAITING) {
      return Response.error("Not your turn");
    }
    const betAmount = getAmountToCall(state.players, player);
    if (betAmount > player.chipCount) {
      return Response.error("Not enough chips");
    }
    makeBet(player, betAmount);
    advanceRound(state);
    return Response.ok();
  }
  raise(state: InternalState, userId: UserId, ctx: Context, request: IRaiseRequest): Response {
    const player = state.players[state.activePlayerIdx];
    if (player.id !== userId || player.status !== PlayerStatus.WAITING) {
      return Response.error("Not your turn");
    }
    const betAmount = getAmountToCall(state.players, player) + request.amount;
    if (betAmount > player.chipCount) {
      return Response.error("Not enough chips");
    }
    state.players.filter((p) => p.status === PlayerStatus.PLAYED).forEach((p) => (p.status = PlayerStatus.WAITING));
    makeBet(player, betAmount);
    advanceRound(state);
    return Response.ok();
  }
  getUserState(state: InternalState, userId: UserId): PlayerState {
    const showdown =
      state.players.filter((p) => p.status === PlayerStatus.WAITING).length === 0 &&
      state.players.filter((p) => p.status === PlayerStatus.PLAYED).length > 1;
    return {
      players: state.players.map((player) => {
        const shouldReveal = player.id === userId || (showdown && player.status === PlayerStatus.PLAYED);
        return {
          ...player,
          cards: shouldReveal ? player.cards.map((card) => ({ rank: card[0], suit: card[1] })) : [],
        };
      }),
      dealer: state.players[state.dealerIdx].id,
      activePlayer: state.players[state.activePlayerIdx].id,
      revealedCards: state.revealedCards.map((card) => ({ rank: card[0], suit: card[1] })),
    };
  }
}

function createPlayer(id: UserId, chipCount: number): InternalPlayerInfo {
  return {
    id,
    chipCount,
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
  for (let i = 1; i < state.players.length; i++) {
    const idx = (state.dealerIdx + i) % state.players.length;
    if (state.players[idx].status !== PlayerStatus.FOLDED) {
      state.activePlayerIdx = idx;
      break;
    }
  }
  state.players.filter((p) => p.status === PlayerStatus.PLAYED).forEach((p) => (p.status = PlayerStatus.WAITING));
}

function distributeWinnings(players: InternalPlayerInfo[], winners: InternalPlayerInfo[]) {
  // TODO: handle case where pot isn't evenly divisible by the number of winners
  const pot = players.reduce((sum, player) => sum + player.chipsInPot, 0);
  winners.forEach((winner) => (winner.chipCount += Math.floor(pot / winners.length)));
  players.forEach((p) => (p.chipsInPot = 0));
}
