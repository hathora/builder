# Hathora - multiplayer game framework

## Overview

Hathora is a framework for building multiplayer games and other realtime applications with a focus on development experience.

### Features

Hathora comes out of the box with the following features so that developers don't have to think about them:

- Networking (state synchronization and RPC, efficient binary serialization)
- Authentication
- Automatic persistence
- Declarative API format with client generation
- Development server with hot reloading and built in debug UI

### Application spec

The foundation of an hathora application is the `rtag.yml` file, which defines various aspects of the application's behavior. One of the primary components the developer includes in this file is a fully typed API, which lists the server methods as well as the client state tree.

From this specification, hathora automatically generates the following:

- server side method stubs that set up the entire server code structure and just need to be filled in with the application's business logic
- clients for frontends to communicate with the hathora server in a typesafe manner
- a web-based debug application that allows for testing backend logic right away without writing any frontend code

## Installation

#### Requirements

- node v16.12.0+

Install hathora from the npm registry:

```
npm install -g hathora
```

## Example

First, create a directory for your application and create a `rtag.yml` file inside the directory with the following contents:

```yml
# rtag.yml

types:
  Message:
    text: string
    sentAt: int
    sentBy: UserId
    sentTo: UserId?
  RoomState:
    name: string
    createdBy: UserId
    messages: Message[]

methods:
  createRoom:
    name: string
  sendPublicMessage:
    text: string
  sendPrivateMessage:
    text: string
    to: UserId

auth:
  anonymous:
    separator: "-"

userState: RoomState
initialize: createRoom
error: string
```

Next, run `hathora init` to initialize your project. Then run `hathora dev` to start the debug server. Visit http://localhost:3000 where you see the following Prototype UI view:

![image](https://user-images.githubusercontent.com/5400947/147288712-f34b92d8-b86a-40c9-a7cc-0d7efcb545b5.png)


We then fill in the methods in `server/impl.ts` with our desired implementation:

```ts
import { Methods, Context } from "./.rtag/methods";
import { Response } from "./.rtag/base";
import {
  UserId,
  RoomState,
  ICreateRoomRequest,
  ISendPublicMessageRequest,
  ISendPrivateMessageRequest,
} from "./.rtag/types";

export class Impl implements Methods<RoomState> {
  createRoom(userId: UserId, ctx: Context, request: ICreateRoomRequest): RoomState {
    return { name: request.name, createdBy: userId, messages: [] };
  }
  sendPublicMessage(state: RoomState, userId: UserId, ctx: Context, request: ISendPublicMessageRequest): Response {
    state.messages.push({ text: request.text, sentAt: ctx.time(), sentBy: userId });
    return Response.ok();
  }
  sendPrivateMessage(state: RoomState, userId: UserId, ctx: Context, request: ISendPrivateMessageRequest): Response {
    state.messages.push({ text: request.text, sentAt: ctx.time(), sentBy: userId, sentTo: request.to });
    return Response.ok();
  }
  getUserState(state: RoomState, userId: UserId): RoomState {
    return {
      name: state.name,
      createdBy: state.createdBy,
      messages: state.messages.filter(
        (msg) => msg.sentBy === userId || msg.sentTo === userId || msg.sentTo === undefined
      ),
    };
  }
}
```

> Note that currently, the only backend language supported is typescript. More language support is planned for the future.

Finally, we can see our working application in action:

![image](https://user-images.githubusercontent.com/5400947/144970065-f7754d32-d80f-48fe-a350-71a77f803ac7.png)

Here are some example apps built with hathora:

- [avalon](examples/avalon)
- [chess](examples/chess)
- [codenames](examples/codenames)
- [poker](examples/poker)
- [rock-paper-scissor](examples/rock-paper-scissor)
- [uno](examples/uno)
- [ship-battle](https://github.com/hpx7/ship-battle)
- [hive](https://github.com/knigam/hive)

## Additional resources

For a high level overview of hathora concepts and goals, see [concepts](docs/concepts.md). For more details on how to implement an hathora application, check out the [reference docs](docs/reference.md).

If you have any questions/suggestions or want to report a bug, please feel free to file an issue or start a discussion on Github!
