import { install } from "../utils";

module.exports = {
  command: "install",
  aliases: ["i"],
  describe: "Install hathora dependencies",
  builder: { only: { choices: ["client", "server"] } },
  handler: (argv: any) => {
    install(argv.only as "server" | "client" | undefined);
  },
};
