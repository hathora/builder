import fs from "fs";
import os from "os";
import { join } from "path";
import { CommandModule } from "yargs";
import tar from "tar";
import FormData from "form-data";
import chalk from "chalk";
import { existsSync } from "fs-extra";
import { getDirs } from "../../utils";

const cmd: CommandModule = {
  command: "deploy",
  aliases: ["d"],
  describe: "Deploys application to Hathora Cloud",
  builder: { appName: { type: "string", demandOption: true } },
  handler: async (argv) => {
    const { rootDir } = getDirs();
    const tarFile = tar.create(
      {
        cwd: rootDir,
        gzip: true,
        filter: (path) =>
          !path.startsWith("./api") &&
          !path.startsWith("./data") &&
          !path.includes(".hathora") &&
          !path.includes("node_modules"),
      },
      ["."]
    );
    const form = new FormData();
    form.append("appName", argv.appName);
    form.append("file", tarFile, "bundle.tar.gz");
    const tokenFile = join(os.homedir(), ".config", "hathora", "token");
    if (!existsSync(tokenFile)) {
      console.log(chalk.redBright(`Missing token file, run ${chalk.underline("hathora login")} first`));
      return;
    }
    const token = fs.readFileSync(tokenFile).toString();
    const headers = { Authorization: `Bearer ${token}` };
    form.submit({ host: "cloud.hathora.com", protocol: "https:", path: "/deploy", headers }, (err, response) => {
      if (err) {
        console.error("Error: ", err);
      } else {
        response.on("data", (data) => console.log(data.toString()));
      }
    });
  },
};

module.exports = cmd;
