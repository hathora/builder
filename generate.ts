#!/usr/bin/env ts-node-script

import { load } from "js-yaml";
import { readdirSync, readFileSync, outputFileSync, existsSync, mkdirSync, statSync } from "fs-extra";
import { compile, registerHelper } from "handlebars";
import path from "path";
import * as z from "zod";

const TypeArgs = z.union([z.string(), z.array(z.string()), z.record(z.string())]);
const RtagConfig = z.object({
  types: z.record(TypeArgs),
  methods: z.record(z.nullable(z.record(z.string()))),
  auth: z.object({
    anonymous: z.optional(z.object({ separator: z.string() })),
    google: z.optional(z.object({ clientId: z.string() })),
  }),
  userState: z.string(),
  initialize: z.string(),
});

type Arg = ObjectArg | ArrayArg | OptionalArg | DisplayPluginArg | EnumArg | StringArg | NumberArg | BooleanArg;
interface ObjectArg {
  type: "object";
  alias: boolean;
  typeString?: string;
  properties: Record<string, Arg>;
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
registerHelper("makeRequestName", (x) => "I" + capitalize(x) + "Request");
registerHelper("makePluginName", (x) => x.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() + "-plugin");

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function main() {
  const doc = RtagConfig.parse(load(readFileSync("types.yml", "utf8")));
  const plugins = existsSync("client/plugins")
    ? readdirSync("client/plugins", "utf8").map((p) => p.replace(/\..*$/, ""))
    : [];

  function getArgsInfo(args: z.infer<typeof TypeArgs>, required: boolean, alias: boolean, typeString?: string): Arg {
    if (Array.isArray(args)) {
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
            getArgsInfo(type, !name.endsWith("?"), false),
          ])
        ),
      };
    } else {
      if (!required) {
        return {
          type: "optional",
          typeString: args + "?",
          alias,
          item: getArgsInfo(args, true, false),
        };
      } else if (args.endsWith("[]")) {
        return {
          type: "array",
          typeString: typeString ?? args,
          alias,
          items: getArgsInfo(args.substring(0, args.length - 2), true, false),
        };
      } else if (args in doc.types) {
        const argsInfo = getArgsInfo(doc.types[args], required, true, args);
        return plugins.includes(args) ? { type: "plugin", typeString: args, alias, item: argsInfo } : argsInfo;
      } else if (args === "string" || args === "number" || args === "boolean") {
        const argsInfo: Arg = { type: args, typeString: typeString ?? args, alias };
        return plugins.includes(args) ? { type: "plugin", typeString: args, alias, item: argsInfo } : argsInfo;
      } else {
        throw new Error("Invalid args: " + args);
      }
    }
  }

  const enrichedDoc = {
    ...doc,
    types: Object.fromEntries(
      Object.entries(doc.types).map(([key, val]) => {
        return [key, getArgsInfo(val, true, false)];
      })
    ),
    methods: Object.fromEntries(
      Object.entries(doc.methods).map(([key, val]) => {
        return [key, getArgsInfo(val === null ? {} : val, true, false)];
      })
    ),
  };
  const rootDir = process.cwd();
  const appEntryPath = existsSync("client/index.html") ? "../../client/index.html" : "../../client/.rtag/index.html";
  const appName = path.basename(rootDir);

  function codegen(inDir: string, outDir: string, outPrefix: string) {
    readdirSync(inDir).forEach((f) => {
      const file = path.join(inDir, f);
      if (statSync(file).isDirectory()) {
        codegen(file, path.join(outDir, f), outPrefix);
      } else {
        const template = compile(readFileSync(file, "utf8"));
        outputFileSync(
          path.join(outDir, outPrefix, f.split(".hbs")[0]),
          template({ ...enrichedDoc, plugins, appEntryPath, appName })
        );
      }
    });
  }

  const rootDirFiles = readdirSync(rootDir).filter((file) => !file.startsWith("."));
  if (rootDirFiles.length === 1 && rootDirFiles[0] === "types.yml") {
    codegen(path.join(__dirname, "templates/lang/ts"), rootDir, ".");
  }
  codegen(path.join(__dirname, "templates/base"), rootDir, ".rtag");
}

main();
