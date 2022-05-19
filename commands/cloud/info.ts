import { join } from "path";
import { CommandModule } from "yargs";
import os from "os";
import fs from "fs";
import { existsSync } from "fs";
import chalk from "chalk";
import axios from "axios";

const cmd: CommandModule = {
  command: "info",
  aliases: ["i", "details", "d"],
  describe: "Get details about a Hathora Cloud application",
  builder: { appName: { type: "string", demandOption: true } },
  handler: async (argv) => {
    const tokenFile = join(os.homedir(), ".config", "hathora", "token");
    if (!existsSync(tokenFile)) {
      console.log(chalk.redBright(`Missing token file, run ${chalk.underline("hathora login")} first`));
      return;
    }
    const token = fs.readFileSync(tokenFile).toString();
    const apps = await axios.get(`https://cloud.hathora.com/app/${argv.appName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(apps.data);
  },
};

module.exports = cmd;
