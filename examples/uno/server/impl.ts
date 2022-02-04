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
} from "../api/types";

type InternalState = {
  deck: Card[];
  hands: Map<UserId, Card[]>;
  players: UserId[];
  pile?: Card;
  turn: UserId;
  winner?: UserId;
};

export class Impl implements Methods<InternalState> {
  initialize(userId: UserId, ctx: Context): InternalState {
    const deck = [];
    for (let i = 2; i <= 9; i++) {
      deck.push({ value: i, color: Color.RED });
      deck.push({ value: i, color: Color.BLUE });
      deck.push({ value: i, color: Color.GREEN });
      deck.push({ value: i, color: Color.YELLOW });
    }
    return { deck, players: [userId], hands: new Map(), turn: userId };
  }
  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    if (state.players.find((playerId) => playerId === userId) !== undefined) {
      return Response.error("Already joined");
    }
    state.players.push(userId);
    return Response.ok();
  }
  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    if (state.pile !== undefined) {
      return Response.error("Already started");
    }
    state.deck = ctx.chance.shuffle(state.deck);
    // give each player 7 cards
    state.players.forEach((playerId) => {
      state.hands.set(playerId, []);
      for (let i = 0; i < 7; i++) {
        state.hands.get(playerId)!.push(state.deck.pop()!);
      }
    });
    state.pile = state.deck.pop();
    return Response.ok();
  }
  playCard(state: InternalState, userId: UserId, ctx: Context, request: IPlayCardRequest): Response {
    if (state.turn != userId) {
      return Response.error("Not your turn");
    }
    if (request.card.color != state.pile!.color && request.card.value != state.pile!.value) {
      return Response.error("Doesn't match top of pile");
    }
    const hand = state.hands.get(userId)!;
    const cardIdx = hand.findIndex((card) => card.value == request.card.value && card.color == request.card.color);
    if (cardIdx < 0) {
      return Response.error("Card not in hand");
    }
    // remove from hand
    hand.splice(cardIdx, 1);
    // update pile
    state.pile = request.card;
    // check if won
    if (hand.length == 0) {
      state.winner = userId;
      return Response.ok();
    }
    // upate turn
    const currIdx = state.players.indexOf(state.turn);
    const nextIdx = (currIdx + 1) % state.players.length;
    state.turn = state.players[nextIdx];
    return Response.ok();
  }
  drawCard(state: InternalState, userId: UserId, ctx: Context, request: IDrawCardRequest): Response {
    if (state.deck.length === 0) {
      return Response.error("Deck is empty");
    }
    const hand = state.hands.get(userId);
    if (hand === undefined) {
      return Response.error("Invalid user");
    }
    hand.push(state.deck.pop()!);
    return Response.ok();
  }
  getUserState(state: InternalState, userId: UserId): PlayerState {
    return {
      hand: state.hands.get(userId) ?? [],
      players: state.players,
      turn: state.turn,
      pile: state.pile,
      winner: state.winner,
    };
  }
}
