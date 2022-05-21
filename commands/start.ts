import { start } from "../utils";
import { CommandModule } from "yargs";

const cmd: CommandModule = {
  command: "start",
  aliases: ["up", "s"],
  describe: "Starts the hathora server",
  builder: { only: { choices: ["client", "server"] } },
  handler(argv) {
    start(argv.only as "server" | "client" | undefined);
  },
};

module.exports = cmd;
