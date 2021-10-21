import fs from "fs";
import { join } from "path";
import { randomBytes } from "crypto";
import "dotenv/config";
import { SmartBuffer } from "smart-buffer";
import { decode } from "@msgpack/msgpack";
import jwt from "jsonwebtoken";
import open from "open";
import LogStore from "./logstore";

type StateId = bigint;

export function fork(stateId: StateId, dataDir: string) {
  const secret = process.env.APP_SECRET!;

  const newStateId = randomBytes(8).readBigUInt64LE();
  fs.copyFileSync(join(dataDir, stateId.toString(36)), join(dataDir, newStateId.toString(36)));
  const log = new LogStore(dataDir);
  const users = new Set<string>();

  const rows = log.load(stateId);
  const { record } = rows[0];
  const reader = SmartBuffer.fromBuffer(record);
  reader.readBigUInt64LE();
  const userBuffer = reader.readBuffer(reader.readUInt32LE());
  reader.readBuffer(reader.readUInt32LE());
  const user = decode(userBuffer) as object & { id: string };
  if (!users.has(user.id)) {
    console.log(`http://localhost:3000/state/${newStateId.toString(36)}#${jwt.sign(user, secret)}`);
    open(`http://localhost:3000/state/${newStateId.toString(36)}#${jwt.sign(user, secret)}`);
    users.add(user.id);
  }
  for (let i = 1; i < rows.length; i++) {
    const { record } = rows[i];
    const reader = SmartBuffer.fromBuffer(record);
    const method = reader.readUInt8();
    if (method === 0xff) {
      const userBuffer = reader.readBuffer(reader.readUInt32LE());
      const user = decode(userBuffer) as object & { id: string };
      if (!users.has(user.id)) {
        console.log(`http://localhost:3000/state/${newStateId.toString(36)}#${jwt.sign(user, secret)}`);
        open(`http://localhost:3000/state/${newStateId.toString(36)}#${jwt.sign(user, secret)}`);
        users.add(user.id);
      }
    }
  }
}
