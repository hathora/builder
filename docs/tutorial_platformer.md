# Tutorial: Platformer

For this tutorial, we'll build a multiplayer 2D platformer using [Phaser](http://phaser.io/) and the Hathora framework.

The full code for the game can be found on [Github](https://github.com/hathora/platformer-tutorial), and a live version of the game deployed on Hathora Cloud can be accessed [here](https://platformer-tutorial.surge.sh/).

## Install

Before you begin, make sure you have nodejs v16.12+ and the Hathora cli installed:

```sh
npm install -g hathora
```

## Setup

To start, create a directory called platformer-tutorial and create a `hathora.yml` file. This file defines the client data model and the server functions for our application. For more information on the hathora.yml file format, see [here](https://docs.hathora.dev/#/type-driven-development).

```yml
types:
  # Direction enums
  XDirection:
    - NONE
    - LEFT
    - RIGHT
  YDirection:
    - NONE
    - UP
    - DOWN

  # Game objects
  Position:
    x: float
    y: float
  Direction:
    horizontal: XDirection
    vertical: YDirection
  Player:
    id: UserId
    position: Position
    direction: Direction

  # Main game state
  GameState:
    players: Player[]

# RPC definitions
methods:
  joinGame:
  setDirection:
    direction: Direction

# Authentication config
auth:
  anonymous: {}

userState: GameState
error: string
tick: 50
```

To initialize our project structure run `hathora init`. You should see the following directory structure generated for you:

```
platformer-tutorial        # project root
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

The generated `server/impl.ts` file should look like this:

```ts
import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  XDirection,
  YDirection,
  Position,
  Direction,
  Player,
  GameState,
  UserId,
  IInitializeRequest,
  IJoinGameRequest,
  ISetDirectionRequest,
} from "../api/types";

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
  setDirection(state: InternalState, userId: UserId, ctx: Context, request: ISetDirectionRequest): Response {
    return Response.error("Not implemented");
  }
  getUserState(state: InternalState, userId: UserId): GameState {
    return state;
  }
  onTick(state: InternalState, ctx: Context, timeDelta: number): void {}
}
```

Now run `hathora dev` to start the development server. Visit http://localhost:3000 where you should see the following empty Prototype UI view after logging in and creating a game:

<img width="2559" alt="image" src="https://user-images.githubusercontent.com/5400947/185243363-9717a528-f8ef-4067-b703-b93b46495811.png">

## Join Game

At this point, the methods all return "Not implemented" errors so you can't do much with the Prototype UI. Let's fix that by implementing our `joinGame` method:

```ts
// impl.ts

  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    state.players.push({
      id: userId,
      position: { x: 0, y: 0 },
      direction: Direction.default(),
    });
    return Response.ok();
  }
```

If we open two browser tabs, we can test this method and see the Hathora multiplayer functionality in action:

![Screen Recording](https://user-images.githubusercontent.com/5400947/185440365-a3a08118-8ba9-4df2-a50a-6aa8b7cb11c3.gif)

## Physics

Next, let's add a physics engine to our server. Cd into the `server` directory add run `npm install arcade-physics` to install the [Arcade Physics](https://github.com/yandeu/arcade-physics) package from npm.

We can now import this package inside of `impl.ts` and set it up so that the when players join a room, they spawn at the top left corner of the screen and fall to the floor.

```ts
import { ArcadePhysics } from "arcade-physics";
import { Body } from "arcade-physics/lib/physics/arcade/Body";

type InternalPlayer = {
  id: UserId;
  body: Body;
  direction: { horizontal: number; vertical: number };
};
type InternalState = {
  physics: ArcadePhysics;
  players: InternalPlayer[];
};

export class Impl implements Methods<InternalState> {
  initialize(ctx: Context, request: IInitializeRequest): InternalState {
    const physics = new ArcadePhysics({
      sys: {
        game: { config: {} },
        settings: { physics: { gravity: { y: 300 } } },
        scale: { width: 800, height: 600 },
      },
    });
    return {
      physics,
      players: [],
    };
  }
  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    if (state.players.some((player) => player.id === userId)) {
      return Response.error("Already joined");
    }
    // spawn player at (0, 0)
    const playerBody = state.physics.add.body(0, 0, 32, 32);
    playerBody.setCollideWorldBounds(true, undefined, undefined, undefined);
    playerBody.pushable = false;
    state.players.push({ id: userId, body: playerBody, direction: Direction.default() });
    return Response.ok();
  }
  setDirection(state: InternalState, userId: UserId, ctx: Context, request: ISetDirectionRequest): Response {
    return Response.error("Not implemented");
  }
  getUserState(state: InternalState, userId: UserId): GameState {
    // map InternalState to GameState
    return {
      players: state.players.map((player) => {
        const { x, y } = player.body;
        return {
          id: player.id,
          position: { x, y },
          direction: player.direction,
        };
      }),
    };
  }
  onTick(state: InternalState, ctx: Context, timeDelta: number): void {
    // update the physics simulation to apply gravity, velocities, etc
    state.physics.world.update(ctx.time, timeDelta * 1000);
  }
}
```
Opening up the Prototype UI, we can see the player fall to the ground due to gravity:

![Screen Recording](https://user-images.githubusercontent.com/5400947/185244637-2914f026-3eb7-4980-a321-51a346315be4.gif)

## Movement

Since this is a platformer game, players need to move around the map. The client will call the `setDirection` method to register player input with the server, and the server will update the player velocities based on their most recent input.

```ts
  setDirection(state: InternalState, userId: UserId, ctx: Context, request: ISetDirectionRequest): Response {
    const player = state.players.find((player) => player.id === userId);
    if (player === undefined) {
      return Response.error("Not joined");
    }
    // register player input
    player.direction = request.direction;
    return Response.ok();
  }
  getUserState(state: InternalState, userId: UserId): GameState {
    // map InternalState to GameState
    return {
      players: state.players.map((player) => {
        const { x, y, velocity } = player.body;
        return {
          id: player.id,
          position: { x, y },
          direction: {
            horizontal: velocity.x < 0 ? XDirection.LEFT : velocity.x > 0 ? XDirection.RIGHT : XDirection.NONE,
            vertical: velocity.y < 0 ? YDirection.UP : velocity.y > 0 ? YDirection.DOWN : YDirection.NONE,
          },
        };
      }),
    };
  }
  onTick(state: InternalState, ctx: Context, timeDelta: number): void {
    // set player velocities based on their inputs
    state.players.forEach((player) => {
      if (player.direction.horizontal === XDirection.LEFT && !player.body.blocked.left) {
        player.body.setVelocityX(-200);
      } else if (player.direction.horizontal === XDirection.RIGHT && !player.body.blocked.right) {
        player.body.setVelocityX(200);
      } else if (player.direction.horizontal === XDirection.NONE) {
        player.body.setVelocityX(0);
      }
      if (player.direction.vertical === YDirection.UP && player.body.blocked.down) {
        player.body.setVelocityY(-200);
      }
    });
    // update the physics simulation to apply gravity, velocities, etc
    state.physics.world.update(ctx.time, timeDelta * 1000);
  }
```

We can now set the vertical direction to `UP`, causing the player to jump up and down repeatedly:

![Screen Recording](https://user-images.githubusercontent.com/5400947/185248630-c7e71b43-5859-4650-a488-01ea49e1a724.gif)

## Phaser Frontend

While the Prototype UI has been convenient for testing backend functionality so far, the time has come to add a custom frontend so that we can get a feel for the gameplay.

Run the following command to create a custom phaser client:

```sh
hathora create-client phaser web
```

This command will create a `client/web` directory with a basic Phaser template.

First, grab the images from https://github.com/hathora/platformer-tutorial/tree/develop/client/web/src/assets (thanks [Pixel Frog](https://pixelfrog-assets.itch.io/pixel-adventure-1)!) and place them inside a `client/web/src/assets` folder.

Next, let's edit the template to load these assets and display the background + player sprite.

```ts
// client/web/src/app.ts

export class GameScene extends Phaser.Scene {
  private connection!: HathoraConnection;
  private players: Map<UserId, Phaser.GameObjects.Sprite> = new Map();

  constructor() {
    super("game");
  }

  preload() {
    // load assets
    this.load.image("background", "background.png");
    this.load.image("platform", "platform.png");
    this.load.spritesheet("player", "player.png", { frameWidth: 32, frameHeight: 32 });
  }

  init() {
    // initialize server connection
    getToken().then(async (token) => {
      const stateId = await getStateId(token);
      this.connection = await client.connect(
        token,
        stateId,
        ({ state, updatedAt }) => {
          // handle state update from server
          state.players.forEach((player) => {
            if (!this.players.has(player.id)) {
              this.addPlayer(player);
            } else {
              this.updatePlayer(player);
            }
          });
        },
        (err) => console.error("Error occured", err.message)
      );
      await this.connection.joinGame({});
    });
  }

  create() {
    // background
    this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "background").setOrigin(0, 0);
  }

  update() {}

  private addPlayer({ id, position }: Player) {
    const sprite = this.add.sprite(position.x, position.y, "player").setOrigin(0, 0);
    this.players.set(id, sprite);
  }

  private updatePlayer({ id, position, direction }: Player) {
    const sprite = this.players.get(id)!;
    sprite.x = position.x;
    sprite.y = position.y;
  }
}
```

Run `hathora dev` again and visit http://localhost:3001 this time. You should see our character falling to the ground:

![Screen Recording](https://user-images.githubusercontent.com/5400947/185427191-28ee7c10-6a5b-4657-a80f-70b7a992925d.gif)

Next we'll set up keyboard input to control the character inside of the `create()` method:

> remember to add all missing imports

```ts
  create() {
    // background
    this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "background").setOrigin(0, 0);

    // keyboard input
    const keys = this.input.keyboard.createCursorKeys();
    const handleKeyEvt = () => {
      const horizontal = keys.left.isDown ? XDirection.LEFT : keys.right.isDown ? XDirection.RIGHT : XDirection.NONE;
      const vertical = keys.up.isDown ? YDirection.UP : YDirection.NONE;
      this.connection.setDirection({ direction: { horizontal, vertical } });
    };
    this.input.keyboard.on("keydown", handleKeyEvt);
    this.input.keyboard.on("keyup", handleKeyEvt);
  }
```

![Screen Recording](https://user-images.githubusercontent.com/5400947/185431070-ef5938ec-c373-418e-bd2f-bf054af6f988.gif)

Finally we are ready to animate the character:

```ts
  create() {
    // background
    this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "background").setOrigin(0, 0);

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 10 }),
      frameRate: 15,
    });
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player", { start: 11, end: 22 }),
    });
    this.anims.create({
      key: "jump",
      frames: [{ key: "player", frame: 23 }],
    });
    this.anims.create({
      key: "fall",
      frames: [{ key: "player", frame: 24 }],
    });

    // ...
  }

  // ...

  private updatePlayer({ id, position, direction }: Player) {
    const sprite = this.players.get(id)!;

    // play animation based on player direction
    if (direction.horizontal === XDirection.LEFT) {
      sprite.setFlipX(true).anims.play("walk", true);
    } else if (direction.horizontal === XDirection.RIGHT) {
      sprite.setFlipX(false).anims.play("walk", true);
    } else if (direction.vertical === YDirection.NONE) {
      sprite.anims.play("idle", true);
    }
    if (direction.vertical === YDirection.UP) {
      sprite.anims.play("jump", true);
    } else if (direction.vertical === YDirection.DOWN) {
      sprite.anims.play("fall", true);
    }

    sprite.x = position.x;
    sprite.y = position.y;
  }
```

![Screen Recording](https://user-images.githubusercontent.com/5400947/185432974-5b6ceca7-b965-4852-8acf-f6aa718183ef.gif)

## Platforms

The final functionality that we'll implement are platforms for our character to jump on.

We start by creating a top level `shared/common.ts` file which will be imported by both the client and the server. We can define our platforms here:

```ts
export type Platform = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export const PLATFORMS: Platform[] = [
  { x: 40, y: 530, width: 288, height: 16 },
  { x: 340, y: 440, width: 192, height: 16 },
  { x: 140, y: 350, width: 192, height: 16 },
  { x: 360, y: 270, width: 288, height: 16 },
  { x: 704, y: 200, width: 96, height: 16 },
];
```

Inside the `shared` directory we also need a `package.json` file:
```json
{
  "name": "platformer-tutorial-server",
  "type": "module",
  "devDependencies": {
    "typescript": "^4.5.2"
  },
  "dependencies": {
    "arcade-physics": "^0.0.2"
  }
}
```

On the server, we modify our `initialize` function to add the platforms to the physics simulation, and in `joinGame` we set up colliders between players and platforms:

> remember to import the `common.ts` file

```ts
// impl.ts

  initialize(ctx: Context, request: IInitializeRequest): InternalState {
    const physics = new ArcadePhysics({
      sys: {
        game: { config: {} },
        settings: { physics: { gravity: { y: 200 } } },
        scale: { width: 800, height: 600 },
      },
    });
    return {
      physics,
      players: [],
      platforms: PLATFORMS.map((platform) => {
        return physics.add
          .body(platform.x, platform.y, platform.width, platform.height)
          .setAllowGravity(false)
          .setImmovable(true);
      }),
    };
  }
  joinGame(state: InternalState, userId: UserId): Response {
    if (state.players.some((player) => player.id === userId)) {
      return Response.error("Already joined");
    }

    // spawn player at (0, 0)
    const playerBody = state.physics.add.body(0, 0, 32, 32);
    playerBody.setCollideWorldBounds(true, undefined, undefined, undefined);
    playerBody.pushable = false;
    state.players.push({ id: userId, body: playerBody, direction: Direction.default() });

    // set up colliders with other players and platforms
    state.players.forEach((player) => state.physics.add.collider(playerBody, player.body));
    state.platforms.forEach((platformBody) => state.physics.add.collider(playerBody, platformBody));
    return Response.ok();
  }
```

On the client, we simply add the platform sprites to our scene inside the Phaser `create()` method:

> remember to import the `common.ts` file

```ts
// app.ts

  create() {
    // background
    this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "background").setOrigin(0, 0);

    // platforms
    PLATFORMS.forEach((platform) => {
      this.add.tileSprite(platform.x, platform.y, platform.width, platform.height, "platform").setOrigin(0, 0);
    });

    // ...
  }
```

The final game looks like this:

![Screen Recording](https://user-images.githubusercontent.com/5400947/185454621-972130ca-35ba-4db6-a7d3-2280286c4d03.gif)
