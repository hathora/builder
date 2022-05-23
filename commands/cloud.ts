import { CommandModule } from "yargs";

const cmd: CommandModule = {
  command: "cloud",
  aliases: ["c"],
  describe: "Interact with Hathora Cloud",
  builder: (yargs) => yargs.commandDir("cloud", { extensions: ["js", "ts"] }),
  handler() {
    console.log("Please use one of the subcommands (run with --help for full list.");
  },
};

module.exports = cmd;
