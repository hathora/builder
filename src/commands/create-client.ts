import { join } from "path";

import { CommandModule } from "yargs";

import { getDirs } from "../utils";
import { generate } from "../generate";

const cmd: CommandModule = {
  command: "create-client <template> <name>",
  describe: "Creates a client subdirectory",
  handler(argv) {
    const { rootDir } = getDirs();
    generate(rootDir, join("client", argv.template as string), { name: argv.name as string });
  },
};

module.exports = cmd;
