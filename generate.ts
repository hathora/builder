#!/usr/bin/env ts-node-script

import { load } from "js-yaml";
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { compile, registerHelper } from "handlebars";
import path from "path";
import npm from "npm";

type Arg = ObjectArg | ArrayArg | OptionalArg | DisplayPluginArg | EnumArg | StringArg | NumberArg | BooleanArg;
interface ObjectArg {
  type: "object";
  typeString?: string;
  properties: Record<string, Arg>;
}
interface ArrayArg {
  type: "array";
  typeString?: string;
  items: Arg;
}
interface OptionalArg {
  type: "optional";
  typeString?: string;
  item: Arg;
}
interface DisplayPluginArg {
  type: "plugin";
  typeString?: string;
  item: Arg;
}
interface EnumArg {
  type: "enum";
  typeString?: string;
  options: { label: string; value: number }[];
}
interface StringArg {
  type: "string";
  typeString?: string;
}
interface NumberArg {
  type: "number";
  typeString?: string;
}
interface BooleanArg {
  type: "boolean";
  typeString?: string;
}

registerHelper("eq", (a, b) => a === b);
registerHelper("ne", (a, b) => a !== b);
registerHelper("stringify", JSON.stringify);
registerHelper("isArray", Array.isArray);
registerHelper("isObject", (x) => typeof x === "object");
registerHelper("add", (x, y) => x + y);
registerHelper("snakeCase", (x) =>
  x.replace(/\.?([A-Z]+)/g, (_: string, s: string) => "_" + s.toLowerCase()).replace(/^_/, "")
);
registerHelper("makeRequestName", (x) => "I" + capitalize(x) + "Request");
registerHelper("makePluginName", (x) => x.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() + "-plugin");
registerHelper("join", (params, joinStr, prepend, postpend, options) => {
  let paramsStr;
  if (Array.isArray(params)) {
    paramsStr = params.map((name) => options.fn({ name })).join(joinStr);
  } else {
    paramsStr = Object.entries(params || {})
      .map(([name, type]) => options.fn({ name, type }))
      .join(joinStr);
  }
  return (prepend && paramsStr.length ? joinStr : "") + paramsStr + (postpend && paramsStr.length ? joinStr : "");
});
registerHelper("getArgsInfo", (args) => getArgsInfo(args, true));

function getArgsInfo(args: any, required: boolean, typeString?: string): Arg {
  if (!required) {
    return {
      type: "optional",
      typeString: args + "?",
      item: getArgsInfo(args, true),
    };
  } else if (Array.isArray(args)) {
    return {
      type: "enum",
      typeString,
      options: args.map((label: string, value) => ({ label, value })),
    };
  } else if (typeof args === "object") {
    return {
      type: "object",
      typeString,
      properties: Object.fromEntries(
        Object.entries(args).map(([name, type]) => [sanitize(name), getArgsInfo(type, !name.endsWith("?"))])
      ),
    };
  } else if (typeof args === "string") {
    if (args.endsWith("[]")) {
      return {
        type: "array",
        typeString: args,
        items: getArgsInfo(args.substring(0, args.length - 2), true),
      };
    } else if (args in doc.types) {
      const argsInfo = getArgsInfo(doc.types[args], required, args);
      return plugins.includes(args) ? { type: "plugin", typeString: args, item: argsInfo } : argsInfo;
    } else if (args === "string" || args === "number" || args === "boolean") {
      const argsInfo: Arg = { type: args, typeString: typeString ?? args };
      return plugins.includes(args) ? { type: "plugin", typeString: args, item: argsInfo } : argsInfo;
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

function generate(file: string) {
  const template = compile(readFileSync(path.join(__dirname, "templates", file), "utf8"));
  writeFileSync(path.join(".rtag", file.split(".hbs")[0]), template({ ...doc, plugins, appEntryPath }), "utf8");
}

const doc: any = load(readFileSync("types.yml", "utf8"));
const plugins = existsSync("plugins") ? readdirSync("plugins", "utf8").map((p) => p.replace(/\..*$/, "")) : [];
const appEntryPath = existsSync("index.html") ? "../index.html" : "index.html";

if (!existsSync(".rtag")) {
  mkdirSync(".rtag");
}

readdirSync(path.join(__dirname, "templates"), "utf8").forEach(generate);
process.chdir(".rtag");
npm.load(() => {
  npm.commands.install([], (err, res) => {});
});
