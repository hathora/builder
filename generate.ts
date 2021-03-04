#!/usr/bin/env ts-node-script

import { load } from "js-yaml";
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { compile, registerHelper } from "handlebars";
import path from "path";

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
registerHelper("getArgsInfo", (args) => getArgsInfo(args, true, false));

function getArgsInfo(args: any, required: boolean, alias: boolean, typeString?: string): Arg {
  if (!required) {
    return {
      type: "optional",
      typeString: args + "?",
      alias,
      item: getArgsInfo(args, true, false),
    };
  } else if (Array.isArray(args)) {
    return {
      type: "enum",
      typeString,
      alias,
      options: args.map((label: string, value) => ({ label, value })),
    };
  } else if (typeof args === "object") {
    return {
      type: "object",
      typeString,
      alias,
      properties: Object.fromEntries(
        Object.entries(args).map(([name, type]) => [sanitize(name), getArgsInfo(type, !name.endsWith("?"), false)])
      ),
    };
  } else if (typeof args === "string") {
    if (args.endsWith("[]")) {
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
    }
  }
  throw new Error("Invalid args: " + args);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function sanitize(s: string) {
  return s.replace(/[\W]+/g, "");
}

function generate(file: string, outDir: string) {
  const template = compile(readFileSync(file, "utf8"));
  writeFileSync(
    path.join(outDir, path.basename(file).split(".hbs")[0]),
    template({ ...doc, plugins, appEntryPath, appName }),
    "utf8"
  );
}

const doc: any = load(readFileSync("types.yml", "utf8"));
const plugins = existsSync("client/plugins")
  ? readdirSync("client/plugins", "utf8").map((p) => p.replace(/\..*$/, ""))
  : [];
const appEntryPath = existsSync("client/index.html") ? "../../client/index.html" : "../../client/.rtag/index.html";
const appName = path.basename(process.cwd());

if (readdirSync(process.cwd()).length === 1) {
  mkdirSync("client");
  mkdirSync("server");
  readdirSync(path.join(__dirname, "templates/lang/ts/client"), "utf8").forEach((file) =>
    generate(path.join(__dirname, "templates/lang/ts/client", file), "client")
  );
  readdirSync(path.join(__dirname, "templates/lang/ts/server"), "utf8").forEach((file) =>
    generate(path.join(__dirname, "templates/lang/ts/server", file), "server")
  );
}
if (!existsSync("client/.rtag")) {
  mkdirSync("client/.rtag");
}
if (!existsSync("server/.rtag")) {
  mkdirSync("server/.rtag");
}
readdirSync(path.join(__dirname, "templates/base/client"), "utf8").forEach((file) =>
  generate(path.join(__dirname, "templates/base/client", file), "client/.rtag")
);
readdirSync(path.join(__dirname, "templates/base/server"), "utf8").forEach((file) =>
  generate(path.join(__dirname, "templates/base/server", file), "server/.rtag")
);
