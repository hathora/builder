# Tutorial

First, create a directory for your application and create a `hathora.yml` file inside the directory with the following contents:

```yml
# hathora.yml

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

> If you plan on using git, this is also a good time to run `git init`

We then fill in the methods in `server/impl.ts` with our desired implementation:

```ts
import { Methods, Context } from "./.hathora/methods";
import { Response } from "./.hathora/base";
import {
  UserId,
  RoomState,
  ICreateRoomRequest,
  ISendPublicMessageRequest,
  ISendPrivateMessageRequest,
} from "./.hathora/types";

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
