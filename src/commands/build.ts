import { join } from "path";
import { execSync } from "child_process";

import { CommandModule } from "yargs";
import { existsSync, readdirSync } from "fs-extra";
import { build as buildServer } from "esbuild";
import chalk from "chalk";

import { getAppConfig, getDirs, install } from "../utils";
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
    } else {
      generate(rootDir, "base", await getAppConfig());
      install(argv.only as "server" | "client" | undefined);
      build(argv.only as "server" | "client" | undefined);
    }
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
    buildServer({
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
  }
}

module.exports = cmd;
