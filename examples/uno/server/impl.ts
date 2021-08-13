import { Methods, Context } from "./.rtag/methods";
import { UserData, Response } from "./.rtag/base";
import {
  PlayerState,
  ICreateGameRequest,
  IJoinGameRequest,
  IStartGameRequest,
  IPlayCardRequest,
  IDrawCardRequest,
  Card,
  PlayerName,
  Color,
} from "./.rtag/types";

type InternalState = {
  deck: Card[];
  players: PlayerName[];
  hands: Map<PlayerName, Card[]>;
  pile?: Card;
  turn: PlayerName;
  winner?: PlayerName;
};

export class Impl implements Methods<InternalState> {
  createGame(user: UserData, ctx: Context, request: ICreateGameRequest): InternalState {
    const deck = [];
    for (let i = 2; i <= 9; i++) {
      deck.push({ value: i, color: Color.RED });
      deck.push({ value: i, color: Color.BLUE });
      deck.push({ value: i, color: Color.GREEN });
      deck.push({ value: i, color: Color.YELLOW });
    }
    return { deck, players: [user.name], hands: new Map(), turn: user.name };
  }
  joinGame(state: InternalState, user: UserData, ctx: Context, request: IJoinGameRequest): Response {
    if (state.players.find((playerName) => playerName === user.name) !== undefined) {
      return Response.error("Already joined");
    }
    state.players.push(user.name);
    return Response.ok();
  }
  startGame(state: InternalState, user: UserData, ctx: Context, request: IStartGameRequest): Response {
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
  playCard(state: InternalState, user: UserData, ctx: Context, request: IPlayCardRequest): Response {
    if (state.turn != user.name) {
      return Response.error("Not your turn");
    }
    if (request.card.color != state.pile!.color && request.card.value != state.pile!.value) {
      return Response.error("Doesn't match top of pile");
    }
    const hand = state.hands.get(user.name)!;
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
      state.winner = user.name;
      return Response.ok();
    }
    // upate turn
    const currIdx = state.players.indexOf(state.turn);
    const nextIdx = (currIdx + 1) % state.players.length;
    state.turn = state.players[nextIdx];
    return Response.ok();
  }
  drawCard(state: InternalState, user: UserData, ctx: Context, request: IDrawCardRequest): Response {
    const hand = state.hands.get(user.name)!;
    hand.push(state.deck.pop()!);
    return Response.ok();
  }
  getUserState(state: InternalState, user: UserData): PlayerState {
    return {
      hand: state.hands.get(user.name)!,
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
