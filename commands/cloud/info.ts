import { CommandModule } from "yargs";
import { makeCloudApiRequest } from "../../utils";

const cmd: CommandModule = {
  command: "info",
  aliases: ["i", "details", "d"],
  describe: "Get details about a Hathora Cloud application",
  builder: {
    appName: { type: "string", demandOption: true },
    token: { type: "string", demandOption: true, hidden: true },
    cloudApiBase: { type: "string", demandOption: true, hidden: true },
  },
  handler: async (argv) => {
    await makeCloudApiRequest(argv.cloudApiBase as string, `/app/${argv.appName}`, argv.token as string);
  },
};

module.exports = cmd;
