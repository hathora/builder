import { join } from "path";
import { CommandModule } from "yargs";
import os from "os";
import fs from "fs";
import { existsSync } from "fs";
import chalk from "chalk";
import https, { RequestOptions } from "https";

const cmd: CommandModule = {
  command: "logs",
  describe: "Get logs from a Hathora Cloud application",
  builder: { appName: { type: "string", demandOption: true } },
  handler: async (argv) => {
    const tokenFile = join(os.homedir(), ".config", "hathora", "token");
    if (!existsSync(tokenFile)) {
      console.log(chalk.redBright(`Missing token file, run ${chalk.underline("hathora login")} first`));
      return;
    }

    const token = fs.readFileSync(tokenFile).toString();
    const requestOptions: RequestOptions = {
      protocol: "https:",
      host: "cloud.hathora.com",
      path: `/app/${argv.appName}/logs`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    https.get(requestOptions, (res) => {
      res.on('data', (d) => process.stdout.write(d.toString()));
    });
  },
};

module.exports = cmd;
  