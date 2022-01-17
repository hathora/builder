# Type driven development

At the core of a Hathora application is the `rtag.yml` file. This file is where the API is defined which governs the communication between client and server. The `types` section is used to define the client data model and the `methods` section is used to define the server side functions and their associated api calls.

By leveraging this rich declarative format along with its code generation system, Hathora facilitates a programming style we like to call "type driven development", as everything done in the framework is powered by the data types you define. From the `rtag.yml` file, Hathora automatically generates the following components out of the box:

1. typesafe clients with the data types and api calls built in
2. the server interface with method stubs to be implemented
3. a prototype UI which allows for fast iteration and testing

> Note that the `rtag.yml` format is designed to be language agnostic, so all the code generation can be ported to produce output in any language. Typescript is the only current language implemented but support for others is coming soon.

Let's examine each these components based on the following example `rtag.yml` snippet:

```yml
# rtag.yml

types:
  GameStatus:
    - LOBBY
    - IN_PROGRESS
    - OVER
  Point:
    x: float
    y: float
  Player:
    id: UserId
    location: Point
    health: int
    score: int
  GameState:
    status: GameStatus
    players: Player[]

methods:
  createGame:
  moveTowards:
    location: Point
  sendMessage:
    user: UserId
    message: string
```

## Typesafe clients

The following will be generated inside `types.ts` in both the client and server:

```ts
// .hathora/types.ts (generated)

export enum GameStatus {
  LOBBY,
  IN_PROGRESS,
  OVER,
}
export type Point = {
  x: number;
  y: number;
};
export type Player = {
  id: UserId;
  location: Point;
  health: number;
  score: number;
};
export type GameState = {
  status: GameStatus;
  players: Player[];
};
```

And `client.ts` will have api calls generated which can be consumed in user code in the following manner:

```ts
// example user code

import { RtagConnection } from "./.hathora/client";

const connection: RtagConnection = getConnection(/* ... */);

document.addEventListener("click", (e: MouseEvent) => {
  connection.moveTowards({ x: e.clientX, y: e.clientY });
});

const someUserId = getUserId(/* ... */);
connection.sendMessage({ userId: someUserId, message: "Hello!" });
```

## Server interface

The following server interface will be generated in `methods.ts`:

```ts
// .hathora/methods.ts (generated)

import { Response } from "./base";
import { UserId, GameState, ICreateGameRequest, IMoveTowardsRequest, ISendMessageRequest } from "./types";

export interface Methods<T> {
  createGame(userId: UserId, ctx: Context, request: ICreateGameRequest): T;
  moveTowards(state: T, userId: UserId, ctx: Context, request: IMoveTowardsRequest): Response;
  sendMessage(state: T, userId: UserId, ctx: Context, request: ISendMessageRequest): Response;
  getUserState(state: T, userId: UserId): GameState;
}
```

And you must implement this interface in the server:

```ts
// impl.ts (user code)

import { Methods, Context } from "./.hathora/methods";
import { Response } from "./.hathora/base";
import { UserId, ICreateGameRequest, IMoveTowardsRequest, ISendMessageRequest, GameState } from "./.hathora/types";

type InternalState = // ...

export class Impl implements Methods<InternalState> {
  createGame(userId: UserId, ctx: Context, request: ICreateGameRequest): InternalState {
    // ...
  }
  moveTowards(state: InternalState, userId: UserId, ctx: Context, request: IMoveTowardsRequest): Response {
    // ...
  }
  sendMessage(state: InternalState, userId: UserId, ctx: Context, request: ISendMessageRequest): Response {
    // ...
  }
  getUserState(state: InternalState, userId: UserId): GameState {
    // ...
  }
}
```

## Prototype UI

The generated client and server components are sufficient to build out the required business logic for your app. However, starting a new project from scratch can be daunting as you have to implement the backend and frontend together in order to observe functionality.

Hathora makes this process easier by generating a "Prototype UI" for you out of the box, based entirely off of the `rtag.yml` definition. This allows you to immediately test out backend functionality without writing any frontend code. Over time, you can implement custom renderers (plugins) for the Prototype UI, and once you are ready it's easy to move to a fully custom frontend.

Here is an example Prototype UI view based on the example `rtag.yml` we have been working with:

![image](https://user-images.githubusercontent.com/5400947/149220486-5ce77fe6-d366-46eb-a0b6-c239a4a030cd.png)
