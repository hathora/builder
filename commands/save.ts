import { join } from "path";
import { copySync } from "fs-extra";
import { CommandModule } from "yargs";
import { getDirs } from "../utils";

const cmd: CommandModule = {
  command: "save <stateId> <saveName>",
  aliases: ["gamesave", "sv"],
  describe: "Creates a named save game from a specific state id",
  handler(argv) {
    const { rootDir } = getDirs();
    copySync(join(rootDir, "data", argv.stateId as string), join(rootDir, "data", "saves", argv.saveName as string));
  },
};

module.exports = cmd;
