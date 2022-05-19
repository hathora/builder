import { join } from "path";
import { CommandModule } from "yargs";
import os from "os";
import fs from "fs";
import { existsSync } from "fs";
import chalk from "chalk";
import axios from "axios";
import prompts from "prompts";

const cmd: CommandModule = {
  command: "destroy",
  describe: "Destroy a Hathora Cloud application",
  builder: {
    appName: { type: "string", demandOption: true },
    yes: { type: "boolean", describe: "Accept all confirmations" },
  },
  handler: async (argv) => {
    const tokenFile = join(os.homedir(), ".config", "hathora", "token");
    if (!existsSync(tokenFile)) {
      console.log(chalk.redBright(`Missing token file, run ${chalk.underline("hathora login")} first`));
      return;
    }
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
    console.log('got here');
    return;
    const token = fs.readFileSync(tokenFile).toString();
    const apps = await axios.delete(`https://cloud.hathora.com/app/${argv.appName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(apps.data);
  },
};

module.exports = cmd;
