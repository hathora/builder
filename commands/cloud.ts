import { CommandModule } from "yargs";

const cmd: CommandModule = {
  command: "cloud",
  aliases: ["c"],
  describe: "Interact with Hathora Cloud",
  builder: (yargs) => yargs.commandDir("cloud", { extensions: ["js", "ts"] }),
  handler() {},
};

module.exports = cmd;
