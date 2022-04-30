import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  UserId,
  PlayerState,
  PlayerStatus,
  PlayerInfo,
  IJoinGameRequest,
  IStartGameRequest,
  IStartRoundRequest,
  IFoldRequest,
  ICallRequest,
  IRaiseRequest,
  IInitializeRequest,
} from "../api/types";
import { Card, Cards, createDeck, drawCardsFromDeck, findHighestHands } from "@pairjacks/poker-cards";

type InternalPlayerInfo = Omit<PlayerInfo, "cards"> & { cards: Cards };
type InternalState = {
  players: InternalPlayerInfo[];
  dealerIdx: number;
  activePlayerIdx: number;
  revealedCards: Cards;
  smallBlindAmt: number;
  deck: Cards;
};

export class Impl implements Methods<InternalState> {
  initialize(ctx: Context, request: IInitializeRequest): InternalState {
    return {
      players: [],
      dealerIdx: 0,
      activePlayerIdx: 0,
      revealedCards: [],
      smallBlindAmt: 0,
      deck: [],
    };
  }
  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    if (state.players.find((player) => player.id === userId) !== undefined) {
      return Response.error("Already joined");
    }
    if (state.smallBlindAmt > 0) {
      return Response.error("Already started");
    }
    if (state.players.length >= 8) {
      return Response.error("Maximum player count reached");
    }
    state.players.push(createPlayer(userId));
    return Response.ok();
  }
  startGame(state: InternalState, userId: string, ctx: Context, request: IStartGameRequest): Response {
    if (state.smallBlindAmt > 0) {
      return Response.error("Already started");
    }
    if (state.players.length < 2) {
      return Response.error("At least 2 players required");
    }
    if (request.startingBlind < 1) {
      return Response.error("Invalid starting blind");
    }
    if (request.startingChips < 2 * request.startingBlind) {
      return Response.error("Invalid starting chips");
    }
    state.smallBlindAmt = request.startingBlind;
    state.players.forEach((player) => (player.chipCount = request.startingChips));
    return Response.ok();
  }
  startRound(state: InternalState, userId: UserId, ctx: Context, request: IStartRoundRequest): Response {
    if (state.smallBlindAmt === 0) {
      return Response.error("Game not started");
    }
    if (state.players.some((player) => player.chipsInPot > 0)) {
      return Response.error("Round in progress");
    }
    state.dealerIdx = (state.dealerIdx + 1) % state.players.length;
    state.revealedCards = [];
    state.deck = ctx.chance.shuffle(createDeck() as Card[]);
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
    filterPlayers(state.players, PlayerStatus.PLAYED).forEach((p) => (p.status = PlayerStatus.WAITING));
    makeBet(player, betAmount);
    advanceRound(state);
    return Response.ok();
  }
  getUserState(state: InternalState, userId: UserId): PlayerState {
    const showdown =
      filterPlayers(state.players, PlayerStatus.WAITING).length === 0 &&
      filterPlayers(state.players, PlayerStatus.PLAYED).length > 1;
    return {
      players: state.players.map((player) => {
        const shouldReveal = player.id === userId || (showdown && player.status === PlayerStatus.PLAYED);
        return {
          ...player,
          cards: shouldReveal ? player.cards.map((card) => ({ rank: card[0], suit: card[1] })) : [],
        };
      }),
      dealer: state.players.length > 0 ? state.players[state.dealerIdx].id : undefined,
      activePlayer: state.players.length > 0 ? state.players[state.activePlayerIdx].id : undefined,
      revealedCards: state.revealedCards.map((card) => ({ rank: card[0], suit: card[1] })),
    };
  }
}

function createPlayer(id: UserId): InternalPlayerInfo {
  return {
    id,
    chipCount: 0,
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
  const activePlayers = filterPlayers(state.players, PlayerStatus.FOLDED, false);
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
      activePlayers.map((player) => ({ pocketCards: player.cards, communityCards: state.revealedCards }))
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
  filterPlayers(state.players, PlayerStatus.PLAYED).forEach((player) => (player.status = PlayerStatus.WAITING));
}

function distributeWinnings(players: InternalPlayerInfo[], winners: InternalPlayerInfo[]) {
  // TODO: handle case where pot isn't evenly divisible by the number of winners
  const pot = players.reduce((sum, player) => sum + player.chipsInPot, 0);
  winners.forEach((winner) => (winner.chipCount += Math.floor(pot / winners.length)));
  players.forEach((player) => (player.chipsInPot = 0));
}

function filterPlayers(players: InternalPlayerInfo[], status: PlayerStatus, eq: boolean = true) {
  return players.filter((player) => (eq ? player.status === status : player.status !== status));
}
