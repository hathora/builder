import { Response } from "./base";
import { Writer, Reader } from "./serde";

export const NO_DIFF = Symbol("NODIFF");
export type DeepPartial<T> = T extends string | number | boolean | undefined
  ? T
  : T extends Array<infer ArrayType>
  ? Array<DeepPartial<ArrayType> | typeof NO_DIFF> | typeof NO_DIFF
  : T extends { type: string; val: any }
  ? { type: T["type"]; val: DeepPartial<T["val"] | typeof NO_DIFF> }
  : { [K in keyof T]: DeepPartial<T[K]> | typeof NO_DIFF };

export enum Gesture {
  ROCK,
  PAPER,
  SCISSOR,
}
export type PlayerInfo = {
  id: UserId;
  score: number;
  gesture?: Gesture;
};
export type PlayerState = {
  round: number;
  player1: PlayerInfo;
  player2?: PlayerInfo;
};
export type UserId = string;
export type ICreateGameRequest = {
};
export type IJoinGameRequest = {
};
export type IChooseGestureRequest = {
  gesture: Gesture;
};
export type INextRoundRequest = {
};

export const PlayerInfo = {
  default(): PlayerInfo {
    return {
      id: "",
      score: 0,
      gesture: undefined,
    };
  },
  encode(obj: PlayerInfo, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.id);
    writeInt(buf, obj.score);
    writeOptional(buf, obj.gesture, (x) => writeUInt8(buf, x));
    return buf;
  },
  encodeDiff(obj: DeepPartial<PlayerInfo>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.id !== NO_DIFF);
    tracker.push(obj.score !== NO_DIFF);
    tracker.push(obj.gesture !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.id !== NO_DIFF) {
      writeString(buf, obj.id);
    }
    if (obj.score !== NO_DIFF) {
      writeInt(buf, obj.score);
    }
    if (obj.gesture !== NO_DIFF) {
      writeOptional(buf, obj.gesture, (x) => writeUInt8(buf, x));
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): PlayerInfo {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      id: parseString(sb),
      score: parseInt(sb),
      gesture: parseOptional(sb, () => parseUInt8(sb)),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<PlayerInfo> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(3);
    return {
      id: tracker.shift() ? parseString(sb) : NO_DIFF,
      score: tracker.shift() ? parseInt(sb) : NO_DIFF,
      gesture: tracker.shift() ? parseOptional(sb, () => parseUInt8(sb)) : NO_DIFF,
    };
  },
};
export const PlayerState = {
  default(): PlayerState {
    return {
      round: 0,
      player1: PlayerInfo.default(),
      player2: undefined,
    };
  },
  encode(obj: PlayerState, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeInt(buf, obj.round);
    PlayerInfo.encode(obj.player1, buf);
    writeOptional(buf, obj.player2, (x) => PlayerInfo.encode(x, buf));
    return buf;
  },
  encodeDiff(obj: DeepPartial<PlayerState>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.round !== NO_DIFF);
    tracker.push(obj.player1 !== NO_DIFF);
    tracker.push(obj.player2 !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.round !== NO_DIFF) {
      writeInt(buf, obj.round);
    }
    if (obj.player1 !== NO_DIFF) {
      PlayerInfo.encodeDiff(obj.player1, buf);
    }
    if (obj.player2 !== NO_DIFF) {
      writeOptional(buf, obj.player2, (x) => PlayerInfo.encodeDiff(x, buf));
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): PlayerState {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      round: parseInt(sb),
      player1: PlayerInfo.decode(sb),
      player2: parseOptional(sb, () => PlayerInfo.decode(sb)),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<PlayerState> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(3);
    return {
      round: tracker.shift() ? parseInt(sb) : NO_DIFF,
      player1: tracker.shift() ? PlayerInfo.decodeDiff(sb) : NO_DIFF,
      player2: tracker.shift() ? parseOptional(sb, () => PlayerInfo.decodeDiff(sb)) : NO_DIFF,
    };
  },
};
export const ICreateGameRequest = {
  default(): ICreateGameRequest {
    return {
    };
  },
  encode(obj: ICreateGameRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): ICreateGameRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
    };
  }
}
export const IJoinGameRequest = {
  default(): IJoinGameRequest {
    return {
    };
  },
  encode(obj: IJoinGameRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IJoinGameRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
    };
  }
}
export const IChooseGestureRequest = {
  default(): IChooseGestureRequest {
    return {
      gesture: 0,
    };
  },
  encode(obj: IChooseGestureRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeUInt8(buf, obj.gesture);
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IChooseGestureRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      gesture: parseUInt8(sb),
    };
  }
}
export const INextRoundRequest = {
  default(): INextRoundRequest {
    return {
    };
  },
  encode(obj: INextRoundRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): INextRoundRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
    };
  }
}

export function encodeStateUpdate(
  stateDiff: DeepPartial<PlayerState> | undefined,
  changedAtDiff: number,
  responses: Record<number, Response>
) {
  const buf = new Writer();
  buf.writeUVarint(changedAtDiff);
  writeOptional(buf, stateDiff, (x) => PlayerState.encodeDiff(x, buf));
  Object.entries(responses).forEach(([msgId, response]) => {
    buf.writeUInt32(Number(msgId));
    const maybeError = response.type === "error" ? response.error : undefined;
    writeOptional(buf, maybeError, (x) => writeString(buf, x));
  });
  return buf.toBuffer();
}
export function decodeStateUpdate(buf: ArrayBufferView | Reader): {
  stateDiff?: DeepPartial<PlayerState>;
  changedAtDiff: number;
  responses: Record<number, Response>;
} {
  const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
  const changedAtDiff = sb.readUVarint();
  const stateDiff = parseOptional(sb, () => PlayerState.decodeDiff(sb));
  const responses: Record<number, Response> = {};
  while (sb.remaining() > 0) {
    const msgId = sb.readUInt32();
    const maybeError = parseOptional(sb, () => parseString(sb));
    responses[msgId] = maybeError === undefined ? Response.ok() : Response.error(maybeError);
  }
  return { stateDiff, changedAtDiff, responses };
}

function writeUInt8(buf: Writer, x: number) {
  buf.writeUInt8(x);
}
function writeBoolean(buf: Writer, x: boolean) {
  buf.writeUInt8(x ? 1 : 0);
}
function writeInt(buf: Writer, x: number) {
  buf.writeVarint(x);
}
function writeFloat(buf: Writer, x: number) {
  buf.writeFloat(x);
}
function writeString(buf: Writer, x: string) {
  buf.writeString(x);
}
function writeOptional<T>(buf: Writer, x: T | undefined, innerWrite: (x: T) => void) {
  writeBoolean(buf, x !== undefined);
  if (x !== undefined) {
    innerWrite(x);
  }
}
function writeArray<T>(buf: Writer, x: T[], innerWrite: (x: T) => void) {
  buf.writeUVarint(x.length);
  for (let i = 0; i < x.length; i++) {
    innerWrite(x[i]);
  }
}
function writeArrayDiff<T>(buf: Writer, x: (T | typeof NO_DIFF)[], innerWrite: (x: T) => void) {
  buf.writeUVarint(x.length);
  const tracker: boolean[] = [];
  x.forEach((val) => {
    tracker.push(val !== NO_DIFF);
  });
  buf.writeBits(tracker);
  x.forEach((val) => {
    if (val !== NO_DIFF) {
      innerWrite(val);
    }
  });
}

function parseUInt8(buf: Reader): number {
  return buf.readUInt8();
}
function parseBoolean(buf: Reader): boolean {
  return buf.readUInt8() > 0;
}
function parseInt(buf: Reader): number {
  return buf.readVarint();
}
function parseFloat(buf: Reader): number {
  return buf.readFloat();
}
function parseString(buf: Reader): string {
  return buf.readString();
}
function parseOptional<T>(buf: Reader, innerParse: (buf: Reader) => T): T | undefined {
  return parseBoolean(buf) ? innerParse(buf) : undefined;
}
function parseArray<T>(buf: Reader, innerParse: () => T): T[] {
  const len = buf.readUVarint();
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(innerParse());
  }
  return arr;
}
function parseArrayDiff<T>(buf: Reader, innerParse: () => T): (T | typeof NO_DIFF)[] {
  const len = buf.readUVarint();
  const tracker = buf.readBits(len);
  const arr = [];
  for (let i = 0; i < len; i++) {
    if (tracker.shift()) {
      arr.push(innerParse());
    } else {
      arr.push(NO_DIFF);
    }
  }
  return arr;
}
