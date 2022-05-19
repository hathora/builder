import { generate } from "../generate";
import { getDirs } from "../utils";

module.exports = {
  command: "create-plugin <lib> <type>",
  describe: "Creates a plugin",
  handler: (argv: any) => {
    const { rootDir } = getDirs();
    generate(rootDir, `templates/plugin/${argv.lib}`, { val: argv.type as string });
  },
};
