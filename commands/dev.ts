import { existsSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { generateLocal, getDirs, install, start } from "../utils";

module.exports = {
  command: "dev",
  aliases: ["development", "d"],
  describe: "Starts the server in development mode",
  builder: { only: { choices: ["client", "server"] } },
  handler: (argv: any) => {
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
