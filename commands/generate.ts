import { existsSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { generateLocal, getDirs } from "../utils";

module.exports = {
  command: "generate",
  aliases: ["gen", "g"],
  describe: "Regenerates the types from hathora.yml",
  handler: (_argv: any) => {
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
