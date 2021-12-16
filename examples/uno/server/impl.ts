import { Methods, Context } from "./.rtag/methods";
import { Response } from "./.rtag/base";
import {
  UserId,
  PlayerState,
  ICreateGameRequest,
  IJoinGameRequest,
  IStartGameRequest,
  IPlayCardRequest,
  IDrawCardRequest,
  Card,
  Color,
} from "./.rtag/types";

type InternalState = {
  deck: Card[];
  hands: Map<UserId, Card[]>;
  players: UserId[];
  pile?: Card;
  turn: UserId;
  winner?: UserId;
};

export class Impl implements Methods<InternalState> {
  createGame(userId: UserId, ctx: Context, request: ICreateGameRequest): InternalState {
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
    if (state.players.find((playerName) => playerName === userId) !== undefined) {
      return Response.error("Already joined");
    }
    state.players.push(userId);
    return Response.ok();
  }
  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    state.deck = shuffle(ctx.randInt, state.deck);
    state.players.forEach((playerName) => {
      state.hands.set(playerName, []);
      for (let i = 0; i < 7; i++) {
        state.hands.get(playerName)!.push(state.deck.pop()!);
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
    const hand = state.hands.get(userId)!;
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

function shuffle<T>(randInt: (limit: number) => number, items: T[]) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
