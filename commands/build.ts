import { join } from "path";
import chalk from "chalk";
import { existsSync, readdirSync } from "fs-extra";
import { build as buildClient } from "vite";
import { build as buildServer } from "esbuild";
import { CommandModule } from "yargs";
import { generate } from "../generate";
import { getAppConfig, getDirs, install } from "../utils";

const cmd: CommandModule = {
  command: "build",
  aliases: ["b"],
  describe: "Builds the project",
  builder: { only: { choices: ["client", "server"] } },
  handler: (argv) => {
    const { rootDir, serverDir } = getDirs();
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
};

function build(only: "server" | "client" | undefined) {
  const { clientDir, rootDir, serverDir } = getDirs();
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

module.exports = cmd;
