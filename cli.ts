#!/usr/bin/env node

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import updateNotifier from "update-notifier";
import chalk from "chalk";

updateNotifier({ pkg: require("./package.json") }).notify({ defer: false, isGlobal: true });

yargs(hideBin(process.argv))
  .scriptName("hathora")
  .commandDir("commands", { extensions: ["js", "ts"] })
  .demandCommand()
  .recommendCommands()
  .completion()
  .wrap(72)
  .parse();
