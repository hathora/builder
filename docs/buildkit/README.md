# Hathora BuildKit - Overview

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

2. Inside this typescript project, install the server SDKs: `npm i @hathora/server-sdk`. Also install the required dev dependencies: `npm i -D typescript ts-node @types/node`.
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
      console.log("newState", roomId.toString(36), userId);
    },
    subscribeUser(roomId, userId) {
      console.log("subscribeUser", roomId.toString(36), userId);
    },
    unsubscribeUser(roomId, userId) {
      console.log("unsubscribeUser", roomId.toString(36), userId);
    },
    onMessage(roomId, userId, data) {
      const dataBuf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
      console.log("onMessage", roomId.toString(36), userId, dataBuf.toString("utf8"));
      coordinator.sendMessage(roomId, userId, dataBuf);
    },
  },
});

console.log(`Connected to ${coordinator.host} with storeId ${coordinator.storeId}!`);
```

5. Run your server via `npx ts-node-esm server.mts`. You should see a message like this:
   > Connected to coordinator.hathora.dev with storeId 81e5804a-5ffe-496c-8a68-da071945b558

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

connection.write(encoder.encode("Hello world!"));

function onMessage(msg: ArrayBuffer) {
  console.log(decoder.decode(msg));
}

function onError(error: any) {
  console.error(error);
}
```

3. Run your client via `npx ts-node-esm client.mts`. You should see "Hello world!" echoed back like so:
  > Hello world!

On the server you should see output similar to the following:
> newState 305z91zyocpd4 k8vkwl7692  
subscribeUser 305z91zyocpd4 k8vkwl7692  
onMessage 305z91zyocpd4 k8vkwl7692 Hello world!

### Next Steps

Try building your own application using the BuildKit and reach out to us in [Discord](https://discord.com/invite/hathora) if you need help!
