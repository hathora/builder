# Hathora Typescript Server SDK

## Usage

```ts
register(config: RegisterConfig): Promise<CoordinatorClient>;
```

Registers backend with the Hathora Coordinator.

## Register Config

```ts
export type RegisterConfig = {
  coordinatorHost?: string;
  appSecret: string;
  storeId?: string;
  authInfo: AuthInfo;
  store: Store;
};
```

### coordinatorHost

The url of the coordinator instance to connect to

Defaults to coordinator.hathora.dev

### appSecret

A secret string value to securely identify the backend

### storeId

A string to identify the backend instance

Defaults to a random uuid

### authInfo

Configures the authentication providers for the application

```ts
type AuthInfo = {
  anonymous?: { separator: string };
  nickname?: {};
  google?: { clientId: string };
  email?: { secretApiKey: string };
};
```

### store

A class or object conforming to the `Store` interface

```ts
interface Store {
  newState(roomId: StateId, userId: UserId, data: ArrayBufferView): void;
  subscribeUser(roomId: StateId, userId: UserId): void;
  unsubscribeUser(roomId: StateId, userId: UserId): void;
  unsubscribeAll(): void;
  onMessage(roomId: StateId, userId: UserId, data: ArrayBufferView): void;
}
```

### CoordinatorClient

```ts
interface CoordinatorClient {
  stateUpdate(roomId: StateId, userId: UserId, data: Buffer);
  stateNotFound(roomId: StateId, userId: UserId);
  ping();
}
```

## Example

```ts
const coordinator = await register({
  appSecret: process.env.APP_SECRET!,
  authInfo: { anonymous: { separator: "-" } },
  store: {
    newState(roomId, userId, data) {
      console.log("newState", roomId.toString(36), userId, data);
    },
    subscribeUser(roomId, userId) {
      console.log("subscribeUser", roomId.toString(36), userId);
    },
    unsubscribeUser(roomId, userId) {
      console.log("unsubscribeUser", roomId.toString(36), userId);
    },
    unsubscribeAll() {
      console.log("unsubscribeAll");
    },
    onMessage(roomId, userId, data) {
      const dataBuf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
      console.log("handleUpdate", roomId.toString(36), userId, dataBuf.toString("utf8"));
      // echo data back to client
      coordinator.stateUpdate(roomId, userId, dataBuf);
    },
  },
});
```
