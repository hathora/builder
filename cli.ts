#!/usr/bin/env node

import { createHash } from "crypto";
import fs from "fs";
import os from "os";
import { outputFileSync, existsSync, readdirSync, copySync } from "fs-extra";
import { join } from "path";
import { pathToFileURL } from "url";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import { Issuer } from "openid-client";
import prompts from "prompts";
import open from "open";
import shelljs from "shelljs";
import { v4 as uuidv4 } from "uuid";
import tar from "tar";
import FormData from "form-data";
import dotenv from "dotenv";
import { createServer, build as buildClient } from "vite";
import { build as buildServer } from "esbuild";
import updateNotifier from "update-notifier";
import { generate } from "./generate";
import "./helpers";

function getProjectRoot(cwd: string): string {
  if (existsSync(join(cwd, "hathora.yml"))) {
    return cwd;
  }
  const parentDir = join(cwd, "..");
  if (parentDir === cwd) {
    throw new Error("Doesn't appear to be inside a hathora project");
  }
  return getProjectRoot(parentDir);
}

function getAppConfig() {
  const appSecret = process.env.APP_SECRET ?? uuidv4();
  const appId = createHash("sha256").update(appSecret).digest("hex");
  const coordinatorHost = process.env.COORDINATOR_HOST ?? "coordinator.hathora.dev";
  const matchmakerHost = process.env.MATCHMAKER_HOST ?? "matchmaker.hathora.dev";
  return { appId, appSecret, coordinatorHost, matchmakerHost };
}

function generateLocal() {
  dotenv.config({ path: join(rootDir, ".env") });
  const appConfig = getAppConfig();
  generate(rootDir, "templates/base", appConfig);
  if (!existsSync(join(rootDir, ".env"))) {
    outputFileSync(join(rootDir, ".env"), `APP_SECRET=${appConfig.appSecret}\n`);
  }
}

function npmInstall(dir: string) {
  console.log(`Installing dependencies in ${dir}`);
  if (existsSync(join(dir, "yarn.lock"))) {
    shelljs.exec(`yarn install --cwd ${dir}`);
  } else if (existsSync(join(dir, "package.json"))) {
    shelljs.cd(dir);
    shelljs.exec("npm install");
  }
}

function install(only: "server" | "client" | undefined) {
  npmInstall(join(rootDir, "api"));
  if (only === "client" || only === undefined) {
    readdirSync(clientDir).forEach((dir) => npmInstall(join(clientDir, dir)));
    if (existsSync(join(clientDir, "prototype-ui", "plugins"))) {
      readdirSync(join(clientDir, "prototype-ui", "plugins")).forEach((dir) =>
        npmInstall(join(clientDir, "prototype-ui", "plugins", dir))
      );
    }
  }
  if (only === "server" || only === undefined) {
    npmInstall(serverDir);
    npmInstall(join(serverDir, ".hathora"));
  }
}

async function startServer() {
  shelljs.cd(join(serverDir, ".hathora"));
  process.env.DATA_DIR = join(rootDir, "data");
  process.env.NODE_LOADER_CONFIG = join(__dirname, "node-loader.config.mjs");
  const loaderPath = pathToFileURL(require.resolve("@node-loader/core/lib/node-loader-core.js"));
  const storePath = join(serverDir, ".hathora/store.ts");
  const cp = shelljs.exec(`node --loader ${loaderPath} --experimental-specifier-resolution=node "${storePath}"`, {
    async: true,
  });
  return new Promise((resolve, reject) => {
    cp.stdout?.on("data", resolve);
    cp.on("error", reject);
  });
}

async function startFrontend(root: string) {
  console.log(`Starting frontend at ${chalk.blue.underline.bold(root)}`);
  return createServer({
    root,
    build: { target: ["esnext"] },
    envDir: rootDir,
    clearScreen: false,
    server: { host: "0.0.0.0" },
  })
    .then((server) => server.listen())
    .then((server) => server.printUrls());
}

async function startFrontends() {
  for (const dir of readdirSync(clientDir)) {
    if (existsSync(join(clientDir, dir, "index.html"))) {
      await startFrontend(join(clientDir, dir));
    }
  }
}

async function start(only: "server" | "client" | undefined) {
  if (only === "client") {
    return startFrontends();
  } else if (only === "server") {
    return startServer();
  } else {
    return startServer().then(startFrontends);
  }
}

function build(only: "server" | "client" | undefined) {
  if (only === "client" || only === undefined) {
    for (const dir of readdirSync(clientDir)) {
      if (existsSync(join(clientDir, dir, "index.html"))) {
        buildClient({
          root: join(clientDir, dir),
          build: { outDir: join(rootDir, "dist", "client", dir), target: ["esnext"] },
          clearScreen: false,
        });
      }
    }
  }
  if (only === "server" || only === undefined) {
    buildServer({
      entryPoints: [join(serverDir, ".hathora", "store.ts")],
      bundle: true,
      platform: "node",
      format: "esm",
      outfile: join(rootDir, "dist", "server", "index.mjs"),
      banner: {
        js: "import { createRequire as topLevelCreateRequire } from 'module';\n const require = topLevelCreateRequire(import.meta.url);",
      },
    });
  }
}

updateNotifier({ pkg: require("./package.json") }).notify({ defer: false, isGlobal: true });

const rootDir = getProjectRoot(process.cwd());
const clientDir = join(rootDir, "client");
const serverDir = join(rootDir, "server");

console.log(`Project root: ${chalk.underline(rootDir)}`);

yargs(hideBin(process.argv))
  .scriptName("hathora")
  .command({
    command: "generate",
    aliases: ["gen", "g"],
    describe: "Regenerates the types from hathora.yml",
    handler: (_argv) => {
      if (!existsSync(join(serverDir, "impl.ts"))) {
        console.error(
          `${chalk.red("Missing impl.ts, make sure to run")}` +
            `${chalk.blue.bold(" hathora init ")}` +
            `${chalk.red("first")}`
        );
      } else {
        generateLocal();
      }
    },
  })
  .command({
    command: "init",
    aliases: ["initialize", "initialise"],
    describe: "Creates a new hathora project",
    handler: (_argv) => {
      if (existsSync(join(serverDir, "impl.ts"))) {
        console.error(
          `${chalk.red("Cannot init inside existing project, delete ")}` +
            `${chalk.blue.underline("impl.ts")}` +
            `${chalk.red(" to regenerate")}`
        );
      } else {
        generate(rootDir, "templates/bootstrap");
        generateLocal();
      }
    },
  })
  .command({
    command: "install",
    aliases: ["i"],
    describe: "Install hathora dependencies",
    builder: { only: { choices: ["client", "server"] } },
    handler: (argv) => {
      install(argv.only as "server" | "client" | undefined);
    },
  })
  .command({
    command: "start",
    aliases: ["up", "s"],
    describe: "Starts the hathora server",
    builder: { only: { choices: ["client", "server"] } },
    handler: (argv) => {
      start(argv.only as "server" | "client" | undefined);
    },
  })
  .command({
    command: "dev",
    aliases: ["development", "d"],
    describe: "Starts the server in development mode",
    builder: { only: { choices: ["client", "server"] } },
    handler: (argv) => {
      if (!existsSync(join(serverDir, "impl.ts"))) {
        console.error(
          `${chalk.red("Missing impl.ts, make sure to run")}` +
            `${chalk.blue.bold(" hathora init ")}` +
            `${chalk.red("first")}`
        );
      } else {
        generateLocal();
      }
      install(argv.only as "server" | "client" | undefined);
      start(argv.only as "server" | "client" | undefined);
    },
  })
  .command({
    command: "save <stateId> <saveName>",
    aliases: ["gamesave", "sv"],
    describe: "Creates a named save game from a specific state id",
    handler: (argv) => {
      copySync(join(rootDir, "data", argv.stateId as string), join(rootDir, "data", "saves", argv.saveName as string));
    },
  })
  .command({
    command: "build",
    aliases: ["b"],
    describe: "Builds the project",
    builder: { only: { choices: ["client", "server"] } },
    handler: (argv) => {
      if (!existsSync(join(serverDir, "impl.ts"))) {
        console.error(
          `${chalk.red("Missing impl.ts, make sure to run")}` +
            `${chalk.blue.bold(" hathora init ")}` +
            `${chalk.red("first")}`
        );
      } else {
        generate(rootDir, "templates/base", getAppConfig());
      }
      install(argv.only as "server" | "client" | undefined);
      build(argv.only as "server" | "client" | undefined);
    },
  })
  .command({
    command: "create-plugin <lib> <type>",
    describe: "Creates a plugin",
    handler: (argv) => {
      generate(rootDir, `templates/plugin/${argv.lib}`, { val: argv.type as string });
    },
  })
  .command({
    command: "login",
    handler: async (_argv) => {
      const auth0 = await Issuer.discover("https://dev-tchp6in9.us.auth0.com");
      const client = new auth0.Client({
        client_id: "tWjDhuzPmuIWrI8R9s3yV3BQVw2tW0yq",
        token_endpoint_auth_method: "none",
        id_token_signed_response_alg: "RS256",
      });
      const handle = await client.deviceAuthorization({ scope: "openid email", audience: "https://cloud.hathora.com" });
      await prompts({
        type: "invisible",
        name: "",
        message: `Press any key to open up the browser to login or press ctrl-c to abort. You should see the following code: ${handle.user_code}.`,
      });
      open(handle.verification_uri_complete);
      const tokens = await handle.poll();
      outputFileSync(join(os.homedir(), ".config", "hathora", "token"), tokens.access_token);
    },
  })
  .command({
    command: "deploy",
    describe: "Deploys application to Hathora Cloud",
    builder: { appName: { type: "string", demandOption: true } },
    handler: async (argv) => {
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
      form.submit(
        { host: "cloud.hathora.com", protocol: "https:", path: "/deploy", headers },
        (err, response) => {
          if (err) {
            console.error("Error: ", err);
          } else {
            response.on("data", (data) => console.log(data.toString()));
          }
        }
      );
    },
  })
  .demandCommand()
  .recommendCommands()
  .completion()
  .wrap(72)
  .parse();
