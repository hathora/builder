import { existsSync } from "fs";
import { join } from "path";
import { CommandModule } from "yargs";
import chalk from "chalk";
import { generateLocal, getDirs } from "../utils";

const cmd: CommandModule = {
  command: "generate",
  aliases: ["gen", "g"],
  describe: "Regenerates the types from hathora.yml",
  handler() {
    const { serverDir } = getDirs();
    if (!existsSync(join(serverDir, "impl.ts"))) {
      console.error(
        `${chalk.red("Missing impl.ts, make sure to run")}` +
          `${chalk.blue.bold(" hathora init ")}` +
          `${chalk.red("first")}`
      );
    } else {
      generateLocal();
    }
  },
};

module.exports = cmd;
