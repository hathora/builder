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

export enum PlayerStatus {
  WAITING,
  FOLDED,
  PLAYED,
}
export type Card = {
  rank: string;
  suit: string;
};
export type PlayerInfo = {
  id: UserId;
  chipCount: number;
  chipsInPot: number;
  cards: Card[];
  status: PlayerStatus;
};
export type PlayerState = {
  players: PlayerInfo[];
  dealer: UserId;
  activePlayer: UserId;
  revealedCards: Card[];
};
export type UserId = string;
export type ICreateGameRequest = {
  startingChips: number;
  startingBlind: number;
};
export type IJoinGameRequest = {
};
export type IStartRoundRequest = {
};
export type IFoldRequest = {
};
export type ICallRequest = {
};
export type IRaiseRequest = {
  amount: number;
};

export const Card = {
  default(): Card {
    return {
      rank: "",
      suit: "",
    };
  },
  encode(obj: Card, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.rank);
    writeString(buf, obj.suit);
    return buf;
  },
  encodeDiff(obj: DeepPartial<Card>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.rank !== NO_DIFF);
    tracker.push(obj.suit !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.rank !== NO_DIFF) {
      writeString(buf, obj.rank);
    }
    if (obj.suit !== NO_DIFF) {
      writeString(buf, obj.suit);
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): Card {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      rank: parseString(sb),
      suit: parseString(sb),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<Card> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(2);
    return {
      rank: tracker.shift() ? parseString(sb) : NO_DIFF,
      suit: tracker.shift() ? parseString(sb) : NO_DIFF,
    };
  },
};
export const PlayerInfo = {
  default(): PlayerInfo {
    return {
      id: "",
      chipCount: 0,
      chipsInPot: 0,
      cards: [],
      status: 0,
    };
  },
  encode(obj: PlayerInfo, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.id);
    writeInt(buf, obj.chipCount);
    writeInt(buf, obj.chipsInPot);
    writeArray(buf, obj.cards, (x) => Card.encode(x, buf));
    writeUInt8(buf, obj.status);
    return buf;
  },
  encodeDiff(obj: DeepPartial<PlayerInfo>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.id !== NO_DIFF);
    tracker.push(obj.chipCount !== NO_DIFF);
    tracker.push(obj.chipsInPot !== NO_DIFF);
    tracker.push(obj.cards !== NO_DIFF);
    tracker.push(obj.status !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.id !== NO_DIFF) {
      writeString(buf, obj.id);
    }
    if (obj.chipCount !== NO_DIFF) {
      writeInt(buf, obj.chipCount);
    }
    if (obj.chipsInPot !== NO_DIFF) {
      writeInt(buf, obj.chipsInPot);
    }
    if (obj.cards !== NO_DIFF) {
      writeArrayDiff(buf, obj.cards, (x) => Card.encodeDiff(x, buf));
    }
    if (obj.status !== NO_DIFF) {
      writeUInt8(buf, obj.status);
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): PlayerInfo {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      id: parseString(sb),
      chipCount: parseInt(sb),
      chipsInPot: parseInt(sb),
      cards: parseArray(sb, () => Card.decode(sb)),
      status: parseUInt8(sb),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<PlayerInfo> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(5);
    return {
      id: tracker.shift() ? parseString(sb) : NO_DIFF,
      chipCount: tracker.shift() ? parseInt(sb) : NO_DIFF,
      chipsInPot: tracker.shift() ? parseInt(sb) : NO_DIFF,
      cards: tracker.shift() ? parseArrayDiff(sb, () => Card.decodeDiff(sb)) : NO_DIFF,
      status: tracker.shift() ? parseUInt8(sb) : NO_DIFF,
    };
  },
};
export const PlayerState = {
  default(): PlayerState {
    return {
      players: [],
      dealer: "",
      activePlayer: "",
      revealedCards: [],
    };
  },
  encode(obj: PlayerState, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeArray(buf, obj.players, (x) => PlayerInfo.encode(x, buf));
    writeString(buf, obj.dealer);
    writeString(buf, obj.activePlayer);
    writeArray(buf, obj.revealedCards, (x) => Card.encode(x, buf));
    return buf;
  },
  encodeDiff(obj: DeepPartial<PlayerState>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.players !== NO_DIFF);
    tracker.push(obj.dealer !== NO_DIFF);
    tracker.push(obj.activePlayer !== NO_DIFF);
    tracker.push(obj.revealedCards !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.players !== NO_DIFF) {
      writeArrayDiff(buf, obj.players, (x) => PlayerInfo.encodeDiff(x, buf));
    }
    if (obj.dealer !== NO_DIFF) {
      writeString(buf, obj.dealer);
    }
    if (obj.activePlayer !== NO_DIFF) {
      writeString(buf, obj.activePlayer);
    }
    if (obj.revealedCards !== NO_DIFF) {
      writeArrayDiff(buf, obj.revealedCards, (x) => Card.encodeDiff(x, buf));
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): PlayerState {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      players: parseArray(sb, () => PlayerInfo.decode(sb)),
      dealer: parseString(sb),
      activePlayer: parseString(sb),
      revealedCards: parseArray(sb, () => Card.decode(sb)),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<PlayerState> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(4);
    return {
      players: tracker.shift() ? parseArrayDiff(sb, () => PlayerInfo.decodeDiff(sb)) : NO_DIFF,
      dealer: tracker.shift() ? parseString(sb) : NO_DIFF,
      activePlayer: tracker.shift() ? parseString(sb) : NO_DIFF,
      revealedCards: tracker.shift() ? parseArrayDiff(sb, () => Card.decodeDiff(sb)) : NO_DIFF,
    };
  },
};
export const ICreateGameRequest = {
  default(): ICreateGameRequest {
    return {
      startingChips: 0,
      startingBlind: 0,
    };
  },
  encode(obj: ICreateGameRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeInt(buf, obj.startingChips);
    writeInt(buf, obj.startingBlind);
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): ICreateGameRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      startingChips: parseInt(sb),
      startingBlind: parseInt(sb),
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
export const IStartRoundRequest = {
  default(): IStartRoundRequest {
    return {
    };
  },
  encode(obj: IStartRoundRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IStartRoundRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
    };
  }
}
export const IFoldRequest = {
  default(): IFoldRequest {
    return {
    };
  },
  encode(obj: IFoldRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IFoldRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
    };
  }
}
export const ICallRequest = {
  default(): ICallRequest {
    return {
    };
  },
  encode(obj: ICallRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): ICallRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
    };
  }
}
export const IRaiseRequest = {
  default(): IRaiseRequest {
    return {
      amount: 0,
    };
  },
  encode(obj: IRaiseRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeInt(buf, obj.amount);
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IRaiseRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      amount: parseInt(sb),
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
