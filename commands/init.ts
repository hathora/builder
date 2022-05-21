import { existsSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { CommandModule } from "yargs";
import { generate } from "../generate";
import { generateLocal, getDirs } from "../utils";

const cmd: CommandModule = {
  command: "init",
  aliases: ["initialize", "initialise"],
  describe: "Creates a new hathora project",
  handler() {
    const { rootDir, serverDir } = getDirs();

    if (existsSync(join(serverDir, "impl.ts"))) {
      console.error(
        `${chalk.red("Cannot init inside existing project, delete ")}` +
          `${chalk.blue.underline("impl.ts")}` +
          `${chalk.red(" to regenerate")}`
      );
    } else {
      generate(rootDir, "templates/bootstrap");
      generateLocal();
    }
  },
};

module.exports = cmd;
