<div class="hathora-logo-with-super">
  <img src="statics/reg-logo.svg" alt="drawing" width="200"/>
  <span class="hathora-logo-super">BuildKit</span>
</div>

<a href="https://github.com/hathora/buildkits/tree/main/typescript-client-sdk" target="_blank" class="hathora-gh-link">
  <img src="statics/GitHub-Mark-Light-32px.png" alt="GitHub logo" height="14" width="14"/>
  <span>Hathora BuildKit</span>
  <span class="hathora-link-icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
      </svg>
  </span>
</a>

Hathora BuildKits are lightweight networking libraries. They make it easier to write real-time client-server applications in JavaScript. 

## Benefits

- Import a simple library to provide powerful and scalable messaging infrastructure
- Easy deployment onto Hathora Cloud, which provides global compute scheduling and an optimized edge network
- Flexible with regards to language, persistence, serialization techniques, etc (currently only Typescript is supported, but more languages coming soon)

## Getting Started

> Please see the [Reference](/buildkit/reference.md) for details and checkout our [tutorial](/buildkit/tutorial_top_down_shooter.md) for a full walkthrough.

#### Server

1. Create a new directory with the following `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true
  }
}
```

2. Inside this typescript project, install the server SDKs: `npm i @hathora/server-sdk`. Also install the required dev dependencies: `npm i -D typescript ts-node @types/node`.
3. Log onto [Hathora Console](https://console.hathora.dev/login) and [create an application](https://hathora.dev/docs/guides/deploy-hathora#create-an-application).
4. Grab the `appId` + `appSecret` from your application's page as seen below.

<img src="statics/appId-appSecret.png" alt="drawing" width="300"/>

5. Set the `HATHORA_APP_SECRET` environment variable and create the following `server.mts` file:

```ts
// server.mts

// ...

const store: Application = {
  // A function called by Hathora to verify a connecting user's token
  verifyToken(token: string): UserId | undefined {
    const userId = verifyJwt(token, "YOUR_HATHORA_APP_SECRET");

    if (userId === undefined) {
      console.error("Failed to verify token", token);
    }

    return userId;
  },

  // Called when a new user connects to your server, this is a good place to init rooms and spawn players
  subscribeUser(roomId: RoomId, userId: string): void {
    // Make sure the room exists (or create one if not)
    if (!rooms.has(roomId)) {
      console.log("Creating new room...");

      rooms.set(roomId, {
        players: []
      });
    }

    const game = rooms.get(roomId)!;

    // Make sure the player hasn't already spawned, then spawn them
    if (!game.players.some((player) => player.id === userId)) {
      game.players.push({
        id: userId,
        x: 0,
        y: 0
      });
    }
  },

  // Called when a user disconnects from your server, this is a good place to cleanup data for that player
  unsubscribeUser(roomId: RoomId, userId: string): void {
    // Make sure the room exists
    if (!rooms.has(roomId)) {
      return;
    }
    
    const game = rooms.get(roomId)!;
    const idx = game.players.findIndex((player) => player.id === userId);
    
    // Remove the player from the room's state
    if (idx >= 0) {
      game.players.splice(idx, 1);
    }
  },

  // Called when a message is sent to the server for handling, much of your core logic will live here
  async onMessage(roomId: RoomId, userId: string, data: ArrayBuffer): Promise<void> {
    // Make sure the room exists
    if (!rooms.has(roomId)) {
      return;
    }

    // Get the player, or return out of the function if they don't exist
    const game = rooms.get(roomId)!;
    const player = game.players.find((player) => player.id === userId);
    if (player === undefined) {
      return;
    }

    // Parse out the data string being sent from the client
    const message = JSON.parse(Buffer.from(data).toString("utf8"));

    if (message.type === 'test-message') {
      if (message.value === 'Hello Hathora server!') {
        // Define a response message...
        const msg = {
          type: 'test-response',
          value: 'Hello Hathora clients!'
        };

        // Then broadcast it to all connected clients in this room
        server.broadcastMessage(roomId, Buffer.from(JSON.stringify(msg), "utf8"));
      }
    }
    // else if (message.type === 'some-other-action') {
    //   // (handle other message types)
    // }
  }
};

// Boot server
const port = 4000;
const server = await startServer(store, port);
console.log(`Server listening on port ${port}`);
```

#### Client

Once your server is connected to the Coordinator, you can start passing messages back and forth. Let's build a client to do that.

1. In your typescript project, install the client SDKs: `npm i @hathora/client-sdk`
2. Fill in the `APP_ID` from above. Establish a connection using the `onMessage` and `onError` methods:

```ts
// client.mts
import { HathoraClient } from "@hathora/client-sdk";

async function establishConnection() {
  // Instantiate an object which represents our local connection info...
  const connectionInfo = {
    host: "localhost",
    port: 4000,
    transportType: "tcp" as const
  };

  // Or pass undefined if working in a production Hathora environment
  // const connectionInfo = undefined;

  // Instantiate our client object (this is where you provide a valid Hathora APP_ID, which here is being passed via an environment variable)
  const client = new HathoraClient("YOUR_HATHORA_APP_ID", connectionInfo);

  // Use the client to get a token for the user
  const token = await client.loginAnonymous();

  // You can now create a new public room
  const newPublicRoomId = await client.createPublicLobby(token);

  // Or a new private room
  const newPrivateRoomId = await client.createPrivateLobby(token);

  // And query for existing public rooms
  const existingPublicRoomIds = await client.getPublicLobbies(token);

  // Create a HathoraConnection instance
  const connection = client.newConnection(newPublicRoomId);

  // Handle connection closing how you like
  connection.onClose((error) => {
    console.error("Connection closed", error);
  });

  // Initiate the connection
  connection.connect(token);

  // Return our connection to be used later...
  return connection;
}
```

3. Use the connection by running the code below:

```ts
async function example() {
  // Establish a Hathora connection (see above)
  const connection = await establishConnection();

  // Write JSON messages to the server
  connection.writeJson({
    type: "test-message",
    value: "Hello Hathora server!"
  });

  // Listen for JSON messages from the server
  connection.onMessageJson((json) => {
    // Handle the message in your app...
    console.log(json);
  });
}
```

### Next Steps

Try building your own application using the BuildKit and reach out to us in [Discord](https://discord.com/invite/hathora) if you need help!
