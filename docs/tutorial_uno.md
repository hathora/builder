# Tutorial: Uno

In this tutorial we will explore Hathora by learning to make a simplified version of [Uno](https://www.mattel.com/products/uno-gdj85).

## Install

Before you begin, make sure you have nodejs v16.12+ and the hathora cli installed:

```sh
npm install -g hathora
```

## hathora.yml

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
  joinGame:
  startGame:
  playCard:
    card: Card
  drawCard:

auth:
  anonymous: {}

userState: PlayerState
error: string
```

This file defines the client data model and the server api endpoints for our application. For more information on this file format, see [here](type-driven-development).

To initialize our project structure run `hathora init`. You should see the following directory structure generated for you:

```
uno-tutorial               # project root
├─ api                     # generated + gitignored
├─ client
│  ├─ .hathora             # generated + gitignored
│  └─ prototype-ui         # generated + gitignored
├─ server
│  ├─ .hathora             # generated + gitignored
│  ├─ impl.ts              # user-editable
│  ├─ tsconfig.json        # user-editable
│  ├─ package.json         # user-editable
├─ hathora.yml             # user-editable
├─ .env                    # user-editable
└─ .gitignore              # user-editable
```

> If you plan on using git, this is a good time to run `git init`

Inside the server directory we will also find a `impl.ts` file filled out with a default implementation:

```ts
// impl.ts

// ...

type InternalState = PlayerState;

export class Impl implements Methods<InternalState> {
  initialize(userId: UserId, ctx: Context): InternalState {
    return {
      hand: [],
      players: [],
      turn: "",
      pile: undefined,
      winner: undefined,
    };
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
    return state;
  }
}
```

Next, run `hathora dev` to start the development server. Visit http://localhost:3000 where you see the following Prototype UI view:

![image](https://user-images.githubusercontent.com/5400947/149869164-19a7cbe3-59a6-47a8-95b0-6bc316b31cef.png)

## Backend logic

Because of the default implementation, we don't see any real data and clicking Submit for any of the methods displays a "Not implemented" error. Let's fix this by adding our game logic to `server/impl.ts`:

```ts
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
    // create the initial version of our state
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
    // append the user who called the method
    state.players.push(userId);
    return Response.ok();
  }
  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    // shuffle the deck, give each player 7 cards, and start the pile
    state.deck = ctx.chance.shuffle(state.deck);
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
    // remove from hand
    const hand = state.hands.get(userId)!;
    const cardIdx = hand.findIndex((card) => card.value == request.card.value && card.color == request.card.color);
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
    // add the top card to the player's hand
    state.hands.get(userId)!.push(state.deck.pop()!);
    return Response.ok();
  }
  getUserState(state: InternalState, userId: UserId): PlayerState {
    // compute the user state from the internal state
    return {
      hand: state.hands.get(userId) ?? [], // only return this user's hand
      players: state.players,
      turn: state.turn,
      pile: state.pile,
      winner: state.winner,
    };
  }
}
```

See [here](methods) for more details about how server methods works.

> The hathora dev server supports hot reloading of both backend and frontend, so you shouldn't need to restart the server when making edits to your code.

Going back to the prototype UI, we can see our working application in action. Create a game, join it as another user from a different tab (by using the same url), and start the game. You should see a view like this:

![image](https://user-images.githubusercontent.com/5400947/149870083-67986611-6151-4ea8-abb2-9a67467741d1.png)

## Validation

One problem with our current backend implementation is that there is no validation. For example, players can join the game multiple times even though they shouldn't be able to. We can enforce that a player can only join once by chaning our `joinGame` implementation to the following:

```ts
// impl.ts

  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    if (state.players.find((playerId) => playerId === userId) !== undefined) {
      return Response.error("Already joined");
    }
    state.players.push(userId);
    return Response.ok();
  }
```

Now, if you try to join a second time you will get a `Already joined` error on the screen. Try adding validations to the other functions as well. To see a complete implementation of the backend, see [the uno example](https://github.com/hathora/hathora/tree/develop/examples/uno).

## Next steps

To learn how to create plugins for specific types to spruce up the view, or to learn how to make a fully custom frontend, take a look at the [client reference](client.md).
