import { CommandModule } from "yargs";
import { makeCloudApiRequest } from "../../utils";

const cmd: CommandModule = {
  command: "list",
  aliases: ["ls"],
  describe: "List Hathora Cloud applications",
  builder: {
    token: { type: "string", demandOption: true, hidden: true },
    cloudApiBase: { type: "string", demandOption: true, hidden: true },
  },
  handler: async (argv) => {
    await makeCloudApiRequest(argv.cloudApiBase as string, `/list`, argv.token as string);
  },
};

module.exports = cmd;
