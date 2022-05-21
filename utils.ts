import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
import { createHash } from "crypto";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { outputFileSync } from "fs-extra";
import shelljs from "shelljs";
import { createServer } from "vite";
import chalk from "chalk";
import { generate } from "./generate";
import axios, { Method } from "axios";
import { Stream } from "stream";

export async function makeCloudApiRequest(cloudApiBase: string, path: string, token: string, method: Method = "GET") {
  try {
    const response = await axios({
      method,
      baseURL: cloudApiBase,
      url: path,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "stream",
    });

    response.data.on('data', (d: any) => process.stdout.write(d));
    response.data.on('end', () => process.stdout.write("\n"));
  } catch (err) {
    if (axios.isAxiosError(err)) {
      (err.response?.data as Stream).on("data", (data) => console.error(data.toString()));
    }
    console.error(err);
  }
}

export function getDirs() {
  const rootDir = getProjectRoot(process.cwd());
  return {
    rootDir,
    clientDir: join(rootDir, "client"),
    serverDir: join(rootDir, "server"),
  };
}

export function getAppConfig() {
  const appSecret = process.env.APP_SECRET ?? uuidv4();
  const appId = createHash("sha256").update(appSecret).digest("hex");
  const coordinatorHost = process.env.COORDINATOR_HOST ?? "coordinator.hathora.dev";
  const matchmakerHost = process.env.MATCHMAKER_HOST ?? "matchmaker.hathora.dev";
  return { appId, appSecret, coordinatorHost, matchmakerHost };
}

export function generateLocal() {
  const { rootDir } = getDirs();
  dotenv.config({ path: join(rootDir, ".env") });
  const appConfig = getAppConfig();
  generate(rootDir, "templates/base", appConfig);
  if (!existsSync(join(rootDir, ".env"))) {
    outputFileSync(join(rootDir, ".env"), `APP_SECRET=${appConfig.appSecret}\n`);
  }
}

export function install(only: "server" | "client" | undefined) {
  const { rootDir, serverDir, clientDir } = getDirs();
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

export async function start(only: "server" | "client" | undefined) {
  if (only === "client") {
    return startFrontends();
  } else if (only === "server") {
    return startServer();
  } else {
    return startServer().then(startFrontends);
  }
}

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

function npmInstall(dir: string) {
  console.log(`Installing dependencies in ${dir}`);
  if (existsSync(join(dir, "yarn.lock"))) {
    shelljs.exec(`yarn install --cwd ${dir}`);
  } else if (existsSync(join(dir, "package.json"))) {
    shelljs.cd(dir);
    shelljs.exec("npm install");
  }
}

async function startFrontend(root: string) {
  const { rootDir } = getDirs();
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
  const { clientDir } = getDirs();
  for (const dir of readdirSync(clientDir)) {
    if (existsSync(join(clientDir, dir, "index.html"))) {
      await startFrontend(join(clientDir, dir));
    }
  }
}

async function startServer() {
  const { rootDir, serverDir } = getDirs();
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
