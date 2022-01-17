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

export type QuestId = number;
export enum Role {
  MERLIN,
  PERCIVAL,
  LOYAL_SERVANT,
  MORGANA,
  MORDRED,
  OBERON,
  ASSASSIN,
  MINION,
}
export enum Vote {
  PASS,
  FAIL,
}
export enum QuestStatus {
  PROPOSING_QUEST,
  VOTING_FOR_PROPOSAL,
  PROPOSAL_REJECTED,
  VOTING_IN_QUEST,
  PASSED,
  FAILED,
}
export enum GameStatus {
  NOT_STARTED,
  IN_PROGRESS,
  GOOD_WON,
  EVIL_WON,
}
export type RoleInfo = {
  role: Role;
  isEvil: boolean;
  knownRoles: Role[];
  quantity: number;
};
export type PlayerAndVote = {
  player: UserId;
  vote?: Vote;
};
export type QuestAttempt = {
  id: QuestId;
  status: QuestStatus;
  roundNumber: number;
  attemptNumber: number;
  leader: UserId;
  members: UserId[];
  proposalVotes: PlayerAndVote[];
  results: PlayerAndVote[];
  numFailures: number;
};
export type PlayerState = {
  status: GameStatus;
  rolesInfo: RoleInfo[];
  creator: UserId;
  players: UserId[];
  role?: Role;
  knownPlayers: UserId[];
  playersPerQuest: number[];
  quests: QuestAttempt[];
};
export type UserId = string;
export type ICreateGameRequest = {
};
export type IJoinGameRequest = {
};
export type IStartGameRequest = {
  roleList: Role[];
  playerOrder: UserId[];
  leader?: UserId;
};
export type IProposeQuestRequest = {
  questId: QuestId;
  proposedMembers: UserId[];
};
export type IVoteForProposalRequest = {
  questId: QuestId;
  vote: Vote;
};
export type IVoteInQuestRequest = {
  questId: QuestId;
  vote: Vote;
};

export const RoleInfo = {
  default(): RoleInfo {
    return {
      role: 0,
      isEvil: false,
      knownRoles: [],
      quantity: 0,
    };
  },
  encode(obj: RoleInfo, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeUInt8(buf, obj.role);
    writeBoolean(buf, obj.isEvil);
    writeArray(buf, obj.knownRoles, (x) => writeUInt8(buf, x));
    writeInt(buf, obj.quantity);
    return buf;
  },
  encodeDiff(obj: DeepPartial<RoleInfo>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.role !== NO_DIFF);
    tracker.push(obj.isEvil !== NO_DIFF);
    tracker.push(obj.knownRoles !== NO_DIFF);
    tracker.push(obj.quantity !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.role !== NO_DIFF) {
      writeUInt8(buf, obj.role);
    }
    if (obj.isEvil !== NO_DIFF) {
      writeBoolean(buf, obj.isEvil);
    }
    if (obj.knownRoles !== NO_DIFF) {
      writeArrayDiff(buf, obj.knownRoles, (x) => writeUInt8(buf, x));
    }
    if (obj.quantity !== NO_DIFF) {
      writeInt(buf, obj.quantity);
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): RoleInfo {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      role: parseUInt8(sb),
      isEvil: parseBoolean(sb),
      knownRoles: parseArray(sb, () => parseUInt8(sb)),
      quantity: parseInt(sb),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<RoleInfo> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(4);
    return {
      role: tracker.shift() ? parseUInt8(sb) : NO_DIFF,
      isEvil: tracker.shift() ? parseBoolean(sb) : NO_DIFF,
      knownRoles: tracker.shift() ? parseArrayDiff(sb, () => parseUInt8(sb)) : NO_DIFF,
      quantity: tracker.shift() ? parseInt(sb) : NO_DIFF,
    };
  },
};
export const PlayerAndVote = {
  default(): PlayerAndVote {
    return {
      player: "",
      vote: undefined,
    };
  },
  encode(obj: PlayerAndVote, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeString(buf, obj.player);
    writeOptional(buf, obj.vote, (x) => writeUInt8(buf, x));
    return buf;
  },
  encodeDiff(obj: DeepPartial<PlayerAndVote>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.player !== NO_DIFF);
    tracker.push(obj.vote !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.player !== NO_DIFF) {
      writeString(buf, obj.player);
    }
    if (obj.vote !== NO_DIFF) {
      writeOptional(buf, obj.vote, (x) => writeUInt8(buf, x));
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): PlayerAndVote {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      player: parseString(sb),
      vote: parseOptional(sb, () => parseUInt8(sb)),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<PlayerAndVote> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(2);
    return {
      player: tracker.shift() ? parseString(sb) : NO_DIFF,
      vote: tracker.shift() ? parseOptional(sb, () => parseUInt8(sb)) : NO_DIFF,
    };
  },
};
export const QuestAttempt = {
  default(): QuestAttempt {
    return {
      id: 0,
      status: 0,
      roundNumber: 0,
      attemptNumber: 0,
      leader: "",
      members: [],
      proposalVotes: [],
      results: [],
      numFailures: 0,
    };
  },
  encode(obj: QuestAttempt, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeInt(buf, obj.id);
    writeUInt8(buf, obj.status);
    writeInt(buf, obj.roundNumber);
    writeInt(buf, obj.attemptNumber);
    writeString(buf, obj.leader);
    writeArray(buf, obj.members, (x) => writeString(buf, x));
    writeArray(buf, obj.proposalVotes, (x) => PlayerAndVote.encode(x, buf));
    writeArray(buf, obj.results, (x) => PlayerAndVote.encode(x, buf));
    writeInt(buf, obj.numFailures);
    return buf;
  },
  encodeDiff(obj: DeepPartial<QuestAttempt>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.id !== NO_DIFF);
    tracker.push(obj.status !== NO_DIFF);
    tracker.push(obj.roundNumber !== NO_DIFF);
    tracker.push(obj.attemptNumber !== NO_DIFF);
    tracker.push(obj.leader !== NO_DIFF);
    tracker.push(obj.members !== NO_DIFF);
    tracker.push(obj.proposalVotes !== NO_DIFF);
    tracker.push(obj.results !== NO_DIFF);
    tracker.push(obj.numFailures !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.id !== NO_DIFF) {
      writeInt(buf, obj.id);
    }
    if (obj.status !== NO_DIFF) {
      writeUInt8(buf, obj.status);
    }
    if (obj.roundNumber !== NO_DIFF) {
      writeInt(buf, obj.roundNumber);
    }
    if (obj.attemptNumber !== NO_DIFF) {
      writeInt(buf, obj.attemptNumber);
    }
    if (obj.leader !== NO_DIFF) {
      writeString(buf, obj.leader);
    }
    if (obj.members !== NO_DIFF) {
      writeArrayDiff(buf, obj.members, (x) => writeString(buf, x));
    }
    if (obj.proposalVotes !== NO_DIFF) {
      writeArrayDiff(buf, obj.proposalVotes, (x) => PlayerAndVote.encodeDiff(x, buf));
    }
    if (obj.results !== NO_DIFF) {
      writeArrayDiff(buf, obj.results, (x) => PlayerAndVote.encodeDiff(x, buf));
    }
    if (obj.numFailures !== NO_DIFF) {
      writeInt(buf, obj.numFailures);
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): QuestAttempt {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      id: parseInt(sb),
      status: parseUInt8(sb),
      roundNumber: parseInt(sb),
      attemptNumber: parseInt(sb),
      leader: parseString(sb),
      members: parseArray(sb, () => parseString(sb)),
      proposalVotes: parseArray(sb, () => PlayerAndVote.decode(sb)),
      results: parseArray(sb, () => PlayerAndVote.decode(sb)),
      numFailures: parseInt(sb),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<QuestAttempt> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(9);
    return {
      id: tracker.shift() ? parseInt(sb) : NO_DIFF,
      status: tracker.shift() ? parseUInt8(sb) : NO_DIFF,
      roundNumber: tracker.shift() ? parseInt(sb) : NO_DIFF,
      attemptNumber: tracker.shift() ? parseInt(sb) : NO_DIFF,
      leader: tracker.shift() ? parseString(sb) : NO_DIFF,
      members: tracker.shift() ? parseArrayDiff(sb, () => parseString(sb)) : NO_DIFF,
      proposalVotes: tracker.shift() ? parseArrayDiff(sb, () => PlayerAndVote.decodeDiff(sb)) : NO_DIFF,
      results: tracker.shift() ? parseArrayDiff(sb, () => PlayerAndVote.decodeDiff(sb)) : NO_DIFF,
      numFailures: tracker.shift() ? parseInt(sb) : NO_DIFF,
    };
  },
};
export const PlayerState = {
  default(): PlayerState {
    return {
      status: 0,
      rolesInfo: [],
      creator: "",
      players: [],
      role: undefined,
      knownPlayers: [],
      playersPerQuest: [],
      quests: [],
    };
  },
  encode(obj: PlayerState, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeUInt8(buf, obj.status);
    writeArray(buf, obj.rolesInfo, (x) => RoleInfo.encode(x, buf));
    writeString(buf, obj.creator);
    writeArray(buf, obj.players, (x) => writeString(buf, x));
    writeOptional(buf, obj.role, (x) => writeUInt8(buf, x));
    writeArray(buf, obj.knownPlayers, (x) => writeString(buf, x));
    writeArray(buf, obj.playersPerQuest, (x) => writeInt(buf, x));
    writeArray(buf, obj.quests, (x) => QuestAttempt.encode(x, buf));
    return buf;
  },
  encodeDiff(obj: DeepPartial<PlayerState>, writer?: Writer) {
    const buf = writer ?? new Writer();
    const tracker: boolean[] = [];
    tracker.push(obj.status !== NO_DIFF);
    tracker.push(obj.rolesInfo !== NO_DIFF);
    tracker.push(obj.creator !== NO_DIFF);
    tracker.push(obj.players !== NO_DIFF);
    tracker.push(obj.role !== NO_DIFF);
    tracker.push(obj.knownPlayers !== NO_DIFF);
    tracker.push(obj.playersPerQuest !== NO_DIFF);
    tracker.push(obj.quests !== NO_DIFF);
    buf.writeBits(tracker);
    if (obj.status !== NO_DIFF) {
      writeUInt8(buf, obj.status);
    }
    if (obj.rolesInfo !== NO_DIFF) {
      writeArrayDiff(buf, obj.rolesInfo, (x) => RoleInfo.encodeDiff(x, buf));
    }
    if (obj.creator !== NO_DIFF) {
      writeString(buf, obj.creator);
    }
    if (obj.players !== NO_DIFF) {
      writeArrayDiff(buf, obj.players, (x) => writeString(buf, x));
    }
    if (obj.role !== NO_DIFF) {
      writeOptional(buf, obj.role, (x) => writeUInt8(buf, x));
    }
    if (obj.knownPlayers !== NO_DIFF) {
      writeArrayDiff(buf, obj.knownPlayers, (x) => writeString(buf, x));
    }
    if (obj.playersPerQuest !== NO_DIFF) {
      writeArrayDiff(buf, obj.playersPerQuest, (x) => writeInt(buf, x));
    }
    if (obj.quests !== NO_DIFF) {
      writeArrayDiff(buf, obj.quests, (x) => QuestAttempt.encodeDiff(x, buf));
    }
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): PlayerState {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      status: parseUInt8(sb),
      rolesInfo: parseArray(sb, () => RoleInfo.decode(sb)),
      creator: parseString(sb),
      players: parseArray(sb, () => parseString(sb)),
      role: parseOptional(sb, () => parseUInt8(sb)),
      knownPlayers: parseArray(sb, () => parseString(sb)),
      playersPerQuest: parseArray(sb, () => parseInt(sb)),
      quests: parseArray(sb, () => QuestAttempt.decode(sb)),
    };
  },
  decodeDiff(buf: ArrayBufferView | Reader): DeepPartial<PlayerState> {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    const tracker = sb.readBits(8);
    return {
      status: tracker.shift() ? parseUInt8(sb) : NO_DIFF,
      rolesInfo: tracker.shift() ? parseArrayDiff(sb, () => RoleInfo.decodeDiff(sb)) : NO_DIFF,
      creator: tracker.shift() ? parseString(sb) : NO_DIFF,
      players: tracker.shift() ? parseArrayDiff(sb, () => parseString(sb)) : NO_DIFF,
      role: tracker.shift() ? parseOptional(sb, () => parseUInt8(sb)) : NO_DIFF,
      knownPlayers: tracker.shift() ? parseArrayDiff(sb, () => parseString(sb)) : NO_DIFF,
      playersPerQuest: tracker.shift() ? parseArrayDiff(sb, () => parseInt(sb)) : NO_DIFF,
      quests: tracker.shift() ? parseArrayDiff(sb, () => QuestAttempt.decodeDiff(sb)) : NO_DIFF,
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
      roleList: [],
      playerOrder: [],
      leader: undefined,
    };
  },
  encode(obj: IStartGameRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeArray(buf, obj.roleList, (x) => writeUInt8(buf, x));
    writeArray(buf, obj.playerOrder, (x) => writeString(buf, x));
    writeOptional(buf, obj.leader, (x) => writeString(buf, x));
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IStartGameRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      roleList: parseArray(sb, () => parseUInt8(sb)),
      playerOrder: parseArray(sb, () => parseString(sb)),
      leader: parseOptional(sb, () => parseString(sb)),
    };
  }
}
export const IProposeQuestRequest = {
  default(): IProposeQuestRequest {
    return {
      questId: 0,
      proposedMembers: [],
    };
  },
  encode(obj: IProposeQuestRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeInt(buf, obj.questId);
    writeArray(buf, obj.proposedMembers, (x) => writeString(buf, x));
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IProposeQuestRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      questId: parseInt(sb),
      proposedMembers: parseArray(sb, () => parseString(sb)),
    };
  }
}
export const IVoteForProposalRequest = {
  default(): IVoteForProposalRequest {
    return {
      questId: 0,
      vote: 0,
    };
  },
  encode(obj: IVoteForProposalRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeInt(buf, obj.questId);
    writeUInt8(buf, obj.vote);
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IVoteForProposalRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      questId: parseInt(sb),
      vote: parseUInt8(sb),
    };
  }
}
export const IVoteInQuestRequest = {
  default(): IVoteInQuestRequest {
    return {
      questId: 0,
      vote: 0,
    };
  },
  encode(obj: IVoteInQuestRequest, writer?: Writer) {
    const buf = writer ?? new Writer();
    writeInt(buf, obj.questId);
    writeUInt8(buf, obj.vote);
    return buf;
  },
  decode(buf: ArrayBufferView | Reader): IVoteInQuestRequest {
    const sb = ArrayBuffer.isView(buf) ? new Reader(buf) : buf;
    return {
      questId: parseInt(sb),
      vote: parseUInt8(sb),
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
