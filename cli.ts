#!/usr/bin/env node

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import updateNotifier from "update-notifier";
import { MiddlewareFunction } from "yargs";
import { join } from "path";
import { existsSync } from "fs";
import chalk from "chalk";
import os from "os";
import fs from "fs";

updateNotifier({ pkg: require("./package.json") }).notify({ defer: false, isGlobal: true });

const cloudMiddleware: MiddlewareFunction = (argv) => {
  if (argv._[0] !== "cloud") {
    return;
  }

  if (!(argv._[1] === "login" || "token" in argv)) {
    const tokenFile = join(os.homedir(), ".config", "hathora", "token");
    if (!existsSync(tokenFile)) {
      console.log(chalk.redBright(`Missing token file, run ${chalk.underline("hathora login")} first`));
      return;
    }

    argv.token = fs.readFileSync(tokenFile).toString();
  }

  if (!("cloudApiBase" in argv)) {
    argv.cloudApiBase = "https://cloud.hathora.com/v1";
  }

  return;
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
