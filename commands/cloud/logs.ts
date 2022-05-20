import { CommandModule } from "yargs";
import { makeCloudApiRequest } from "../../utils";

const cmd: CommandModule = {
  command: "logs",
  describe: "Get logs from a Hathora Cloud application",
  builder: {
    appName: { type: "string", demandOption: true },
    token: { type: "string", demandOption: true, hidden: true },
    cloudApiBase: { type: "string", demandOption: true, hidden: true },
  },
  handler: async (argv) => {
    await makeCloudApiRequest(argv.cloudApiBase as string, `/app/${argv.appName}/logs`, argv.token as string);
  },
};

module.exports = cmd;
