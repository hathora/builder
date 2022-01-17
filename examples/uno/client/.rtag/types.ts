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

export enum Color {
  RED,
  BLUE,
  GREEN,
  YELLOW,
}
export type Card = {
  value: number;
  color: Color;
};
export type PlayerState = {
  hand: Card[];
  players: UserId[];
  turn: UserId;
  pile?: Card;
  winner?: UserId;
};
export type UserId = string;
export type ICreateGameRequest = {
};
export type IJoinGameRequest = {
};
export type IStartGameRequest = {
};
export type IPlayCardRequest = {
  card: Card;
};
export type IDrawCardRequest = {
};

export const Card = {
  default(): Card {
    return {
      value: 0,
      color: 0,
    };
  },
  encode(obj: Card, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeInt(buf, obj.value);
    writeUInt8(buf, obj.color);
    return buf;
  },
  encodeDiff(obj: DeepPartial<Card>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.value !== NO_DIFF);
    tracker.push(obj.color !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.value !== NO_DIFF) {
      writeInt(buf, obj.value);
    }
    if (obj.color !== NO_DIFF) {
      writeUInt8(buf, obj.color);
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): Card {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      value: parseInt(sb),
      color: parseUInt8(sb),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<Card> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(2);
    return {
      value: tracker.shift() ? parseInt(sb) : NO_DIFF,
      color: tracker.shift() ? parseUInt8(sb) : NO_DIFF,
    };
  },
};
export const PlayerState = {
  default(): PlayerState {
    return {
      hand: [],
      players: [],
      turn: "",
      pile: undefined,
      winner: undefined,
    };
  },
  encode(obj: PlayerState, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeArray(buf, obj.hand, (x) => Card.encode(x, buf));
    writeArray(buf, obj.players, (x) => writeString(buf, x));
    writeString(buf, obj.turn);
    writeOptional(buf, obj.pile, (x) => Card.encode(x, buf));
    writeOptional(buf, obj.winner, (x) => writeString(buf, x));
    return buf;
  },
  encodeDiff(obj: DeepPartial<PlayerState>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.hand !== NO_DIFF);
    tracker.push(obj.players !== NO_DIFF);
    tracker.push(obj.turn !== NO_DIFF);
    tracker.push(obj.pile !== NO_DIFF);
    tracker.push(obj.winner !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.hand !== NO_DIFF) {
      writeArrayDiff(buf, obj.hand, (x) => Card.encodeDiff(x, buf));
    }
    if (obj.players !== NO_DIFF) {
      writeArrayDiff(buf, obj.players, (x) => writeString(buf, x));
    }
    if (obj.turn !== NO_DIFF) {
      writeString(buf, obj.turn);
    }
    if (obj.pile !== NO_DIFF) {
      writeOptional(buf, obj.pile, (x) => Card.encodeDiff(x, buf));
    }
    if (obj.winner !== NO_DIFF) {
      writeOptional(buf, obj.winner, (x) => writeString(buf, x));
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): PlayerState {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      hand: parseArray(sb, () => Card.decode(sb)),
      players: parseArray(sb, () => parseString(sb)),
      turn: parseString(sb),
      pile: parseOptional(sb, () => Card.decode(sb)),
      winner: parseOptional(sb, () => parseString(sb)),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<PlayerState> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(5);
    return {
      hand: tracker.shift() ? parseArrayDiff(sb, () => Card.decodeDiff(sb)) : NO_DIFF,
      players: tracker.shift() ? parseArrayDiff(sb, () => parseString(sb)) : NO_DIFF,
      turn: tracker.shift() ? parseString(sb) : NO_DIFF,
      pile: tracker.shift() ? parseOptional(sb, () => Card.decodeDiff(sb)) : NO_DIFF,
      winner: tracker.shift() ? parseOptional(sb, () => parseString(sb)) : NO_DIFF,
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
export const IStartGameRequest = {
  default(): IStartGameRequest {
    return {
    };
  },
  encode(obj: IStartGameRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IStartGameRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
    };
  }
}
export const IPlayCardRequest = {
  default(): IPlayCardRequest {
    return {
      card: Card.default(),
    };
  },
  encode(obj: IPlayCardRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    Card.encode(obj.card, buf);
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IPlayCardRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      card: Card.decode(sb),
    };
  }
}
export const IDrawCardRequest = {
  default(): IDrawCardRequest {
    return {
    };
  },
  encode(obj: IDrawCardRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IDrawCardRequest {
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
