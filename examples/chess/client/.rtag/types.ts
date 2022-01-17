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

export type Square = string;
export type Board = Piece[];
export enum Color {
  WHITE,
  BLACK,
}
export enum PieceType {
  PAWN,
  KNIGHT,
  BISHOP,
  ROOK,
  QUEEN,
  KING,
}
export enum GameStatus {
  WAITING,
  WHITE_TURN,
  BLACK_TURN,
  WHITE_WON,
  BLACK_WON,
  DRAW,
}
export type Piece = {
  color: Color;
  type: PieceType;
  square: Square;
};
export type PlayerState = {
  board: Board;
  status: GameStatus;
  color: Color;
  opponent?: UserId;
};
export type UserId = string;
export type ICreateGameRequest = {
};
export type IStartGameRequest = {
};
export type IMovePieceRequest = {
  from: Square;
  to: Square;
};

export const Piece = {
  default(): Piece {
    return {
      color: 0,
      type: 0,
      square: "",
    };
  },
  encode(obj: Piece, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeUInt8(buf, obj.color);
    writeUInt8(buf, obj.type);
    writeString(buf, obj.square);
    return buf;
  },
  encodeDiff(obj: DeepPartial<Piece>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.color !== NO_DIFF);
    tracker.push(obj.type !== NO_DIFF);
    tracker.push(obj.square !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.color !== NO_DIFF) {
      writeUInt8(buf, obj.color);
    }
    if (obj.type !== NO_DIFF) {
      writeUInt8(buf, obj.type);
    }
    if (obj.square !== NO_DIFF) {
      writeString(buf, obj.square);
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): Piece {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      color: parseUInt8(sb),
      type: parseUInt8(sb),
      square: parseString(sb),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<Piece> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(3);
    return {
      color: tracker.shift() ? parseUInt8(sb) : NO_DIFF,
      type: tracker.shift() ? parseUInt8(sb) : NO_DIFF,
      square: tracker.shift() ? parseString(sb) : NO_DIFF,
    };
  },
};
export const PlayerState = {
  default(): PlayerState {
    return {
      board: [],
      status: 0,
      color: 0,
      opponent: undefined,
    };
  },
  encode(obj: PlayerState, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeArray(buf, obj.board, (x) => Piece.encode(x, buf));
    writeUInt8(buf, obj.status);
    writeUInt8(buf, obj.color);
    writeOptional(buf, obj.opponent, (x) => writeString(buf, x));
    return buf;
  },
  encodeDiff(obj: DeepPartial<PlayerState>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.board !== NO_DIFF);
    tracker.push(obj.status !== NO_DIFF);
    tracker.push(obj.color !== NO_DIFF);
    tracker.push(obj.opponent !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.board !== NO_DIFF) {
      writeArrayDiff(buf, obj.board, (x) => Piece.encodeDiff(x, buf));
    }
    if (obj.status !== NO_DIFF) {
      writeUInt8(buf, obj.status);
    }
    if (obj.color !== NO_DIFF) {
      writeUInt8(buf, obj.color);
    }
    if (obj.opponent !== NO_DIFF) {
      writeOptional(buf, obj.opponent, (x) => writeString(buf, x));
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): PlayerState {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      board: parseArray(sb, () => Piece.decode(sb)),
      status: parseUInt8(sb),
      color: parseUInt8(sb),
      opponent: parseOptional(sb, () => parseString(sb)),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<PlayerState> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(4);
    return {
      board: tracker.shift() ? parseArrayDiff(sb, () => Piece.decodeDiff(sb)) : NO_DIFF,
      status: tracker.shift() ? parseUInt8(sb) : NO_DIFF,
      color: tracker.shift() ? parseUInt8(sb) : NO_DIFF,
      opponent: tracker.shift() ? parseOptional(sb, () => parseString(sb)) : NO_DIFF,
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
export const IMovePieceRequest = {
  default(): IMovePieceRequest {
    return {
      from: "",
      to: "",
    };
  },
  encode(obj: IMovePieceRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.from);
    writeString(buf, obj.to);
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IMovePieceRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      from: parseString(sb),
      to: parseString(sb),
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
