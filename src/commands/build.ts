import { join } from "path";
import fs from "node:fs/promises";
import { execSync } from "child_process";

import { CommandModule } from "yargs";
import { existsSync, readdirSync } from "fs-extra";
import { build as buildServer } from "esbuild";
import dotenv from "dotenv";
import chalk from "chalk";

import { getDirs, install } from "../utils";
import { generate } from "../generate";

const cmd: CommandModule = {
  command: "build",
  aliases: ["b"],
  describe: "Builds the project",
  builder: { only: { choices: ["client", "server"] } },
  async handler(argv) {
    const { rootDir, serverDir } = getDirs();
    if (!existsSync(join(serverDir, "impl.ts"))) {
      console.error(
        `${chalk.red("Missing impl.ts, make sure to run")}` +
          `${chalk.blue.bold(" hathora init ")}` +
          `${chalk.red("first")}`
      );
      return;
    }

    dotenv.config({ path: join(rootDir, ".env") });

    if (process.env.HATHORA_APP_ID === undefined && argv.only !== "server") {
      throw Error(
        "HATHORA_APP_ID is undefined. Please sign up at https://console.hathora.dev and put it in a .env file."
      );
    }
    const appConfig = { appId: process.env.HATHORA_APP_ID ?? "" };

    generate(rootDir, "base", appConfig);
    install(argv.only as "server" | "client" | undefined);
    build(argv.only as "server" | "client" | undefined);
  },
};

async function build(only: "server" | "client" | undefined) {
  const { clientDir, serverDir } = getDirs();
  if (only === "client" || only === undefined) {
    for (const dir of readdirSync(clientDir)) {
      if (existsSync(join(clientDir, dir, "package.json"))) {
        const pkg = await import(join(clientDir, dir, "package.json"));
        if (pkg.scripts?.start !== undefined) {
          execSync("npm run build", { cwd: join(clientDir, dir), stdio: "inherit" });
        }
      }
    }
  }
  if (only === "server" || only === undefined) {
    await buildServer({
      entryPoints: [join(serverDir, ".hathora", "store.ts")],
      bundle: true,
      platform: "node",
      format: "esm",
      outfile: join(serverDir, "dist", "index.mjs"),
      banner: {
        // eslint-disable-next-line max-len
        js: "import { createRequire as topLevelCreateRequire } from 'module';\n const require = topLevelCreateRequire(import.meta.url);",
      },
    });
    await copyUWebsocketBinaries(serverDir);
  }
}

async function copyUWebsocketBinaries(serverDir: string) {
  const uWebDir = join(serverDir, ".hathora/node_modules/uWebSockets.js/");
  const files = await fs.readdir(uWebDir);
  const binaries = files.filter((file) => file.endsWith(".node"));
  const dist = join(serverDir, "dist");
  await Promise.all(
    binaries.map((bin) => {
      const source = join(uWebDir, bin);
      const destination = join(dist, bin);
      return fs.copyFile(source, destination);
    })
  );
}

module.exports = cmd;
