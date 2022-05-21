import { existsSync } from "fs";
import { join } from "path";
import { CommandModule } from "yargs";
import chalk from "chalk";
import { generateLocal, getDirs, install, start } from "../utils";

const cmd: CommandModule = {
  command: "dev",
  aliases: ["development", "d"],
  describe: "Starts the server in development mode",
  builder: { only: { choices: ["client", "server"] } },
  handler(argv) {
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
    install(argv.only as "server" | "client" | undefined);
    start(argv.only as "server" | "client" | undefined);
  },
};

module.exports = cmd;
