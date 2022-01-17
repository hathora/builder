import { randomBytes } from "crypto";
import { existsSync, mkdirSync } from "fs";
import seedrandom from "seedrandom";
import { SmartBuffer } from "smart-buffer";
import "dotenv/config";
import { register } from "./protocol";
import LogStore from "./logstore";
import { ImplWrapper as impl } from "./wrapper";
import { Response } from "./base";
import { UserId, encodeStateUpdate, NO_DIFF, PlayerState as UserState } from "./types";
import { computeDiff } from "./diff";
import { Writer } from "./serde";

type StateId = bigint;
type State = ReturnType<typeof impl.initialize>;
type StateInfo = { state: State; rng: ReturnType<seedrandom>; subscriptions: Set<UserId> };
type UserStateInfo = { state: UserState; changedAt: number };

const dataDir = process.env.DATA_DIR!;
if (!existsSync(dataDir)) {
  mkdirSync(dataDir);
}
const log = new LogStore(dataDir);
const stateInfo: Map<StateId, StateInfo> = new Map();
const changedStates: Map<StateId, number> = new Map();
const userResponses: Map<StateId, Map<UserId, Record<number, Response>>> = new Map();
const userStateInfo: Map<StateId, Map<UserId, UserStateInfo>> = new Map();

class Store {
  constructor() {
    setInterval(() => {
      changedStates.forEach((changedAt, stateId) => {
        sendUpdates(stateId, changedAt, userResponses.get(stateId) ?? new Map());
        userResponses.delete(stateId);
      });
      userResponses.forEach((responses, stateId) => sendResponses(stateId, responses));
      changedStates.clear();
      userResponses.clear();
    }, 50);

    let prevUpdateTime = Date.now();
    setInterval(() => {
      const currTime = Date.now();
      stateInfo.forEach(({ state, rng }, stateId) => {
        const timeDelta = currTime - prevUpdateTime;
        impl.onTick(state, ctx(rng, currTime), timeDelta / 1000);
        const changedAt = impl.changedAt();
        if (changedAt !== undefined) {
          changedStates.set(stateId, changedAt);
          log.append(stateId, currTime, new SmartBuffer().writeUInt8(0xff).writeUInt32LE(timeDelta).toBuffer());
        }
      });
      prevUpdateTime = currTime;
    }, 100);
  }
  async newState(stateId: StateId, userId: UserId, argsBuffer: Buffer) {
    const seed = randomBytes(8).readBigUInt64LE();
    const time = Date.now();
    const rng = seedrandom(seed.toString(36));
    const state = impl.initialize(userId, ctx(rng, time), argsBuffer);
    stateInfo.set(stateId, {
      state,
      rng,
      subscriptions: new Set([userId]),
    });
    userStateInfo.set(stateId, new Map());
    sendSnapshot(stateId, userId);
    log.append(
      stateId,
      time,
      new SmartBuffer()
        .writeBigUInt64LE(seed)
        .writeUInt32LE(userId.length)
        .writeString(userId)
        .writeUInt32LE(argsBuffer.length)
        .writeBuffer(argsBuffer)
        .toBuffer()
    );
  }
  async subscribeUser(stateId: StateId, userId: UserId) {
    if (!stateInfo.has(stateId)) {
      const loaded = loadState(stateId);
      if (loaded === undefined) {
        coordinator.onStateUpdate(stateId, userId, Buffer.alloc(0));
        return;
      }
      stateInfo.set(stateId, {
        state: loaded.state,
        rng: loaded.rng,
        subscriptions: new Set(),
      });
      userStateInfo.set(stateId, new Map());
    }
    stateInfo.get(stateId)!.subscriptions.add(userId);
    sendSnapshot(stateId, userId);
  }
  unsubscribeUser(stateId: StateId, userId: UserId) {
    if (!stateInfo.has(stateId)) {
      return;
    }
    const subscribers = stateInfo.get(stateId)!.subscriptions;
    if (subscribers.size > 1) {
      subscribers.delete(userId);
      userResponses.get(stateId)?.delete(userId);
      userStateInfo.get(stateId)?.delete(userId);
    } else {
      stateInfo.delete(stateId);
      changedStates.delete(stateId);
      userResponses.delete(stateId);
      userStateInfo.delete(stateId);
      log.unload(stateId);
    }
  }
  handleUpdate(stateId: StateId, userId: UserId, data: Buffer) {
    if (!stateInfo.has(stateId)) {
      return;
    }
    const { state, rng } = stateInfo.get(stateId)!;
    const reader = SmartBuffer.fromBuffer(data);
    const [method, msgId, argsBuffer] = [reader.readUInt8(), reader.readUInt32LE(), reader.readBuffer()];
    const time = Date.now();
    const response = impl.getResult(state, userId, method, ctx(rng, time), argsBuffer);
    if (response !== undefined) {
      const changedAt = impl.changedAt();
      if (changedAt !== undefined) {
        changedStates.set(stateId, changedAt);
        log.append(
          stateId,
          time,
          new SmartBuffer()
            .writeUInt8(method)
            .writeUInt32LE(userId.length)
            .writeString(userId)
            .writeUInt32LE(argsBuffer.length)
            .writeBuffer(argsBuffer)
            .toBuffer()
        );
      }
      if (!userResponses.has(stateId)) {
        userResponses.set(stateId, new Map([[userId, { [msgId]: response }]]));
      } else {
        if (!userResponses.get(stateId)!.has(userId)) {
          userResponses.get(stateId)!.set(userId, { [msgId]: response });
        } else {
          userResponses.get(stateId)!.get(userId)![msgId] = response;
        }
      }
    }
  }
}

const coordinator = await register(new Store());

function loadState(stateId: StateId) {
  try {
    const rows = log.load(stateId);

    const { time, record } = rows[0];
    const reader = SmartBuffer.fromBuffer(record);
    const seed = reader.readBigUInt64LE();
    const userId = reader.readString(reader.readUInt32LE());
    const argsBuffer = reader.readBuffer(reader.readUInt32LE());
    const rng = seedrandom(seed.toString(36));
    const state = impl.initialize(userId, ctx(rng, time), argsBuffer);

    for (let i = 1; i < rows.length; i++) {
      const { time, record } = rows[i];
      const reader = SmartBuffer.fromBuffer(record);
      const method = reader.readUInt8();
      if (method === 0xff) {
        const timeDelta = reader.readUInt32LE();
        impl.onTick(state, ctx(rng, time), timeDelta / 1000);
        continue;
      }
      const userId = reader.readString(reader.readUInt32LE());
      const argsBuffer = reader.readBuffer(reader.readUInt32LE());
      impl.getResult(state, userId, method, ctx(rng, time), argsBuffer);
    }

    return { state, rng };
  } catch (e) {
    console.error("Unable to load state", stateId.toString(36), e);
  }
}

function sendSnapshot(stateId: StateId, userId: UserId) {
  const { state } = stateInfo.get(stateId)!;
  const userState = impl.getUserState(state, userId);
  userStateInfo.get(stateId)!.set(userId, { state: JSON.parse(JSON.stringify(userState)), changedAt: 0 });
  const buf = Buffer.from(UserState.encode(userState).toBuffer());
  coordinator.onStateUpdate(stateId, userId, buf);
}

function sendUpdates(stateId: StateId, changedAt: number, responses: Map<UserId, Record<number, Response>>) {
  if (stateInfo.has(stateId)) {
    const { state, subscriptions } = stateInfo.get(stateId)!;
    for (const userId of subscriptions) {
      const { state: prevState, changedAt: prevChangedAt } = userStateInfo.get(stateId)!.get(userId)!;
      const currState = impl.getUserState(state, userId);
      const diff = computeDiff(currState, prevState);
      const buf = Buffer.from(
        encodeStateUpdate(diff !== NO_DIFF ? diff : undefined, changedAt - prevChangedAt, responses.get(userId) ?? {})
      );
      coordinator.onStateUpdate(stateId, userId, buf);
      userStateInfo.get(stateId)!.set(userId, { state: JSON.parse(JSON.stringify(currState)), changedAt });
    }
  }
}

function sendResponses(stateId: StateId, responses: Map<UserId, Record<number, Response>>) {
  responses.forEach((response, userId) => {
    const buf = Buffer.from(encodeStateUpdate(undefined, 0, response));
    coordinator.onStateUpdate(stateId, userId, buf);
  });
}

function ctx(rng: ReturnType<seedrandom>, time: number) {
  return {
    rand: () => rng(),
    randInt: (limit?: number) => (limit === undefined ? rng.int32() : Math.floor(rng() * limit)),
    time: () => time,
  };
}
