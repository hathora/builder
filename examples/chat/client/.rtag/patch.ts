import {
  NO_DIFF,
  DeepPartial,
  Message,
  RoomState,
  UserId,
} from "./types";

function patchMessage(obj: Message, patch: DeepPartial<Message>) {
  if (patch.text !== NO_DIFF) {
    obj.text = patch.text;
  }
  if (patch.sentAt !== NO_DIFF) {
    obj.sentAt = patch.sentAt;
  }
  if (patch.sentBy !== NO_DIFF) {
    obj.sentBy = patch.sentBy;
  }
  if (patch.sentTo !== NO_DIFF) {
    obj.sentTo = patchOptional(obj.sentTo, patch.sentTo, (a, b) => b);
  }
  return obj;
}

function patchRoomState(obj: RoomState, patch: DeepPartial<RoomState>) {
  if (patch.name !== NO_DIFF) {
    obj.name = patch.name;
  }
  if (patch.createdBy !== NO_DIFF) {
    obj.createdBy = patch.createdBy;
  }
  if (patch.messages !== NO_DIFF) {
    obj.messages = patchArray(obj.messages, patch.messages, (a, b) => patchMessage(a, b));
  }
  return obj;
}

function patchArray<T>(arr: T[], patch: (typeof NO_DIFF | any)[], innerPatch: (a: T, b: DeepPartial<T>) => T) {
  patch.forEach((val, i) => {
    if (val !== NO_DIFF) {
      if (i >= arr.length) {
        arr.push(val as T);
      } else {
        arr[i] = innerPatch(arr[i], val);
      }
    }
  });
  if (patch.length < arr.length) {
    arr.splice(patch.length);
  }
  return arr;
}

function patchOptional<T>(obj: T | undefined, patch: any, innerPatch: (a: T, b: DeepPartial<T>) => T) {
  if (patch === undefined) {
    return undefined;
  } else if (obj === undefined) {
    return patch as T;
  } else {
    return innerPatch(obj, patch);
  }
}

export function computePatch(state: RoomState, patch: DeepPartial<RoomState>) {
  return patchRoomState(state, patch);
}
