#!/usr/bin/env node

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import updateNotifier from "update-notifier";
import chalk from "chalk";

import { getDirs } from "./utils";

updateNotifier({ pkg: require("./package.json") }).notify({ defer: false, isGlobal: true });

yargs(hideBin(process.argv))
  .scriptName("hathora")
  .middleware(() => console.log(`Project root: ${chalk.underline(getDirs().rootDir)}`))
  .commandDir("commands", { extensions: ["js", "ts"] })
  .demandCommand()
  .recommendCommands()
  .completion()
  .wrap(72)
  .parse();
