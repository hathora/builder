import { generate } from "../generate";
import { getDirs } from "../utils";
import { CommandModule } from "yargs";

const cmd: CommandModule = {
  command: "create-plugin <lib> <type>",
  describe: "Creates a plugin",
  handler(argv) {
    const { rootDir } = getDirs();
    generate(rootDir, `templates/plugin/${argv.lib}`, { val: argv.type as string });
  },
};

module.exports = cmd;
