# Tutorial: Uno

In this tutorial we will explore Hathora by learning to make a simplified version of [Uno](https://www.mattel.com/products/uno-gdj85).

## Repo

The full code for this game can be found [here](https://github.com/hathora/hathora/tree/develop/examples/uno), and you can also play the deployed version [here](https://hathora-uno.surge.sh/).

This is what our game will look like by the end of this tutorial:

![image](https://user-images.githubusercontent.com/5400947/149870083-67986611-6151-4ea8-abb2-9a67467741d1.png)

## Install

Before you begin, make sure you have nodejs node v16.12.0 to v16.16.0 (there's an [open issue](https://github.com/node-loader/node-loader-core/issues/12) with node v16.17.0+) and the Hathora cli installed:

```sh
npm install -g hathora
```

## hathora.yml

To start, create a directory called `uno-tutorial` and create a `hathora.yml` file inside with the following contents:

```yml
types:
  Color:
    - RED
    - BLUE
    - GREEN
    - YELLOW
  Card:
    value: int
    color: Color
  Player:
    id: UserId
    numCards: int
  PlayerState:
    hand: Card[]
    players: Player[]
    turn: UserId?
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

This file defines the client data model and the server api endpoints for our application. For more information on this file format, see [here](type-driven-development.md).

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
└─ .gitignore              # user-editable
```

> If you plan on using git, this is a good time to run `git init`

Inside the server directory we will also find a `impl.ts` file filled out with a default implementation:

```ts
// impl.ts

// ...

type InternalState = PlayerState;

export class Impl implements Methods<InternalState> {
  initialize(ctx: Context, request: IInitializeRequest): InternalState {
    return {
      hand: [],
      players: [],
      turn: undefined,
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

Because of the default implementation, we don't see any real data and clicking `Submit` for any of the methods displays a "Not implemented" error. Let's fix this by adding our game logic to `server/impl.ts`:

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
    // create the initial version of our state
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
    // append the user who called the method
    state.hands.push({ userId, cards: [] });
    return Response.ok();
  }
  startGame(state: InternalState, userId: UserId, ctx: Context, request: IStartGameRequest): Response {
    // shuffle the player order and deck
    state.hands = ctx.chance.shuffle(state.hands);
    state.deck = ctx.chance.shuffle(state.deck);
    // give each player 7 cards
    state.hands.forEach((hand) => {
      for (let i = 0; i < 7; i++) {
        hand.cards.push(state.deck.pop()!);
      }
    });
    // start the pile
    state.pile = state.deck.pop();
    return Response.ok();
  }
  playCard(state: InternalState, userId: UserId, ctx: Context, request: IPlayCardRequest): Response {
    const { cards } = state.hands[state.turnIdx];
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
    // add the top card to the player's hand
    const hand = state.hands[state.turnIdx];
    if (hand.userId !== userId) {
      return Response.error("Not your turn");
    }
    hand.cards.push(state.deck.pop()!);
    return Response.ok();
  }
  getUserState(state: InternalState, userId: UserId): PlayerState {
    // compute the user state from the internal state
    return {
      hand: state.hands.find((hand) => hand.userId === userId)?.cards ?? [],
      players: state.hands.map((hand) => ({ id: hand.userId, numCards: hand.cards.length })),
      turn: state.pile !== undefined ? state.hands[state.turnIdx].userId : undefined,
      pile: state.pile,
      winner: state.hands.find((hand) => hand.cards.length === 0)?.userId,
    };
  }
}
```

See [here](methods.md) for more details about how server methods works.

> The Hathora dev server supports hot reloading of both backend and frontend, so you shouldn't need to restart the server when making edits to your code.

Going back to the Prototype UI, we can see our working application in action. Create a game, join it as another user from a different tab (by using the same url), and start the game. You should see a view like this:

![image](https://user-images.githubusercontent.com/5400947/149870083-67986611-6151-4ea8-abb2-9a67467741d1.png)

## Validation

One problem with our current backend implementation is that there is no validation. For example, players can join the game multiple times even though they shouldn't be able to. We can enforce that a player can only join once by chaning our `joinGame` implementation to the following:

```ts
// impl.ts

  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    if (state.hands.find((hand) => hand.userId === userId) !== undefined) {
      return Response.error("Already joined");
    }
    state.hands.push({ userId, cards: [] });
    return Response.ok();
  }
```

Now, if you try to join a second time you will get a `Already joined` error on the screen. Try adding validations to the other functions as well. To see a complete implementation of the backend, see [the Uno example](https://github.com/hathora/hathora/tree/develop/examples/uno).

## Next steps

To learn how to create plugins for specific types to spruce up the view, or to learn how to make a fully custom frontend, take a look at the [client reference](client.md).
