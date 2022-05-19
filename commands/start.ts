import { CommandModule } from "yargs";
import { start } from "../utils";

const cmd: CommandModule = {
  command: "start",
  aliases: ["up", "s"],
  describe: "Starts the hathora server",
  builder: { only: { choices: ["client", "server"] } },
  handler: (argv: any) => {
    start(argv.only as "server" | "client" | undefined);
  },
};

module.exports = cmd;
