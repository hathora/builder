# Server

The server has three responsibilities:

1. Creating the initial internal state
2. Mutating the internal state via methods and/or `onTick`
3. Deriving the appropriate `userState` per user from the internal state

## Internal State

For each stateId, the backend maintains an internal representation of the state in memory inside the server. The internal state type is passed into the `Methods` interface as a parameter so that it can enforce the correct class structure. The server entrypoint must export a class conforming to this `Methods` interface.

Note that in simple cases, the `userState` can be used as the type of internal state (see [chat example](https://github.com/hathora/hathora/tree/develop/examples/chat)). However, many times you may want a separate representation of internal state which then gets converted to the `userState` via the `getUserState()` function. By having this separation between server state and user state, you can do things like:

- enforce privacy by selectively allowing access to parts of the state per user (e.g. private messages in chat example)
- allow for a more optimized data structure in the server (e.g. chess.js in chess example)
- derive certain properties rather than store them (e.g. game status in codenames example)

The internal state can be composed of any primitives and built in data structures of the language, including objects, classes, and functions.

The internal state is first created via the `initialize` method:

Example (poker game):
```ts
// impl.ts

// ...

export class Impl implements Methods<InternalState> {
  initialize(userId: UserId, ctx: Context): InternalState {
    return {
      players: [createPlayer(userId)],
      dealerIdx: 0,
      activePlayerIdx: 0,
      revealedCards: [],
      smallBlindAmt: 0,
      deck: [],
    };
  }
  // ...
}
```

## Mutation

The server mutates state via the functions defined in the `methods` section of `hathora.yml` or via the special `onTick` function.

Methods receive four arguments as input:

1. `state`: the internal state describe above
2. `userId`: the id of the user who called the method
3. `ctx`: a context object, which must be used for sources of nondeterminism (random values, current time, api calls)
4. `request`: the input arguments to the method as defined in `hathora.yml`

Based on these inputs, the method can validate whether the action is permitted, returning an error response if not. Otherwise, the method can mutate `state` as desired and return a success response. Any mutations that occur will ultimately be reflected in the client state via the `getUserState` function.

## getUserState

The `getUserState` function converts the internal state to the user state based on the userId.

Example (poker game):

```ts
  getUserState(state: InternalState, userId: UserId): PlayerState {
    return {
      players: state.players.map((player) => {
        const shouldReveal = player.id === userId || (showdown && player.status === PlayerStatus.PLAYED);
        return {
          ...player,
          cards: shouldReveal ? player.cards.map((card) => ({ rank: card[0], suit: card[1] })) : [],
        };
      }),
      dealer: state.players[state.dealerIdx].id,
      activePlayer: state.players[state.activePlayerIdx].id,
      revealedCards: state.revealedCards.map((card) => ({ rank: card[0], suit: card[1] })),
    };
  }
```

## onTick

Sometimes apps may want some way to execute logic in the backend at a fixed interval outside of user called methods. Common use cases for this include running simulations (e.g. physics simulations in games), sending notifications, or updating clocks/timers.

To enable this functionality, simply set the `tick` key in `hathora.yml` to an integer (>= 50) representing the interval at which the server will call the `onTick` function. This will add an `onTick` function to the `Methods` interface. The `onTick` function takes the internal state, context object, and time delta (representing the milliseconds elapsed since the previous `onTick` invocation) as arguments. Any mutations that occur inside this function will be handled the same way as mutations inside the methods.
