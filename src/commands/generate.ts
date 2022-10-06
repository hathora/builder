import { join } from "path";
import { existsSync } from "fs";

import { CommandModule } from "yargs";
import chalk from "chalk";

import { generateLocal, getDirs } from "../utils";

const cmd: CommandModule = {
  command: "generate",
  aliases: ["gen", "g"],
  describe: "Regenerates the types from hathora.yml",
  async handler() {
    const { serverDir } = getDirs();
    if (!existsSync(join(serverDir, "impl.ts"))) {
      console.error(
        `${chalk.red("Missing impl.ts, make sure to run")}` +
          `${chalk.blue.bold(" hathora init ")}` +
          `${chalk.red("first")}`
      );
    } else {
      await generateLocal();
    }
  },
};

module.exports = cmd;
