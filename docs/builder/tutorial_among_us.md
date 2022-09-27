# Tutorial: Among Us (Part 1)

For this tutorial, we’re going to see what it’s like to build a game similar to [Among Us](https://www.innersloth.com/games/among-us/) using Hathora Builder.

## Repo

The full code for this game can be found [here](https://github.com/hathora/among-us-tutorial). The repo includes instructions for running it locally, and you can also play the deployed version [here](https://among-us-tutorial.surge.sh/).

This is what our game will look like by the end of this tutorial:

![image](https://user-images.githubusercontent.com/5400947/154554747-2418c0c1-2658-45ea-bcd9-331cea37fabc.png)

## Install

Before you begin, make sure you have nodejs v16.12+ and the Hathora cli installed:

```sh
npm install -g hathora
```

## hathora.yml

To start, create a directory called `among-us-tutorial` and create a `hathora.yml` file. This file defines the client data model and the server functions for our application. For more information on the hathora.yml file format, see [here](type-driven-development).

```yml
# hathora.yml

types:
  # Location is a 2d coordinate
  Location:
    x: float
    y: float
  # Player has a userId and a location
  Player:
    id: UserId
    location: Location
  # GameState has an array of players
  GameState:
    players: Player[]

methods:
  # joinGame will let players join the game
  joinGame:
  # we'll call moveTo when the user clicks on the map to set their target location
  moveTo:
    location: Location

# use anonymous login to keep things simple for now
auth:
  anonymous: {}

# tell the server to send the value of GameState to all clients (and keep it updated as state changes)
userState: GameState
# set the error type to string
error: string
# configure the server tick to run every 50ms (20 times a second)
tick: 50
```

You'll notice below that there is not much specific to Among Us right now -- to start with we'll just get some players moving around on a map, and then we'll add more specific Among Us functionality in Part 2.

To initialize our project structure run `hathora init`. You should see the following directory structure generated for you:

```
among-us-tutorial          # project root
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

type InternalState = GameState;

export class Impl implements Methods<InternalState> {
  initialize(ctx: Context, request: IInitializeRequest): InternalState {
    return {
      players: [],
    };
  }
  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    return Response.error("Not implemented");
  }
  moveTo(state: InternalState, userId: UserId, ctx: Context, request: IMoveToRequest): Response {
    return Response.error("Not implemented");
  }
  getUserState(state: InternalState, userId: UserId): GameState {
    return state;
  }
  onTick(state: InternalState, ctx: Context, timeDelta: number): void {}
}
```

Next, run `hathora dev` to start the development server. Visit http://localhost:3000 where you should see the following Prototype UI view after logging in and creating a game:

![image](https://user-images.githubusercontent.com/5400947/154374528-aacd309d-66e7-45a8-8557-bcdd1fa85c12.png)

## Initial backend logic

Because of the default implementation, we don't see any real data and clicking Submit for any of the methods displays a "Not implemented" error. Let's fix this by implementing our `joinGame` method:

```ts
// impl.ts

  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    // add the user who called this function to the players array
    // start them off at (0, 0)
    state.players.push({ id: userId, location: { x: 0, y: 0 } });
    return Response.ok();
  }
```

See [here](methods) for more details about how server methods works.

> The Hathora Builder dev server supports hot reloading of both backend and frontend, so you shouldn't need to restart the server when making edits to your code.

Going back to the Prototype UI, we can see our working application in action. Login, create a game, and join it as another user from a different tab. You should be able to see both users get added to the players array.

![gif](https://user-images.githubusercontent.com/5400947/154374350-07d5a2ba-cc68-4239-ac58-fd0260b10e32.gif)

## moveTo and onTick

Now that we have a feel for how to add backend logic and test it with the Prototype UI, let's try and implement the logic to move players around the map.

In order to implement moveTo, we’ll need to modify `InternalState` to contain the target location per player. We’ll do that inside an InternalPlayer object. Note that this field is only stored in the server and we don’t send it to the client.

```ts
// impl.ts

type InternalPlayer = {
  id: UserId;
  location: Location;
  target?: Location;
};
type InternalState = {
  players: InternalPlayer[];
};
```

Now it’s straightforward to implement moveTo – we’ll find the player who called the method by their userId, validate that they’ve joined, then set their target to the location the client provided us.

```ts
// impl.ts

  moveTo(state: InternalState, userId: UserId, ctx: Context, request: IMoveToRequest): Response {
    const player = state.players.find((p) => p.id === userId);
    if (player === undefined) {
      return Response.error("Not joined");
    }
    player.target = request.location;
    return Response.ok();
  }
```

The [onTick](server.md?id=ontick) function allows us to add logic that runs at a fixed interval in the server. We’ll implement the actual movement logic here by moving each player towards their target at a constant speed.

```ts
  onTick(state: InternalState, ctx: Context, timeDelta: number): void {
    const PLAYER_SPEED = 100;
    for (const player of state.players) {
      if (player.target !== undefined) {
        const dx = player.target.x - player.location.x;
        const dy = player.target.y - player.location.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pixelsToMove = PLAYER_SPEED * timeDelta;
        if (dist <= pixelsToMove) {
          player.location = player.target;
        } else {
          player.location.x += (dx / dist) * pixelsToMove;
          player.location.y += (dy / dist) * pixelsToMove;
        }
      }
    }
  }
```

As before, we visit the Prototype UI to test our changes:

![gif](https://user-images.githubusercontent.com/5400947/154375956-b61b9cdf-8cf6-4731-8232-aca686d5d54f.gif)

## Creating a plugin

To better visualize the player locations, let’s create a plugin for the `GameState`. Plugins are custom components that get user state as input and render it however they want.

You can use frameworks like React, Vue, Lit, etc to implement your plugin, but we’ll go with a simple approach and define ours using the native javascript apis:

```sh
hathora create-plugin native GameState
```

Hathora creates a plugin skeleton for us in `client/prototype-ui/plugins/GameState/index.ts`:

```ts
// GameState/index.ts

import { GameState } from "../../../../api/types";
import { HathoraConnection } from "../../../.hathora/client";

export default class GameStatePlugin extends HTMLElement {
  val!: GameState;
  state!: GameState;
  client!: HathoraConnection;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {}
}
```

Lets fill in the `connectedCallback()` function with logic to render players as circles on a 800 by 600 canvas, and also move players to our cursor location when we click.

```ts
  connectedCallback() {
    // create 800x600 canvas with a black border
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.border = "1px solid black";
    this.shadowRoot!.append(canvas);
    const ctx = canvas.getContext("2d")!;

    // call the moveTo method when we click
    canvas.onclick = (e: MouseEvent) => {
      this.client?.moveTo({ location: { x: e.offsetX, y: e.offsetY } });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // draw each player as a black circle with a radius of 15
      ctx.strokeStyle = "black";
      this.state.players.forEach((player) => {
        ctx.beginPath();
        ctx.arc(player.location.x, player.location.y, 15, 0, 2 * Math.PI);
        ctx.stroke();
      });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }
```

After running `hathora dev` again, we can see this nice visualization of our players:

![gif](https://user-images.githubusercontent.com/5400947/154377517-bd36b47f-bdbf-40cd-a502-d8c333d90d4d.gif)

## Custom UI

As the final step of this part of the tutorial, let's add a custom UI for our game.

We can do this by simply creating a `client/web/index.html` file. This file will act as the entry point to our web application, and we can import any files and use any framework we would like.

For this tutorial I have chosen to use the [PixiJS](https://pixijs.com/) library for rendering the frontend. I grabbed player assets from https://www.spriters-resource.com/pc_computer/amongus/ and the background image for the map from https://among-us.fandom.com/wiki/The_Skeld.

The full code for the UI can be found at https://github.com/hathora/among-us-tutorial/tree/develop/client/web -- it's roughly 130 lines of typescript.

To see the final result, run `hathora dev` and visit http://localhost:3000. Here's an example of two players joining the same game instance:

[mp4](https://user-images.githubusercontent.com/5400947/154386873-a5dd9dbe-fe98-4943-87a8-e5f59fec9107.mp4 ":include")

## Next steps

In the next part of the tutorial (coming soon), we'll look into adding collision detection, differentiating between imposters and crewmates, and deploying to the cloud.
