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
    myOptional?: MyEnum
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

TODO

## Server

The server has three responsibilities:

1. Creating the initial internal state
2. Mutating the internal state via methods and/or `onTick`
3. Deriving the appropritae `userState` per user from the internal state

### Internal State

For each stateId, the backend maintains an internal representation of the state in memory inside the server. The internal state type is passed into the `Methods` interface as a parameter so that it can enforce the correct class structure.

Note that in simple cases, the `userState` can be used as the type of internal state (see [chat example](../examples/chat/server/impl.ts)). However, many times you may want a separate representation of internal state which then gets converted to the `userState` via the `getUserState()` function.

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

Based on these inputs, the method can validate whether the action is permitted, returning an error response if not. Otherwise, the method can mutate `state` as desired and return a success response.

### getUserState

The `getUserState` function converts the internal state to the user state based on the user data.

Example (poker game):

```ts
// impl.ts

// ...
  getUserState(state: InternalState, user: UserData): PlayerState {
    const showdown =
      state.players.filter((p) => p.status === PlayerStatus.WAITING).length === 0 &&
      state.players.filter((p) => p.status === PlayerStatus.PLAYED).length > 1;
    return {
      players: state.players.map((player) => {
        const shouldReveal = player.name === user.name || (showdown && player.status === PlayerStatus.PLAYED);
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
// ...
```

### onTick

TODO

## Client

TODO
