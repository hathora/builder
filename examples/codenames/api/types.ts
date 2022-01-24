import { Writer, Reader } from "bin-serde";
import { Response } from "./base";

export const NO_DIFF = Symbol("NODIFF");
export type DeepPartial<T> = T extends string | number | boolean | undefined
  ? T
  : T extends Array<infer ArrayType>
  ? Array<DeepPartial<ArrayType> | typeof NO_DIFF> | typeof NO_DIFF
  : T extends { type: string; val: any }
  ? { type: T["type"]; val: DeepPartial<T["val"] | typeof NO_DIFF> }
  : { [K in keyof T]: DeepPartial<T[K]> | typeof NO_DIFF };

export type Cards = Card[];
export enum Color {
  RED,
  BLUE,
  BLACK,
  YELLOW,
}
export type PlayerInfo = {
  id: UserId;
  team: Color;
  isSpymaster: boolean;
};
export type Card = {
  word: string;
  color?: Color;
  selectedBy?: Color;
};
export enum GameStatus {
  NOT_STARTED,
  IN_PROGRESS,
  RED_WON,
  BLUE_WON,
}
export type TurnInfo = {
  hint: string;
  amount: number;
  guessed: number;
};
export type PlayerState = {
  players: PlayerInfo[];
  gameStatus: GameStatus;
  currentTurn: Color;
  turnInfo?: TurnInfo;
  redRemaining: number;
  blueRemaining: number;
  cards: Cards;
};
export type UserId = string;
export type ICreateGameRequest = {
};
export type IJoinGameRequest = {
};
export type IStartGameRequest = {
};
export type IGiveClueRequest = {
  hint: string;
  amount: number;
};
export type ISelectCardRequest = {
  word: string;
};
export type IEndTurnRequest = {
};

export const PlayerInfo = {
  default(): PlayerInfo {
    return {
      id: "",
      team: 0,
      isSpymaster: false,
    };
  },
  encode(obj: PlayerInfo, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.id);
    writeUInt8(buf, obj.team);
    writeBoolean(buf, obj.isSpymaster);
    return buf;
  },
  encodeDiff(obj: DeepPartial<PlayerInfo>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.id !== NO_DIFF);
    tracker.push(obj.team !== NO_DIFF);
    tracker.push(obj.isSpymaster !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.id !== NO_DIFF) {
      writeString(buf, obj.id);
    }
    if (obj.team !== NO_DIFF) {
      writeUInt8(buf, obj.team);
    }
    if (obj.isSpymaster !== NO_DIFF) {
      writeBoolean(buf, obj.isSpymaster);
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): PlayerInfo {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      id: parseString(sb),
      team: parseUInt8(sb),
      isSpymaster: parseBoolean(sb),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<PlayerInfo> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(3);
    return {
      id: tracker.shift() ? parseString(sb) : NO_DIFF,
      team: tracker.shift() ? parseUInt8(sb) : NO_DIFF,
      isSpymaster: tracker.shift() ? parseBoolean(sb) : NO_DIFF,
    };
  },
};
export const Card = {
  default(): Card {
    return {
      word: "",
      color: undefined,
      selectedBy: undefined,
    };
  },
  encode(obj: Card, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.word);
    writeOptional(buf, obj.color, (x) => writeUInt8(buf, x));
    writeOptional(buf, obj.selectedBy, (x) => writeUInt8(buf, x));
    return buf;
  },
  encodeDiff(obj: DeepPartial<Card>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.word !== NO_DIFF);
    tracker.push(obj.color !== NO_DIFF);
    tracker.push(obj.selectedBy !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.word !== NO_DIFF) {
      writeString(buf, obj.word);
    }
    if (obj.color !== NO_DIFF) {
      writeOptional(buf, obj.color, (x) => writeUInt8(buf, x));
    }
    if (obj.selectedBy !== NO_DIFF) {
      writeOptional(buf, obj.selectedBy, (x) => writeUInt8(buf, x));
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): Card {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      word: parseString(sb),
      color: parseOptional(sb, () => parseUInt8(sb)),
      selectedBy: parseOptional(sb, () => parseUInt8(sb)),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<Card> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(3);
    return {
      word: tracker.shift() ? parseString(sb) : NO_DIFF,
      color: tracker.shift() ? parseOptional(sb, () => parseUInt8(sb)) : NO_DIFF,
      selectedBy: tracker.shift() ? parseOptional(sb, () => parseUInt8(sb)) : NO_DIFF,
    };
  },
};
export const TurnInfo = {
  default(): TurnInfo {
    return {
      hint: "",
      amount: 0,
      guessed: 0,
    };
  },
  encode(obj: TurnInfo, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.hint);
    writeInt(buf, obj.amount);
    writeInt(buf, obj.guessed);
    return buf;
  },
  encodeDiff(obj: DeepPartial<TurnInfo>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.hint !== NO_DIFF);
    tracker.push(obj.amount !== NO_DIFF);
    tracker.push(obj.guessed !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.hint !== NO_DIFF) {
      writeString(buf, obj.hint);
    }
    if (obj.amount !== NO_DIFF) {
      writeInt(buf, obj.amount);
    }
    if (obj.guessed !== NO_DIFF) {
      writeInt(buf, obj.guessed);
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): TurnInfo {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      hint: parseString(sb),
      amount: parseInt(sb),
      guessed: parseInt(sb),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<TurnInfo> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(3);
    return {
      hint: tracker.shift() ? parseString(sb) : NO_DIFF,
      amount: tracker.shift() ? parseInt(sb) : NO_DIFF,
      guessed: tracker.shift() ? parseInt(sb) : NO_DIFF,
    };
  },
};
export const PlayerState = {
  default(): PlayerState {
    return {
      players: [],
      gameStatus: 0,
      currentTurn: 0,
      turnInfo: undefined,
      redRemaining: 0,
      blueRemaining: 0,
      cards: [],
    };
  },
  encode(obj: PlayerState, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeArray(buf, obj.players, (x) => PlayerInfo.encode(x, buf));
    writeUInt8(buf, obj.gameStatus);
    writeUInt8(buf, obj.currentTurn);
    writeOptional(buf, obj.turnInfo, (x) => TurnInfo.encode(x, buf));
    writeInt(buf, obj.redRemaining);
    writeInt(buf, obj.blueRemaining);
    writeArray(buf, obj.cards, (x) => Card.encode(x, buf));
    return buf;
  },
  encodeDiff(obj: DeepPartial<PlayerState>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.players !== NO_DIFF);
    tracker.push(obj.gameStatus !== NO_DIFF);
    tracker.push(obj.currentTurn !== NO_DIFF);
    tracker.push(obj.turnInfo !== NO_DIFF);
    tracker.push(obj.redRemaining !== NO_DIFF);
    tracker.push(obj.blueRemaining !== NO_DIFF);
    tracker.push(obj.cards !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.players !== NO_DIFF) {
      writeArrayDiff(buf, obj.players, (x) => PlayerInfo.encodeDiff(x, buf));
    }
    if (obj.gameStatus !== NO_DIFF) {
      writeUInt8(buf, obj.gameStatus);
    }
    if (obj.currentTurn !== NO_DIFF) {
      writeUInt8(buf, obj.currentTurn);
    }
    if (obj.turnInfo !== NO_DIFF) {
      writeOptional(buf, obj.turnInfo, (x) => TurnInfo.encodeDiff(x, buf));
    }
    if (obj.redRemaining !== NO_DIFF) {
      writeInt(buf, obj.redRemaining);
    }
    if (obj.blueRemaining !== NO_DIFF) {
      writeInt(buf, obj.blueRemaining);
    }
    if (obj.cards !== NO_DIFF) {
      writeArrayDiff(buf, obj.cards, (x) => Card.encodeDiff(x, buf));
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): PlayerState {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      players: parseArray(sb, () => PlayerInfo.decode(sb)),
      gameStatus: parseUInt8(sb),
      currentTurn: parseUInt8(sb),
      turnInfo: parseOptional(sb, () => TurnInfo.decode(sb)),
      redRemaining: parseInt(sb),
      blueRemaining: parseInt(sb),
      cards: parseArray(sb, () => Card.decode(sb)),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<PlayerState> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(7);
    return {
      players: tracker.shift() ? parseArrayDiff(sb, () => PlayerInfo.decodeDiff(sb)) : NO_DIFF,
      gameStatus: tracker.shift() ? parseUInt8(sb) : NO_DIFF,
      currentTurn: tracker.shift() ? parseUInt8(sb) : NO_DIFF,
      turnInfo: tracker.shift() ? parseOptional(sb, () => TurnInfo.decodeDiff(sb)) : NO_DIFF,
      redRemaining: tracker.shift() ? parseInt(sb) : NO_DIFF,
      blueRemaining: tracker.shift() ? parseInt(sb) : NO_DIFF,
      cards: tracker.shift() ? parseArrayDiff(sb, () => Card.decodeDiff(sb)) : NO_DIFF,
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
export const IGiveClueRequest = {
  default(): IGiveClueRequest {
    return {
      hint: "",
      amount: 0,
    };
  },
  encode(obj: IGiveClueRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.hint);
    writeInt(buf, obj.amount);
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IGiveClueRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      hint: parseString(sb),
      amount: parseInt(sb),
    };
  }
}
export const ISelectCardRequest = {
  default(): ISelectCardRequest {
    return {
      word: "",
    };
  },
  encode(obj: ISelectCardRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.word);
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): ISelectCardRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      word: parseString(sb),
    };
  }
}
export const IEndTurnRequest = {
  default(): IEndTurnRequest {
    return {
    };
  },
  encode(obj: IEndTurnRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IEndTurnRequest {
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
