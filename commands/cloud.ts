import { CommandModule } from "yargs";

const cmd: CommandModule = {
  command: "cloud",
  describe: "Interact with Hathora Cloud",
  builder: (yargs) => {
    return yargs.commandDir("cloud", {
      extensions: ["js", "ts"],
    });
  },
  handler() {},
};

module.exports = cmd;
