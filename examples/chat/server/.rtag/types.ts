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

export type Message = {
  text: string;
  sentAt: number;
  sentBy: UserId;
  sentTo?: UserId;
};
export type RoomState = {
  name: string;
  createdBy: UserId;
  messages: Message[];
};
export type UserId = string;
export type ICreateRoomRequest = {
  name: string;
};
export type ISendPublicMessageRequest = {
  text: string;
};
export type ISendPrivateMessageRequest = {
  text: string;
  to: UserId;
};

export const Message = {
  default(): Message {
    return {
      text: "",
      sentAt: 0,
      sentBy: "",
      sentTo: undefined,
    };
  },
  encode(obj: Message, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.text);
    writeInt(buf, obj.sentAt);
    writeString(buf, obj.sentBy);
    writeOptional(buf, obj.sentTo, (x) => writeString(buf, x));
    return buf;
  },
  encodeDiff(obj: DeepPartial<Message>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.text !== NO_DIFF);
    tracker.push(obj.sentAt !== NO_DIFF);
    tracker.push(obj.sentBy !== NO_DIFF);
    tracker.push(obj.sentTo !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.text !== NO_DIFF) {
      writeString(buf, obj.text);
    }
    if (obj.sentAt !== NO_DIFF) {
      writeInt(buf, obj.sentAt);
    }
    if (obj.sentBy !== NO_DIFF) {
      writeString(buf, obj.sentBy);
    }
    if (obj.sentTo !== NO_DIFF) {
      writeOptional(buf, obj.sentTo, (x) => writeString(buf, x));
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): Message {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      text: parseString(sb),
      sentAt: parseInt(sb),
      sentBy: parseString(sb),
      sentTo: parseOptional(sb, () => parseString(sb)),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<Message> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(4);
    return {
      text: tracker.shift() ? parseString(sb) : NO_DIFF,
      sentAt: tracker.shift() ? parseInt(sb) : NO_DIFF,
      sentBy: tracker.shift() ? parseString(sb) : NO_DIFF,
      sentTo: tracker.shift() ? parseOptional(sb, () => parseString(sb)) : NO_DIFF,
    };
  },
};
export const RoomState = {
  default(): RoomState {
    return {
      name: "",
      createdBy: "",
      messages: [],
    };
  },
  encode(obj: RoomState, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.name);
    writeString(buf, obj.createdBy);
    writeArray(buf, obj.messages, (x) => Message.encode(x, buf));
    return buf;
  },
  encodeDiff(obj: DeepPartial<RoomState>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.name !== NO_DIFF);
    tracker.push(obj.createdBy !== NO_DIFF);
    tracker.push(obj.messages !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.name !== NO_DIFF) {
      writeString(buf, obj.name);
    }
    if (obj.createdBy !== NO_DIFF) {
      writeString(buf, obj.createdBy);
    }
    if (obj.messages !== NO_DIFF) {
      writeArrayDiff(buf, obj.messages, (x) => Message.encodeDiff(x, buf));
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): RoomState {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      name: parseString(sb),
      createdBy: parseString(sb),
      messages: parseArray(sb, () => Message.decode(sb)),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<RoomState> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(3);
    return {
      name: tracker.shift() ? parseString(sb) : NO_DIFF,
      createdBy: tracker.shift() ? parseString(sb) : NO_DIFF,
      messages: tracker.shift() ? parseArrayDiff(sb, () => Message.decodeDiff(sb)) : NO_DIFF,
    };
  },
};
export const ICreateRoomRequest = {
  default(): ICreateRoomRequest {
    return {
      name: "",
    };
  },
  encode(obj: ICreateRoomRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.name);
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): ICreateRoomRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      name: parseString(sb),
    };
  }
}
export const ISendPublicMessageRequest = {
  default(): ISendPublicMessageRequest {
    return {
      text: "",
    };
  },
  encode(obj: ISendPublicMessageRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.text);
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): ISendPublicMessageRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      text: parseString(sb),
    };
  }
}
export const ISendPrivateMessageRequest = {
  default(): ISendPrivateMessageRequest {
    return {
      text: "",
      to: "",
    };
  },
  encode(obj: ISendPrivateMessageRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.text);
    writeString(buf, obj.to);
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): ISendPrivateMessageRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      text: parseString(sb),
      to: parseString(sb),
    };
  }
}

export function encodeStateUpdate(
  stateDiff: DeepPartial<RoomState> | undefined,
  changedAtDiff: number,
  responses: Record<number, Response>
) {
  const buf = new Writer();
  buf.writeUVarint(changedAtDiff);
  writeOptional(buf, stateDiff, (x) => RoomState.encodeDiff(x, buf));
  Object.entries(responses).forEach(([msgId, response]) => {
    buf.writeUInt32(Number(msgId));
    const maybeError = response.type === "error" ? response.error : undefined;
    writeOptional(buf, maybeError, (x) => writeString(buf, x));
  });
  return buf.toBuffer();
}
export function decodeStateUpdate(buf: ArrayBufferView | Reader): {
  stateDiff?: DeepPartial<RoomState>;
  changedAtDiff: number;
  responses: Record<number, Response>;
} {
  const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
  const changedAtDiff = sb.readUVarint();
  const stateDiff = parseOptional(sb, () => RoomState.decodeDiff(sb));
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
