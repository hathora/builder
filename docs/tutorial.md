# Tutorial

In this tutorial we will explore Hathora by learning to make a simplified version of [Uno](https://www.mattel.com/products/uno-gdj85).

Before you begin, make sure you have nodejs and the hathora cli installed:

```sh
npm install -g hathora
```

To start, create a directory called `uno-tutorial` and create a `hathora.yml` file inside with the following contents:

```yml
# hathora.yml

types:
  Color:
    - RED
    - BLUE
    - GREEN
    - YELLOW
  Card:
    value: int
    color: Color
  PlayerState:
    hand: Card[]
    players: UserId[]
    turn: UserId
    pile: Card?
    winner: UserId?

methods:
  createGame:
  joinGame:
  startGame:
  playCard:
    card: Card
  drawCard:

auth:
  anonymous:
    separator: "-"

userState: PlayerState
initialize: createGame
error: string
```

This file defines the client data model and the server api endpoints for our application. For more information on this file format, see [here](type-driven-development).

To initialize our project structure run `hathora init`. You should see `api`, `client`, and `server` directory generated, along with a `.gitignore` and `.env` file. Inside both directories you will find a `.hathora` directory with framework generated code based on our `hathora.yml` file.

> If you plan on using git, this is a good time to run `git init`

Inside the server directory we will also find a `impl.ts` file filled out with a default implementation:

```ts
// impl.ts

// ...

export class Impl implements Methods<InternalState> {
  createGame(userId: UserId, ctx: Context, request: ICreateGameRequest): InternalState {
    return {};
  }
  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    return Response.error("Not implemented");
  }
  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    return Response.error("Not implemented");
  }
  playCard(state: InternalState, userId: UserId, ctx: Context, request: IPlayCardRequest): Response {
    return Response.error("Not implemented");
  }
  drawCard(state: InternalState, userId: UserId, ctx: Context, request: IDrawCardRequest): Response {
    return Response.error("Not implemented");
  }
  getUserState(state: InternalState, userId: UserId): PlayerState {
    return {
      hand: [],
      players: [],
      turn: "",
      pile: undefined,
      winner: undefined,
    };
  }
}
```

Next, run `hathora dev` to start the development server. Visit http://localhost:3000 where you see the following Prototype UI view:

![image](https://user-images.githubusercontent.com/5400947/149869164-19a7cbe3-59a6-47a8-95b0-6bc316b31cef.png)

Because of the default implementation, we don't see any real data and click Submit for any of the methods displays a "Not implemented" error. Let's fix this by adding our business logic to `server/impl.ts`:

```ts
import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
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
    state.deck = ctx.shuffle(state.deck);
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
```

See [here](methods) for more details about how server methods works.

> The hathora dev server supports hot reloading of both backend and frontend, so you shouldn't need to restart the server when making edits.

Going back to the prototype UI, we can see our working application in action. Create a game, join it as another user from a different tab, and start the game. You should see a view like this:

![image](https://user-images.githubusercontent.com/5400947/149870083-67986611-6151-4ea8-abb2-9a67467741d1.png)

## Next steps

To learn how to create plugins for specific types to spruce up the view, or to learn how to make a fully custom frontend, take a look at the [client reference](client.md).
