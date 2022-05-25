import { join } from "path";

import { CommandModule } from "yargs";

import { getDirs } from "../utils";
import { generate } from "../generate";

const cmd: CommandModule = {
  command: "create-plugin <lib> <type>",
  describe: "Creates a plugin",
  handler(argv) {
    const { rootDir } = getDirs();
    generate(rootDir, join("plugin", argv.lib as string), { val: argv.type as string });
  },
};

module.exports = cmd;
