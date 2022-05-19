import { copySync } from "fs-extra";
import { join } from "path";

import { getDirs } from "../utils";

module.exports = {
  command: "save <stateId> <saveName>",
  aliases: ["gamesave", "sv"],
  describe: "Creates a named save game from a specific state id",
  handler: (argv: any) => {
    const { rootDir } = getDirs();
    copySync(join(rootDir, "data", argv.stateId as string), join(rootDir, "data", "saves", argv.saveName as string));
  },
};