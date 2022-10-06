import { join } from "path";
import { existsSync } from "fs";

import { CommandModule } from "yargs";
import chalk from "chalk";

import { generateLocal, getDirs } from "../utils";
import { generate } from "../generate";

const cmd: CommandModule = {
  command: "init",
  aliases: ["initialize", "initialise"],
  describe: "Creates a new Hathora project",
  async handler() {
    const { rootDir, serverDir } = getDirs();

    if (existsSync(join(serverDir, "impl.ts"))) {
      console.error(
        `${chalk.red("Cannot init inside existing project, delete ")}` +
          `${chalk.blue.underline("impl.ts")}` +
          `${chalk.red(" to regenerate")}`
      );
    } else {
      generate(rootDir, "bootstrap");
      await generateLocal();
    }
  },
};

module.exports = cmd;
