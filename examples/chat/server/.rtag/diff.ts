import {
  NO_DIFF,
  DeepPartial,
  Message,
  RoomState,
  UserId,
} from "./types";

function diffMessage(obj: Message, prevObj: Message): DeepPartial<Message> | typeof NO_DIFF {
  return diffObj({
    text: diffPrimitive(obj.text, prevObj.text),
    sentAt: diffPrimitive(obj.sentAt, prevObj.sentAt),
    sentBy: diffPrimitive(obj.sentBy, prevObj.sentBy),
    sentTo: diffOptional(obj.sentTo, prevObj.sentTo, (a, b) => diffPrimitive(a, b)),
  });
}

function diffRoomState(obj: RoomState, prevObj: RoomState): DeepPartial<RoomState> | typeof NO_DIFF {
  return diffObj({
    name: diffPrimitive(obj.name, prevObj.name),
    createdBy: diffPrimitive(obj.createdBy, prevObj.createdBy),
    messages: diffArray(obj.messages, prevObj.messages, (a, b) => diffMessage(a, b)),
  });
}

export function computeDiff(state: RoomState, prevState: RoomState): DeepPartial<RoomState> | typeof NO_DIFF {
  return diffRoomState(state, prevState);
}

function diffPrimitive<T>(a: T, b: T) {
  return a === b ? NO_DIFF : a;
}

function diffOptional<T>(
  a: T | undefined,
  b: T | undefined,
  innerDiff: (x: T, y: T) => DeepPartial<T> | typeof NO_DIFF
) {
  if (a !== undefined && b !== undefined) {
    return innerDiff(a, b);
  } else if (a !== undefined || b !== undefined) {
    return a;
  }
  return NO_DIFF;
}

function diffArray<T>(a: T[], b: T[], innerDiff: (x: T, y: T) => DeepPartial<T> | typeof NO_DIFF) {
  const arr = a.map((val, i) => (i < b.length ? innerDiff(val, b[i]) : val));
  return a.length === b.length && arr.every((v) => v === NO_DIFF) ? NO_DIFF : arr;
}

function diffObj<T>(obj: T) {
  return Object.values(obj).every((v) => v === NO_DIFF) ? NO_DIFF : obj;
}
