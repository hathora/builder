import { CommandModule } from "yargs";
import prompts from "prompts";
import { makeCloudApiRequest } from "../../utils";

const cmd: CommandModule = {
  command: "destroy",
  describe: "Destroy a Hathora Cloud application",
  builder: {
    yes: { type: "boolean", describe: "Accept all confirmations", default: false },
    appName: { type: "string", demandOption: true },
    token: { type: "string", demandOption: true, hidden: true },
    cloudApiBase: { type: "string", demandOption: true, hidden: true },
  },
  handler: async (argv) => {
    if (!argv.yes) {
      const userInput = await prompts({
        type: "confirm",
        name: "value",
        message: `Are you sure you want to destroy ${argv.appName}? This action is irreversible.`,
      });

      if (!userInput.value) {
        return;
      }
    }
    await makeCloudApiRequest(argv.cloudApiBase as string, `/app/${argv.appName}`, argv.token as string, "DELETE");
  },
};

module.exports = cmd;
