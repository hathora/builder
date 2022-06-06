import { pathToFileURL } from "url";
import { Stream } from "stream";
import { join } from "path";
import { existsSync, readdirSync } from "fs";
import { createHash } from "crypto";
import { execSync } from "child_process";

import yargs from "yargs";
import { createServer } from "vite";
import { v4 as uuidv4 } from "uuid";
import shelljs from "shelljs";
import { outputFileSync } from "fs-extra";
import FormData from "form-data";
import dotenv from "dotenv";
import chalk from "chalk";
import axios, { Method } from "axios";

import { generate } from "./generate";

export async function makeCloudApiRequest(
  cloudApiBase: string,
  path: string,
  token: string,
  method: Method = "GET",
  form?: FormData
) {
  try {
    const response = await axios.request<Stream>({
      method,
      baseURL: cloudApiBase,
      url: path,
      headers: { Authorization: `Bearer ${token}` },
      responseType: "stream",
      data: form,
    });
    response.data.pipe(process.stdout);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosError = err;
      if (axiosError.response === undefined) {
        yargs.exit(1, err);
        return;
      }

      const dataStream = axiosError.response.data as Stream;
      dataStream.pipe(process.stderr);
      dataStream.on("end", () => yargs.exit(1, axiosError));
    } else {
      console.error(err);
      yargs.exit(1, err as Error);
    }
  }
}

export function getDirs() {
  const rootDir = findUp("hathora.yml");
  if (rootDir === undefined) {
    throw new Error("Doesn't appear to be inside a hathora project");
  }
  return {
    rootDir,
    clientDir: join(rootDir, "client"),
    serverDir: join(rootDir, "server"),
  };
}

export function getAppConfig() {
  const appSecret = process.env.APP_SECRET ?? uuidv4();
  const appId = createHash("sha256").update(appSecret).digest("hex");
  return { appId, appSecret };
}

export function generateLocal() {
  const { rootDir } = getDirs();
  dotenv.config({ path: join(rootDir, ".env") });
  const appConfig = getAppConfig();
  generate(rootDir, "base", appConfig);
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

function findUp(file: string, dir: string = process.cwd()): string | undefined {
  if (existsSync(join(dir, file))) {
    return dir;
  }
  const parentDir = join(dir, "..");
  if (parentDir === dir) {
    return undefined;
  }
  return findUp(file, parentDir);
}

function npmInstall(dir: string) {
  console.log(`Installing dependencies in ${dir}`);
  if (existsSync(join(dir, "yarn.lock"))) {
    console.log(execSync("yarn install", { cwd: dir, encoding: "utf-8" }));
  } else if (existsSync(join(dir, "package.json"))) {
    console.log(execSync("npm install", { cwd: dir, encoding: "utf-8" }));
  } else {
    console.error("npm or yarn not found.");
  }
}

async function startFrontend(clientRoot: string) {
  console.log(`Starting frontend at ${chalk.blue.underline.bold(clientRoot)}`);
  return createServer({
    root: clientRoot,
    build: { target: ["esnext"] },
    define: {
      "process.env": { COORDINATOR_HOST: process.env.COORDINATOR_HOST, MATCHMAKER_HOST: process.env.MATCHMAKER_HOST },
    },
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
  process.env.STORE_REGION = "local";
  process.env.NODE_LOADER_CONFIG = join(__dirname, "..", "node-loader.config.mjs");
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
