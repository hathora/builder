#!/usr/bin/env node

import { join } from "path";
import os from "os";
import fs from "fs";

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { MiddlewareFunction } from "yargs";
import updateNotifier from "update-notifier";
import chalk from "chalk";

updateNotifier({ pkg: require("../package.json") }).notify({ defer: false, isGlobal: true });

const cloudMiddleware: MiddlewareFunction = (argv) => {
  if (argv._[0] !== "cloud") {
    return;
  }

  if (!(argv._[1] === "login" || "token" in argv)) {
    const tokenFile = join(os.homedir(), ".config", "hathora", "token");
    if (!fs.existsSync(tokenFile)) {
      console.log(chalk.redBright(`Missing token file, run ${chalk.underline("hathora cloud login")} first`));
      return;
    }

    argv.token = fs.readFileSync(tokenFile).toString();
  }

  if (!("cloudApiBase" in argv)) {
    argv.cloudApiBase = "https://cloud.hathora.com/v1";
  }
};

yargs(hideBin(process.argv))
  .scriptName("hathora")
  .middleware(cloudMiddleware, true)
  .commandDir("commands", { extensions: ["js", "ts"] })
  .demandCommand()
  .recommendCommands()
  .completion()
  .wrap(72)
  .parse();
