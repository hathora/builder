import { start } from "../utils";

module.exports = {
  command: "start",
  aliases: ["up", "s"],
  describe: "Starts the hathora server",
  builder: { only: { choices: ["client", "server"] } },
  handler: (argv: any) => {
    start(argv.only as "server" | "client" | undefined);
  },
};
