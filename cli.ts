#!/usr/bin/env ts-node

import { createHash } from "crypto";
import { outputFileSync, existsSync, readdirSync, copySync } from "fs-extra";
import { join } from "path";
import { pathToFileURL } from "url";
import shelljs from "shelljs";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
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

function getAppConfig() {
  const appSecret = process.env.APP_SECRET ?? uuidv4();
  const appId = createHash("sha256").update(appSecret).digest("hex");
  const coordinatorHost = process.env.COORDINATOR_HOST ?? "coordinator.hathora.dev";
  return { appId, appSecret, coordinatorHost };
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

function install() {
  npmInstall(join(rootDir, "api"));
  readdirSync(clientDir).forEach((dir) => npmInstall(join(clientDir, dir)));
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
  process.env.DATA_DIR = join(rootDir, "data");
  process.env.NODE_LOADER_CONFIG = join(__dirname, "node-loader.config.mjs");
  const loaderPath = pathToFileURL(require.resolve("@node-loader/core/lib/node-loader-core.js"));
  const storePath = join(serverDir, ".hathora/store.ts");
  const cp = shelljs.exec(`node --loader ${loaderPath} --experimental-specifier-resolution=node ${storePath}`, {
    async: true,
  });
  return new Promise((resolve, reject) => {
    cp.stdout?.on("data", resolve);
    cp.on("error", reject);
  });
}

async function startFrontend(root: string) {
  console.log(`Starting frontend at ${root}`);
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

function build() {
  for (const dir of readdirSync(clientDir)) {
    if (existsSync(join(clientDir, dir, "index.html"))) {
      buildClient({
        root: join(clientDir, dir),
        build: { outDir: join(rootDir, "dist", "client", dir), target: ["esnext"] },
        clearScreen: false,
      });
    }
  }
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

const rootDir = getProjectRoot(process.cwd());
const clientDir = join(rootDir, "client");
const serverDir = join(rootDir, "server");

console.log(`Project root: ${rootDir}`);
const command = getCommand(process.argv);
if (command === "init") {
  if (existsSync(join(serverDir, "impl.ts"))) {
    console.error("Cannot init inside existing project, delete impl.ts to regenerate");
  } else {
    generate(rootDir, "templates/bootstrap");
    generateLocal();
  }
} else if (command === "generate") {
  if (!existsSync(join(serverDir, "impl.ts"))) {
    console.error("Missing impl.ts, make sure to run hathora init first");
  } else {
    generateLocal();
  }
} else if (command === "create-plugin-native") {
  generate(rootDir, "templates/plugin/native", { val: process.argv[3] });
} else if (command === "create-plugin-lit") {
  generate(rootDir, "templates/plugin/lit", { val: process.argv[3] });
} else if (command === "create-plugin-react") {
  generate(rootDir, "templates/plugin/react", { val: process.argv[3] });
} else if (command === "install") {
  install();
} else if (command === "start") {
  startServer().then(startFrontends);
} else if (command === "dev") {
  if (!existsSync(join(serverDir, "impl.ts"))) {
    console.error("Missing impl.ts, make sure to run hathora init first");
  } else {
    generateLocal();
  }
  install();
  startServer().then(startFrontends);
} else if (command === "save") {
  const stateId = process.argv[3];
  const saveName = process.argv[4];
  copySync(join(rootDir, "data", stateId), join(rootDir, "data", "saves", saveName));
} else if (command === "build") {
  if (!existsSync(join(serverDir, "impl.ts"))) {
    console.error("Missing impl.ts, make sure to run hathora init first");
  } else {
    generate(rootDir, "templates/base", getAppConfig());
  }
  install();
  build();
} else {
  console.error(`Unknown command: ${command}`);
}
