#!/usr/bin/env node

import { createHash } from "crypto";
import { load } from "js-yaml";
import { readdirSync, readFileSync, outputFileSync, existsSync, statSync } from "fs-extra";
import { compile, registerHelper } from "handlebars";
import { join, basename } from "path";
import shelljs from "shelljs";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { createServer, build } from "vite";
// @ts-ignore
import ncc from "@vercel/ncc";

const TypeArgs = z.union([z.string(), z.array(z.string()), z.record(z.string())]);
const RtagConfig = z
  .object({
    types: z.record(TypeArgs),
    methods: z.record(z.nullable(z.record(z.string()))),
    auth: z
      .object({
        anonymous: z.optional(z.object({ separator: z.string() }).strict()),
        google: z.optional(z.object({ clientId: z.string() }).strict()),
      })
      .strict(),
    userState: z.string(),
    initialize: z.string(),
    error: z.string(),
    tick: z.optional(z.boolean()),
  })
  .strict();

type Arg =
  | ObjectArg
  | ArrayArg
  | OptionalArg
  | DisplayPluginArg
  | EnumArg
  | UnionArg
  | StringArg
  | NumberArg
  | BooleanArg;
interface ObjectArg {
  type: "object";
  alias: boolean;
  typeString?: string;
  properties: Record<string, Arg>;
}
interface UnionArg {
  type: "union";
  alias: boolean;
  typeString?: string;
  options: Record<string, Arg>;
}
interface ArrayArg {
  type: "array";
  alias: boolean;
  typeString?: string;
  items: Arg;
}
interface OptionalArg {
  type: "optional";
  alias: boolean;
  typeString?: string;
  item: Arg;
}
interface DisplayPluginArg {
  type: "plugin";
  alias: boolean;
  typeString?: string;
  item: Arg;
}
interface EnumArg {
  type: "enum";
  alias: boolean;
  typeString?: string;
  options: { label: string; value: number }[];
}
interface StringArg {
  type: "string";
  alias: boolean;
  typeString?: string;
}
interface NumberArg {
  type: "number";
  alias: boolean;
  typeString?: string;
}
interface BooleanArg {
  type: "boolean";
  alias: boolean;
  typeString?: string;
}

registerHelper("eq", (a, b) => a === b);
registerHelper("ne", (a, b) => a !== b);
registerHelper("stringify", JSON.stringify);
registerHelper("isArray", Array.isArray);
registerHelper("isObject", (x) => typeof x === "object");
registerHelper("capitalize", capitalize);
registerHelper("uppercase", (x) =>
  x
    .split(/(?=[A-Z])/)
    .join("_")
    .toUpperCase()
);
registerHelper("makeRequestName", (x) => "I" + capitalize(x) + "Request");
registerHelper("makePluginName", (x) => x.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() + "-plugin");
registerHelper("env", (key) => process.env[key]);
registerHelper("uuid", () => uuidv4());
registerHelper("sha256", (x) => createHash("sha256").update(x).digest("hex"));

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getProjectRoot(cwd: string): string {
  if (existsSync(join(cwd, "rtag.yml"))) {
    return cwd;
  }
  const parentDir = join(cwd, "..");
  if (parentDir === cwd) {
    throw new Error("Doesn't appear to be inside an rtag project");
  }
  return getProjectRoot(parentDir);
}

function getCommand(argv: string[]) {
  return argv.length <= 2 ? "generate" : argv[2];
}

function npmInstall(dir: string) {
  if (existsSync(dir)) {
    console.log(`Installing dependencies in ${dir}`);
    if (existsSync(join(dir, "yarn.lock"))) {
      shelljs.exec(`yarn install --cwd ${dir}`);
    } else {
      shelljs.cd(dir);
      shelljs.exec("npm install");
    }
  }
}

function getArgsInfo(
  doc: z.infer<typeof RtagConfig>,
  plugins: string[],
  args: z.infer<typeof TypeArgs>,
  required: boolean,
  alias: boolean,
  typeString?: string
): Arg {
  if (Array.isArray(args)) {
    if (args.every((arg) => arg in doc.types)) {
      return {
        type: "union",
        typeString,
        alias,
        options: Object.fromEntries(args.map((type) => [type, getArgsInfo(doc, plugins, type, true, false)])),
      };
    }
    return {
      type: "enum",
      typeString,
      alias,
      options: args.map((label, value) => ({ label, value })),
    };
  } else if (typeof args === "object") {
    return {
      type: "object",
      typeString,
      alias,
      properties: Object.fromEntries(
        Object.entries(args).map(([name, type]) => [
          name.replace(/[\W]+/g, ""),
          getArgsInfo(doc, plugins, type, !name.endsWith("?"), false),
        ])
      ),
    };
  } else {
    if (!required) {
      return {
        type: "optional",
        typeString: args + "?",
        alias,
        item: getArgsInfo(doc, plugins, args, true, false),
      };
    } else if (args.endsWith("[]")) {
      return {
        type: "array",
        typeString: typeString ?? args,
        alias,
        items: getArgsInfo(doc, plugins, args.substring(0, args.length - 2), true, false),
      };
    } else if (args in doc.types) {
      const argsInfo = getArgsInfo(doc, plugins, doc.types[args], required, true, args);
      return plugins.includes(args) ? { type: "plugin", typeString: args, alias, item: argsInfo } : argsInfo;
    } else if (args === "string" || args === "number" || args === "boolean") {
      const argsInfo: Arg = { type: args, typeString: typeString ?? args, alias };
      return plugins.includes(args) ? { type: "plugin", typeString: args, alias, item: argsInfo } : argsInfo;
    } else {
      throw new Error("Invalid args: " + args);
    }
  }
}

function enrichDoc(doc: z.infer<typeof RtagConfig>, plugins: string[], appName: string) {
  return {
    ...doc,
    types: Object.fromEntries(
      Object.entries(doc.types).map(([key, val]) => {
        return [key, getArgsInfo(doc, plugins, val, true, false)];
      })
    ),
    methods: Object.fromEntries(
      Object.entries(doc.methods).map(([key, val]) => {
        return [key, getArgsInfo(doc, plugins, val === null ? {} : val, true, false)];
      })
    ),
    error: getArgsInfo(doc, plugins, doc.error, true, false),
    plugins,
    appName,
  };
}

function generate(templatesDir: string) {
  const doc = RtagConfig.parse(load(readFileSync(join(rootDir, "rtag.yml"), "utf8")));
  if (!Object.keys(doc.types).includes(doc.userState)) {
    throw new Error("Invalid userState");
  }
  if (!Object.keys(doc.methods).includes(doc.initialize)) {
    throw new Error("Invalid initialize");
  }

  const plugins = existsSync(join(clientDir, "plugins"))
    ? readdirSync(join(clientDir, "plugins")).map((p) => p.replace(/\..*$/, ""))
    : [];
  const appName = basename(rootDir);
  const enrichedDoc = enrichDoc(doc, plugins, appName);

  function codegen(inDir: string, outDir: string) {
    readdirSync(inDir).forEach((f) => {
      const file = join(inDir, f);
      if (statSync(file).isDirectory()) {
        codegen(file, join(outDir, f));
      } else {
        const template = compile(readFileSync(file, "utf8"));
        outputFileSync(join(outDir, f.split(".hbs")[0]), template(enrichedDoc));
      }
    });
  }
  codegen(join(__dirname, templatesDir), rootDir);
}

const rootDir = getProjectRoot(process.cwd());
const clientDir = join(rootDir, "client");
const serverDir = join(rootDir, "server");
const appEntryPath = existsSync(join(clientDir, "index.html")) ? clientDir : join(clientDir, ".rtag");

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
    generate("templates/lang/ts");
  }
} else if (command === "generate") {
  if (!existsSync(join(serverDir, "impl.ts"))) {
    console.error("Missing impl.ts, make sure to run rtag init first");
  } else {
    generate("templates/base");
  }
} else if (command === "install") {
  npmInstall(clientDir);
  npmInstall(join(clientDir, ".rtag"));
  npmInstall(serverDir);
  npmInstall(join(serverDir, ".rtag"));
} else if (command === "start") {
  createServer({
    root: appEntryPath,
    envDir: rootDir,
    clearScreen: false,
    resolve: {
      alias: { vue: "vue/dist/vue.esm.js" },
    },
  }).then((server) => server.listen());
  shelljs.cd(join(serverDir, ".rtag"));
  process.env.NODE_LOADER_CONFIG = join(__dirname, "node-loader.config.mjs");
  const loaderPath = join(__dirname, "node_modules/@node-loader/core/lib/node-loader-core.js");
  shelljs.exec(`node --loader ${loaderPath} --experimental-specifier-resolution=node store.ts`, { async: true });
} else if (command === "build") {
  process.env.VITE_APP_ID = appId;
  build({
    root: appEntryPath,
    build: {
      outDir: join(rootDir, "dist/client"),
    },
    resolve: {
      alias: { vue: "vue/dist/vue.esm.js" },
    },
  });
  ncc(join(serverDir, ".rtag/store.ts")).then(
    ({ code, assets }: { code: string; assets: Record<string, { source: string | Buffer }> }) => {
      const outDir = join(rootDir, "dist/server");
      outputFileSync(join(outDir, "index.js"), code);
      Object.entries(assets).forEach(([filename, { source }]) => {
        outputFileSync(join(outDir, filename), source);
      });
      outputFileSync(join(outDir, ".env"), `APP_SECRET=${appSecret}\n`);
    }
  );
} else {
  console.error(`Unknown command: ${command}`);
}
