# Reference

## rtag.yml

`rtag.yml` is where the API and other core aspects of the application are declared.

The top level keys in this file are `types`, `methods`, `auth`, `userState`, `initialize`, `error`, and (optionally) `tick`.

### types

The `types` section is used to define the API data objects.

Supported types include string, number, boolean, enum, optional, array, object, and union.

Example:

```yml
types:
  MyAlias: string
  MyEnum:
    - VAL1
    - VAL2
  MyObj1:
    myString: string
    myNum: number
    myBool: boolean
    myEnum: MyEnum
  MyObj2:
    myOptional: MyEnum?
    myArray: MyAlias[]
    myObj: MyObj1
  MyUnion:
    - MyObj1
    - MyObj2
```

### methods

The `methods` section is used to define the API methods.

Methods can have 0 or more arguments, the type of which come from the `types` section.

Example:

```yml
methods:
  methods:
    doSomeAction:
      arg1: string
      arg2: MyEnum[]
    emptyMethod:
    createState:
      conf: MyObj2
```

### auth

The `auth` section is used to configure the authentication modes that the application can use. The two currently supported modes are anonymous and google. At least one authentication method must be configured.

Example:

```yml
auth:
  anonymous:
    separator: "-"
  google:
    clientId: 0123456789-abcd1234efgh5678.apps.googleusercontent.com
```

### userState

The `userState` key represents the data type the client has access to from the server. As state is mutated via methods, the server broadcasts updates to keep clients in sync with the latest version of the data.

Example:

```yml
userState: MyUnion
```

### initialize

The `initialize` key represents the method which is responsible for creating a new state.

### error

The `error` key represents the response type the server sends when a method call fails.

### tick

The optional `tick` configures whether or not the backend will run an `onTick` function at a configurable interval. See the Server section below for more details.

## Server

The server has three responsibilities:

1. Creating the initial internal state
2. Mutating the internal state via methods and/or `onTick`
3. Deriving the appropriate `userState` per user from the internal state

### Internal State

For each stateId, the backend maintains an internal representation of the state in memory inside the server. The internal state type is passed into the `Methods` interface as a parameter so that it can enforce the correct class structure. The server entrypoint must export a class conforming to this `Methods` interface.

Note that in simple cases, the `userState` can be used as the type of internal state (see [chat example](../examples/chat/server/impl.ts)). However, many times you may want a separate representation of internal state which then gets converted to the `userState` via the `getUserState()` function. By having this separation between server state and user state, you can do things like:

- enforce privacy by selectively allowing access to parts of the state per user (e.g. private messages in chat example)
- allow for a more optimized data structure in the server (e.g. chess.js in chess example)
- derive certain properties rather than store them (e.g. game status in codenames example)

The internal state can be composed of any primitives and built in data structures of the language. Custom classes, whether user-defined or imported from a library, can also be used, but they need to utilize a `_modCount` property to allow for change detection (see [chess example](../examples/chess/server/impl.ts)).

The internal state is first created via the method referenced by `initialize` in `rtag.yml`.

Example (poker game):

```yml
# rtag.yml

methods:
  createGame:
    startingChips: number
    startingBlind: number
# ...
initialize: createGame
```

```ts
// impl.ts

import { Methods, Context } from "./.rtag/methods";
import { UserData } from "./.rtag/base";
import { Username, PlayerStatus, ICreateGameRequest } from "./.rtag/types";
import { Cards } from "@pairjacks/poker-cards";

type InternalPlayerInfo = {
  name: Username;
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
  createGame(user: UserData, ctx: Context, request: ICreateGameRequest): InternalState {
    return {
      players: [
        { name: user.name, chipCount: request.startingChips, chipsInPot: 0, cards: [], status: PlayerStatus.WAITING },
      ],
      dealerIdx: 0,
      activePlayerIdx: 0,
      revealedCards: [],
      startingChips: request.startingChips,
      smallBlindAmt: request.startingBlind,
      deck: [],
    };
  }
  // ...
}
```

### Mutation

The server mutates state via the functions defined in the `methods` section of `rtag.yml` or via the special `onTick` function.

Methods receive four arguments as input:

1. `state`: the internal state describe above
2. `user`: the data associated with the user who called the method
3. `ctx`: a context object, which must be used for sources of nondeterminism (random numbers, current time, api calls)
4. `request`: the input arguments to the method as defined in `rtag.yml`

Based on these inputs, the method can validate whether the action is permitted, returning an error response if not. Otherwise, the method can mutate `state` as desired and return a success response. Any mutations that occur will ultimately be reflected in the client state via the `getUserState` function.

### getUserState

The `getUserState` function converts the internal state to the user state based on the user data.

Example (poker game):

```ts
  getUserState(state: InternalState, user: UserData): PlayerState {
    return {
      players: state.players.map((player) => {
        const shouldReveal =
          player.name === user.name || (isShowdown(state.players) && player.status === PlayerStatus.PLAYED);
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
```

### onTick

Sometimes apps may want some way to execute logic in the backend at a fixed interval outside of user called methods. Common use cases for this include running simulations (e.g. physics simulations in games), sending notifications, or updating clocks/timers.

To enable this functionality, simply set the `tick` key in `rtag.yml` to an integer (>= 50) representing the interval at which the server will call the `onTick` function. This will add an `onTick` function to the `Methods` interface. The `onTick` function takes the internal state, context object, and time delta (representing the milliseconds elapsed since the previous `onTick` invocation) as arguments. Any mutations that occur inside this function will be handled the same way as mutations inside the methods.

## Client

The rtag framework includes an automatically generated debug application that lets you interact with your application and test your backend logic without writing any frontend code. Furthermore, rtag provides ways to incrementally add custom presentation logic as you become ready for it.

### Plugins

Plugins go inside the `client/plugins` directory. To create a plugin for type `Foo`, create a file named `Foo.ts` and rerun the `rtag` command. This will cause the debug app to render your plugin's component anywhere `Foo` shows up in the state tree (instead of the rendering the default json view).

Your plugin must export a webcomponent (a class that extends `HTMLElement`). While you are free to write a native webcomponent without any dependencies, most popular frontend libraries have ways to create webcomponents. Some examples include:

- React (via https://github.com/bitovi/react-to-webcomponent)
- Vue (via https://github.com/vuejs/vue-web-component-wrapper)
- Lit (no wrapper required)

Plugins receive the following props as input:

- val -- this is the value you are rendering, it has the type of your filename
- state -- this is the entire state tree, it has the type of `userState`
- client -- this is the rtag client instance (so you can make method calls from within your plugin), with type `RtagClient`

Example (from uno, using Lit):

```js
// Card.ts

import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { Card, Color } from "../.rtag/types";
import { RtagConnection } from "../.rtag/client";

export default class CardComponent extends LitElement {
  @property() val!: Card;
  @property() client!: RtagConnection;

  render() {
    return html`<div
      style=${styleMap({
        width: "50px",
        height: "75px",
        lineHeight: "75px",
        textAlign: "center",
        cursor: "pointer",
        backgroundColor: Color[this.val.color].toLowerCase(),
      })}
      @click="${() => this.client.playCard({ card: this.val })}"
    >
      ${this.val.value}
    </div>`;
  }
}
```

Which renders like this in the debug application:
![image](https://user-images.githubusercontent.com/5400947/134374863-612fb496-bb48-40c9-bbdc-ed4257565aea.png)

### Fully custom frontend

When you're ready to move away from the debug app, simply create an `index.html` file at the root of the `client` directory. This file now serves as the entry point to your frontend at http://localhost:4000, and can load code and other resources as needed. You are free to use any technologies you wish to build your frontend, just make sure to import the generated client to communicate with the rtag server.

The `rtag` frontend tooling is built around [vite](https://vitejs.dev/), which generally creates for a pleasant development experience.

For an example of a fully custom frotend built using rtag, see https://github.com/knigam/hive.
