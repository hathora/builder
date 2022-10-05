import { pathToFileURL } from "url";
import { Stream } from "stream";
import { join } from "path";
import { existsSync, readdirSync } from "fs";
import { execSync, spawn } from "child_process";

import yargs from "yargs";
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
        console.error("Error:", axiosError.message);
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
    throw new Error("Doesn't appear to be inside a Hathora project");
  }
  return {
    rootDir,
    clientDir: join(rootDir, "client"),
    serverDir: join(rootDir, "server"),
  };
}

export async function getAppConfig() {
  const coordinatorHost = process.env.COORDINATOR_HOST ?? "coordinator.hathora.dev";
  const res = await axios.post<{ appId: string; appSecret: string }>(`https://${coordinatorHost}/registerApp`);
  return res.data;
}

export async function generateLocal() {
  const { rootDir } = getDirs();

  let appConfig: { appId: string; appSecret: string };
  const parseResult = dotenv.config({ path: join(rootDir, ".env") });
  if (
    parseResult.parsed === undefined ||
    parseResult.parsed.APP_ID === undefined ||
    parseResult.parsed.APP_SECRET === undefined
  ) {
    appConfig = await getAppConfig();
    outputFileSync(join(rootDir, ".env"), `APP_ID=${appConfig.appId}\nAPP_SECRET=${appConfig.appSecret}\n`);
  } else {
    appConfig = { appId: parseResult.parsed.APP_ID, appSecret: parseResult.parsed.APP_SECRET };
  }

  try {
    generate(rootDir, "base", appConfig);
  } catch (e) {
    console.error("Generate error:", e);
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

function startFrontend(clientRoot: string) {
  console.log(`Starting frontend at ${chalk.blue.underline.bold(clientRoot)}`);
  spawn("npm start", { cwd: clientRoot, stdio: "inherit", shell: true });
}

async function startFrontends() {
  const { clientDir } = getDirs();
  for (const dir of readdirSync(clientDir)) {
    if (existsSync(join(clientDir, dir, "package.json"))) {
      const pkg = await import(join(clientDir, dir, "package.json"));
      if (pkg.scripts?.start !== undefined) {
        startFrontend(join(clientDir, dir));
      }
    }
  }
}

async function startServer() {
  const { rootDir, serverDir } = getDirs();
  shelljs.cd(join(serverDir, ".hathora"));
  process.env.DATA_DIR = join(rootDir, "data");
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
