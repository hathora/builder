# rtag - realtime app generator

## Overview

Rtag is a framework for building realtime applications with a focus on development experience.

### Features

Rtag comes out of the box with the following features so that developers don't have to think about them:

- Networking (state synchronization and RPC, efficient binary serialization)
- Authentication
- Automatic persistence
- Declarative API format with client generation
- Development server with hot reloading and built in debug UI

### Application spec

The foundation of an rtag application is the `rtag.yml` file, which defines various aspects of the application's behavior. One of the primary components the developer includes in this file is a fully typed API, which lists the server methods as well as the client state tree.

From this specification, rtag automatically generates the following:

- server side method stubs that set up the entire server code structure and just need to be filled in with the application's business logic
- clients for frontends to communicate with the rtag server in a typesafe manner
- a web-based debug application that allows for testing backend logic right away without writing any frontend code

## Installation

#### Requirements

- node v15+

Install rtag from the npm registry:

```
npm install -g rtag
```

## Example

The spec for a simple chat app:

```yml
# rtag.yml

types:
  Username: string
  Message:
    text: string
    sentAt: number
    sentBy: Username
    sentTo?: Username
  RoomState:
    name: string
    createdBy: Username
    messages: Message[]

methods:
  createRoom:
    name: string
  sendPublicMessage:
    text: string
  sendPrivateMessage:
    to: Username
    text: string

auth:
  anonymous:
    separator: "-"

userState: RoomState
initialize: createRoom
error: string
```

After running `rtag init`, `rtag generate`, `rtag install`, and `rtag start`, the following debug view is automatically generated:

![image](https://user-images.githubusercontent.com/5400947/134371999-eca307b9-4e28-4313-96c1-1f8cbcbddec3.png)

We then fill in the methods in `server/impl.ts` with our desired implementation:

```ts
import { Methods, Context } from "./.rtag/methods";
import { UserData, Response } from "./.rtag/base";
import { RoomState, ICreateRoomRequest, ISendPublicMessageRequest, ISendPrivateMessageRequest } from "./.rtag/types";

export class Impl implements Methods<RoomState> {
  createRoom(user: UserData, ctx: Context, request: ICreateRoomRequest): RoomState {
    return { name: request.name, createdBy: user.name, messages: [] };
  }
  sendPublicMessage(state: RoomState, user: UserData, ctx: Context, request: ISendPublicMessageRequest): Response {
    state.messages.push({ text: request.text, sentAt: ctx.time(), sentBy: user.name });
    return Response.ok();
  }
  sendPrivateMessage(state: RoomState, user: UserData, ctx: Context, request: ISendPrivateMessageRequest): Response {
    state.messages.push({ text: request.text, sentAt: ctx.time(), sentBy: user.name, sentTo: request.to });
    return Response.ok();
  }
  getUserState(state: RoomState, user: UserData): RoomState {
    return {
      name: state.name,
      createdBy: state.createdBy,
      messages: state.messages.filter(
        (msg) => msg.sentBy === user.name || msg.sentTo === user.name || msg.sentTo === undefined
      ),
    };
  }
}
```

> Note that currently, the only backend language supported is typescript. More language support is planned for the future.

Finally, we can see our working application in action:

![image](https://user-images.githubusercontent.com/5400947/134372344-6b4ed46c-feed-4776-95f8-9d0499570b76.png)

For more examples, check out the [examples directory](https://github.com/hpx7/rtag/tree/develop/examples).

## Furthur information

For a more detailed guide, check out the [reference docs](docs/reference.md).

If you have any questions/suggestions or want to report a bug, please feel free to file an issue or start a discussion on Github!
