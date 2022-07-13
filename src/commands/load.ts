import { join } from "path";
import { randomBytes } from "crypto";

import { CommandModule } from "yargs";
import jwt from "jsonwebtoken";
import { copySync } from "fs-extra";
import dotenv from "dotenv";
import { Reader } from "bin-serde";
import { LogStore } from "@hathora/log-store";

import { getAppConfig, getDirs } from "../utils";

function loadUsersFromLog(rootDir: string, stateId: bigint) {
  const log = new LogStore(join(rootDir, "data"));
  const rows = log.load(stateId);
  const userIds = new Set<string>();

  const { record } = rows[0];
  const reader = new Reader(record);
  reader.readUInt64(); // seed
  userIds.add(reader.readString());
  reader.readBuffer(reader.readUVarint()); // initializeArgs

  for (let i = 1; i < rows.length; i++) {
    const { record } = rows[i];
    const reader = new Reader(record);
    const method = reader.readUInt8();
    console.log("method", method);
    if (method === 0xff) {
      reader.readUInt32(); // timeDelta
      continue;
    }
    userIds.add(reader.readString());
    reader.readBuffer(reader.readUVarint()); // argsBuffer
  }

  return userIds;
}

const cmd: CommandModule = {
  command: "load <saveName>",
  aliases: ["gameload", "ld"],
  describe: "Loads a save file",
  handler(argv) {
    const { rootDir } = getDirs();
    const stateId = randomBytes(8).readBigUInt64LE();
    copySync(join(rootDir, "data", "saves", argv.saveName as string), join(rootDir, "data", stateId.toString(36)));

    dotenv.config({ path: join(rootDir, ".env") });
    const { appSecret } = getAppConfig();

    const userIds = loadUsersFromLog(rootDir, stateId);
    userIds.forEach((userId) => {
      const token = jwt.sign({ id: userId }, appSecret);
      console.log(`http://localhost:3000/state/${stateId.toString(36)}#${token}`);
    });
  },
};

module.exports = cmd;
