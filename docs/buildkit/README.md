<div class="hathora-logo-with-super">
  <img src="statics/logo.svg" alt="drawing" width="200"/>
  <span class="hathora-logo-super">BuildKit</span>
</div>

<a href="https://github.com/hathora/buildkits" target="_blank" class="hathora-gh-link">
  <img src="statics/GitHub-Mark-Light-32px.png" alt="GitHub logo" height="14" width="14"/>
  <span>Hathora BuildKit</span>
  <span class="hathora-link-icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
      </svg>
  </span>
</a>

Hathora BuildKit makes it easy to write applications that conform to the Hathora Protocol, and therefore can be deployed on [Hathora Cloud](../cloud/README.md).

## Benefits

- Simple SDKs provide powerful and scalable messaging infrastructure
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

2. Inside this typescript project, install the server SDKs: `npm i @hathora/server-sdk`
3. Grab an `appId` + `appSecret` pair by running `curl -X POST https://coordinator.hathora.dev/registerApp`.
4. Set the `APP_SECRET` environment variable and create the following `server.mts` file:

```ts
// server.mts

import { register } from "@hathora/server-sdk";

const coordinator = await register({
  appSecret: process.env.APP_SECRET!,
  authInfo: { anonymous: { separator: "-" } },
  store: {
    newState(roomId, userId, data) {
      // TODO
    },
    subscribeUser(roomId, userId) {
      // TODO
    },
    unsubscribeUser(roomId, userId) {
      // TODO
    },
    onMessage(roomId, userId, data) {
      // TODO - example echo
      const dataBuf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
      console.log("Received data:", dataBuf.toString("utf8"));
      coordinator.sendMessage(roomId, userId, dataBuf);
    },
  },
});

console.log(`Connected to ${coordinator.host} with storeId ${coordinator.storeId}!`);
```

5. Run your server via `ts-node-esm server.mts` (make sure you have [ts-node](https://www.npmjs.com/package/ts-node) installed globally). You should see a message like this:
   > Connected to coordinator.hathora.dev with storeId 81e5804a-5ffe-496c-8a68-da071945b558!

#### Client

Once your server is connected to the Coordinator, you can start passing messages back and forth. Let's build a client to do that.

1. In your typescript project, install the client SDKs: `npm i @hathora/client-sdk`
2. Fill in the `APP_ID` from above and implement `onMessage` and `onError` methods:

```ts
// client.mts

import { HathoraClient } from "@hathora/client-sdk";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const client = new HathoraClient(APP_ID);
const token = await client.loginAnonymous();
const roomId = await client.create(token, new Uint8Array());
const connection = await client.connect(token, roomId, onMessage, onError);

connection.write(encoder.encode(JSON.stringify({ message: "Hello world!" })));

function onMessage(msg: ArrayBuffer) {
  console.log(JSON.parse(decoder.decode(msg)));
}

function onError(error: any) {
  console.error(error);
}
```

3. Run your client via `ts-node-esm client.mts`. You should see "Hello world!" echoed back like so:
   > { message: 'Hello world' }

### Next Steps

Try building your own application using the BuildKit and reach out to us in [Discord](https://discord.com/invite/hathora) if you need help!
