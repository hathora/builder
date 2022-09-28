# Hathora BuildKit - Overview

Hathora BuildKit makes it easy to write applications that conform to the Hathora Protocol, and therefore can be deployed on [Hathora Cloud](../cloud/README.md).

## Benefits

- Simple SDKs provide powerful and scalable messaging infrastructure
- Easy deployment onto Hathora Cloud, which provides global compute scheduling and an optimized edge network
- Flexible with regards to language, persistence, serialization techniques, etc (currently only Typescript is supported, but more languages coming soon)

## Getting Started

> Please see the [Reference](./reference.md) for details and checkout our [tutorial](./tutorial_top_down_shooter.md) for a full walkthrough.

#### Server

1. In your Typescript project, install the server SDKs: `npm i @hathora/server-sdk`
2. Grab an `APP_ID`/`APP_SECRET` by running `curl -X POST https://coordinator.hathora.dev/registerApp`.
3. Fill in the `APP_ID`/`APP_SECRET` pair and implement four methods:

```ts
import { register } from "@hathora/server-sdk";

const coordinator = await register({
  appId: process.env.APP_ID!,
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
      coordinator.sendMessage(roomId, userId, dataBuf);
    },
  },
});

console.log(`Connected to ${coordinator.host} with AppId ${coordinator.appId}!`);
```

4. Run your server! You should see a message like this:
   > Connected to coordinator.hathora.dev with AppId b5d4045c3f466fa91fe2cc6abe79232a1a57cdf104f7a26e716e0a1e2789df78!

#### Client

Once your server is connected to the Coordinator, you can start passing messages back and forth. Let's build a client to do that.

1. In your Typescript project, install the client SDKs: `npm i @hathora/client-sdk`
2. Fill in the `APP_ID` from above and implement `onMessage` and `onError` methods:

```ts
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

3. Run your client! You should see "Hello world!" echoed back like so:
   > { message: 'Hello world' }

### Next Steps

Try building your own application using the BuildKit and reach out to us in Discord if you need help!
