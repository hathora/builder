#!/usr/bin/env node

import { createHash } from "crypto";
import { outputFileSync, existsSync, readdirSync } from "fs-extra";
import { join } from "path";
import shelljs from "shelljs";
import { v4 as uuidv4 } from "uuid";
import { createServer, build as buildClient } from "vite";
import { build as buildServer } from "esbuild";
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

function getCommand(argv: string[]) {
  return argv.length <= 2 ? "generate" : argv[2];
}

function npmInstall(dir: string) {
  console.log(`Installing dependencies in ${dir}`);
  if (existsSync(join(dir, "yarn.lock"))) {
    shelljs.exec(`yarn install --cwd ${dir}`);
  } else {
    shelljs.cd(dir);
    shelljs.exec("npm install");
  }
}

function install() {
  npmInstall(join(rootDir, "api"));
  npmInstall(join(clientDir, ".hathora"));
  npmInstall(join(clientDir, "prototype-ui"));
  if (existsSync(join(clientDir, "prototype-ui", "plugins"))) {
    readdirSync(join(clientDir, "prototype-ui", "plugins")).forEach((dir) =>
      npmInstall(join(clientDir, "prototype-ui", "plugins", dir))
    );
  }
  npmInstall(serverDir);
  npmInstall(join(serverDir, ".hathora"));
}

async function startServer() {
  shelljs.cd(join(serverDir, ".hathora"));
  process.env.DATA_DIR = join(serverDir, ".hathora/data");
  process.env.DOTENV_CONFIG_PATH = join(rootDir, ".env");
  process.env.NODE_LOADER_CONFIG = join(__dirname, "node-loader.config.mjs");
  const loaderPath = require.resolve("@node-loader/core/lib/node-loader-core.js");
  const storePath = join(serverDir, ".hathora/store.ts");
  const cp = shelljs.exec(`node --loader ${loaderPath} --experimental-specifier-resolution=node ${storePath}`, {
    async: true,
  });
  return new Promise((resolve, reject) => {
    cp.stdout?.on("data", resolve);
    cp.on("error", reject);
  });
}

async function startFrontend(root: string, port: number) {
  return createServer({
    root,
    publicDir: join(clientDir, "public"),
    build: { target: ["esnext"] },
    envDir: rootDir,
    clearScreen: false,
    server: { host: "0.0.0.0", port },
  })
    .then((server) => server.listen())
    .then((server) => server.printUrls());
}

async function startFrontends() {
  startFrontend(join(clientDir, "prototype-ui"), 3000);
  if (existsSync(join(clientDir, "index.html"))) {
    startFrontend(clientDir, 4000);
  }
}

const rootDir = getProjectRoot(process.cwd());
const clientDir = join(rootDir, "client");
const serverDir = join(rootDir, "server");

const appSecret = process.env.APP_SECRET ?? uuidv4();
const appId = createHash("sha256").update(appSecret).digest("hex");
if (!existsSync(join(rootDir, ".env"))) {
  outputFileSync(join(rootDir, ".env"), `APP_SECRET=${appSecret}\nVITE_APP_ID=${appId}\n`);
}

console.log(`Project root: ${rootDir}`);
const command = getCommand(process.argv);
if (command === "init") {
  if (existsSync(join(serverDir, "impl.ts"))) {
    console.error("Cannot init inside existing project, delete impl.ts to regenerate");
  } else {
    generate(rootDir, "templates/lang/ts");
    generate(rootDir, "templates/base");
  }
} else if (command === "generate") {
  if (!existsSync(join(serverDir, "impl.ts"))) {
    console.error("Missing impl.ts, make sure to run hathora init first");
  } else {
    generate(rootDir, "templates/base");
  }
} else if (command === "install") {
  install();
} else if (command === "start") {
  startServer().then(() => startFrontends());
} else if (command === "dev") {
  if (!existsSync(join(serverDir, "impl.ts"))) {
    console.error("Missing impl.ts, make sure to run hathora init first");
  } else {
    generate(rootDir, "templates/base");
  }
  install();
  startServer().then(() => startFrontends());
} else if (command === "build") {
  process.env.VITE_APP_ID = appId;
  buildClient({
    root: existsSync(join(clientDir, "index.html")) ? clientDir : join(clientDir, ".hathora", "prototype-ui"),
    publicDir: join(clientDir, "public"),
    build: { outDir: join(rootDir, "dist", "client"), target: ["esnext"] },
  });
  const outDir = join(rootDir, "dist", "server");
  outputFileSync(join(outDir, ".env"), `APP_SECRET=${appSecret}\n`);
  buildServer({
    entryPoints: [join(serverDir, ".hathora", "store.ts")],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: join(outDir, "index.mjs"),
    banner: {
      js: "import { createRequire as topLevelCreateRequire } from 'module';\n const require = topLevelCreateRequire(import.meta.url);",
    },
  });
} else {
  console.error(`Unknown command: ${command}`);
}
