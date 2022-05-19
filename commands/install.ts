import { CommandModule } from "yargs";
import { install } from "../utils";

const cmd: CommandModule = {
  command: "install",
  aliases: ["i"],
  describe: "Install hathora dependencies",
  builder: { only: { choices: ["client", "server"] } },
  handler: (argv: any) => {
    install(argv.only as "server" | "client" | undefined);
  },
};

module.exports = cmd;
