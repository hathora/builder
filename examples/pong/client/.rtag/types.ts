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

export enum Direction {
  NONE,
  UP,
  DOWN,
}
export type Point = {
  x: number;
  y: number;
};
export type Player = {
  paddle: number;
  score: number;
};
export type PlayerState = {
  playerA: Player;
  playerB: Player;
  ball: Point;
};
export type UserId = string;
export type ICreateGameRequest = {
};
export type ISetDirectionRequest = {
  direction: Direction;
};

export const Point = {
  default(): Point {
    return {
      x: 0.0,
      y: 0.0,
    };
  },
  encode(obj: Point, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeFloat(buf, obj.x);
    writeFloat(buf, obj.y);
    return buf;
  },
  encodeDiff(obj: DeepPartial<Point>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.x !== NO_DIFF);
    tracker.push(obj.y !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.x !== NO_DIFF) {
      writeFloat(buf, obj.x);
    }
    if (obj.y !== NO_DIFF) {
      writeFloat(buf, obj.y);
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): Point {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      x: parseFloat(sb),
      y: parseFloat(sb),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<Point> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(2);
    return {
      x: tracker.shift() ? parseFloat(sb) : NO_DIFF,
      y: tracker.shift() ? parseFloat(sb) : NO_DIFF,
    };
  },
};
export const Player = {
  default(): Player {
    return {
      paddle: 0.0,
      score: 0,
    };
  },
  encode(obj: Player, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeFloat(buf, obj.paddle);
    writeInt(buf, obj.score);
    return buf;
  },
  encodeDiff(obj: DeepPartial<Player>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.paddle !== NO_DIFF);
    tracker.push(obj.score !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.paddle !== NO_DIFF) {
      writeFloat(buf, obj.paddle);
    }
    if (obj.score !== NO_DIFF) {
      writeInt(buf, obj.score);
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): Player {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      paddle: parseFloat(sb),
      score: parseInt(sb),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<Player> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(2);
    return {
      paddle: tracker.shift() ? parseFloat(sb) : NO_DIFF,
      score: tracker.shift() ? parseInt(sb) : NO_DIFF,
    };
  },
};
export const PlayerState = {
  default(): PlayerState {
    return {
      playerA: Player.default(),
      playerB: Player.default(),
      ball: Point.default(),
    };
  },
  encode(obj: PlayerState, writer?: Writer) {
    const buf = writer ?? new Writer();
    Player.encode(obj.playerA, buf);
    Player.encode(obj.playerB, buf);
    Point.encode(obj.ball, buf);
    return buf;
  },
  encodeDiff(obj: DeepPartial<PlayerState>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.playerA !== NO_DIFF);
    tracker.push(obj.playerB !== NO_DIFF);
    tracker.push(obj.ball !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.playerA !== NO_DIFF) {
      Player.encodeDiff(obj.playerA, buf);
    }
    if (obj.playerB !== NO_DIFF) {
      Player.encodeDiff(obj.playerB, buf);
    }
    if (obj.ball !== NO_DIFF) {
      Point.encodeDiff(obj.ball, buf);
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): PlayerState {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      playerA: Player.decode(sb),
      playerB: Player.decode(sb),
      ball: Point.decode(sb),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<PlayerState> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(3);
    return {
      playerA: tracker.shift() ? Player.decodeDiff(sb) : NO_DIFF,
      playerB: tracker.shift() ? Player.decodeDiff(sb) : NO_DIFF,
      ball: tracker.shift() ? Point.decodeDiff(sb) : NO_DIFF,
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
export const ISetDirectionRequest = {
  default(): ISetDirectionRequest {
    return {
      direction: 0,
    };
  },
  encode(obj: ISetDirectionRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeUInt8(buf, obj.direction);
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): ISetDirectionRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      direction: parseUInt8(sb),
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
