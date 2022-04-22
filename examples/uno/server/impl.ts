import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  UserId,
  PlayerState,
  IJoinGameRequest,
  IStartGameRequest,
  IPlayCardRequest,
  IDrawCardRequest,
  Card,
  Color,
  IInitializeRequest,
} from "../api/types";

type InternalState = {
  deck: Card[];
  hands: { userId: UserId; cards: Card[] }[];
  turnIdx: number;
  pile?: Card;
};

export class Impl implements Methods<InternalState> {
  initialize(ctx: Context, request: IInitializeRequest): InternalState {
    const deck = [];
    for (let i = 2; i <= 9; i++) {
      deck.push({ value: i, color: Color.RED });
      deck.push({ value: i, color: Color.BLUE });
      deck.push({ value: i, color: Color.GREEN });
      deck.push({ value: i, color: Color.YELLOW });
    }
    return { deck, hands: [], turnIdx: 0 };
  }
  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    if (state.hands.find((hand) => hand.userId === userId) !== undefined) {
      return Response.error("Already joined");
    }
    if (state.pile !== undefined) {
      return Response.error("Game in progress");
    }
    state.hands.push({ userId, cards: [] });
    return Response.ok();
  }
  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    if (state.pile !== undefined) {
      return Response.error("Already started");
    }
    if (state.hands.length === 0) {
      return Response.error("At least one player required");
    }
    state.hands = ctx.chance.shuffle(state.hands);
    state.deck = ctx.chance.shuffle(state.deck);
    // give each player 7 cards
    state.hands.forEach((hand) => {
      for (let i = 0; i < 7; i++) {
        hand.cards.push(state.deck.pop()!);
      }
    });
    state.pile = state.deck.pop();
    return Response.ok();
  }
  playCard(state: InternalState, userId: UserId, ctx: Context, request: IPlayCardRequest): Response {
    if (state.pile === undefined) {
      return Response.error("Game not started");
    }
    const hand = state.hands[state.turnIdx];
    if (hand.userId !== userId) {
      return Response.error("Not your turn");
    }
    if (request.card.color != state.pile!.color && request.card.value != state.pile!.value) {
      return Response.error("Doesn't match top of pile");
    }
    const cards = hand.cards;
    const cardIdx = cards.findIndex((card) => card.value == request.card.value && card.color == request.card.color);
    if (cardIdx < 0) {
      return Response.error("Card not in hand");
    }
    // remove from hand
    cards.splice(cardIdx, 1);
    // update pile
    state.pile = request.card;
    // upate turn
    state.turnIdx = (state.turnIdx + 1) % state.hands.length;
    return Response.ok();
  }
  drawCard(state: InternalState, userId: UserId, ctx: Context, request: IDrawCardRequest): Response {
    if (state.pile === undefined) {
      return Response.error("Game not started");
    }
    const hand = state.hands[state.turnIdx];
    if (hand.userId !== userId) {
      return Response.error("Not your turn");
    }
    if (state.deck.length === 0) {
      return Response.error("Deck is empty");
    }
    hand.cards.push(state.deck.pop()!);
    return Response.ok();
  }
  getUserState(state: InternalState, userId: UserId): PlayerState {
    return {
      hand: state.hands.find((hand) => hand.userId === userId)?.cards ?? [],
      players: state.hands.map((hand) => ({ id: hand.userId, numCards: hand.cards.length })),
      turn: state.pile !== undefined ? state.hands[state.turnIdx].userId : undefined,
      pile: state.pile,
      winner: state.hands.find((hand) => hand.cards.length === 0)?.userId,
    };
  }
}
