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

After running the relevant `rtag` cli commands (see Quickstart), the following debug view is automatically generated:

[![image.png](https://i.postimg.cc/L6DLpLY3/image.png)](https://postimg.cc/1fgf0gK8)

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

Finally, we can see our working application in action:

[![image.png](https://i.postimg.cc/fyx7XPRG/image.png)](https://postimg.cc/Pv58n2Zy)

For more examples, check out the [examples](https://github.com/hpx7/rtag/tree/develop/examples) directory.

## Quickstart
1. Inside a new directory, create a `rtag.yml` file and fill it out as per your project specifications (see below)
2. Run `rtag init` to bootstrap your initial project structure
3. Run `rtag generate` to generate the framework specific files
4. Run `rtag install` to install dependencies
5. Run `rtag start` to start the server
6. View debug app at http://localhost:3000
7. As you make changes to the server-side implementation (entrypoint `server/impl.ts`), rtag will live-reload any changed files so that server restart is not required
