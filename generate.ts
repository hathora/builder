#!/usr/bin/env ts-node-script

import { safeLoad } from "js-yaml";
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { compile, registerHelper } from "handlebars";
import path from "path";
import npm from "npm";

type Arg = ObjectArg | ArrayArg | EnumArg | StringArg | NumberArg | BooleanArg | DisplayPluginArg;
interface ObjectArg {
  type: "object";
  required: boolean;
  typeString?: string;
  properties: Record<string, Arg>;
}
interface ArrayArg {
  type: "array";
  required: boolean;
  typeString?: string;
  items: Arg;
}
interface EnumArg {
  type: "enum";
  required: boolean;
  typeString?: string;
  options: { label: string; value: number }[];
}
interface StringArg {
  type: "string";
  required: boolean;
  typeString?: string;
}
interface NumberArg {
  type: "number";
  required: boolean;
  typeString?: string;
}
interface BooleanArg {
  type: "boolean";
  required: boolean;
  typeString?: string;
}
interface DisplayPluginArg {
  type: "display-plugin";
  required: boolean;
  componentId: string;
  typeString?: string;
}

registerHelper("eq", (a, b) => a === b);
registerHelper("ne", (a, b) => a !== b);
registerHelper("stringify", JSON.stringify);
registerHelper("kebabCase", (x) => x.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase());
registerHelper("isArray", Array.isArray);
registerHelper("isObject", (x) => typeof x === "object");
registerHelper("makeRequestName", (x) => "I" + capitalize(x) + "Request");
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
  if (Array.isArray(args)) {
    return {
      type: "enum",
      required,
      typeString,
      options: args.map((label: string, value) => ({ label, value })),
    };
  } else if (typeof args === "object") {
    return {
      type: "object",
      required,
      typeString,
      properties: Object.fromEntries(
        Object.entries(args).map(([name, type]) => [sanitize(name), getArgsInfo(type, !name.endsWith("?"))])
      ),
    };
  } else if (typeof args === "string") {
    if (plugins.includes(args)) {
      return { type: "display-plugin", required, typeString: args, componentId: args };
    } else if (args.endsWith("[]")) {
      return {
        type: "array",
        required,
        typeString: args,
        items: getArgsInfo(args.substring(0, args.length - 2), true),
      };
    } else if (args in doc.types) {
      return getArgsInfo(doc.types[args], required, args);
    } else if (args === "string" || args === "number" || args === "boolean") {
      return { type: args, required, typeString: typeString ?? args };
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
  writeFileSync(path.join(".rtag", file.split(".hbs")[0]), template({ ...doc, plugins }), "utf8");
}

const doc: any = safeLoad(readFileSync("types.yml", "utf8"));
const plugins = existsSync("plugins") ? readdirSync("plugins", "utf8").map((p) => p.replace(/\..*$/, "")) : [];

if (!existsSync(".rtag")) {
  mkdirSync(".rtag");
}

readdirSync(path.join(__dirname, "templates"), "utf8").forEach(generate);
process.chdir(".rtag");
npm.load(() => {
  npm.commands.install([], (err, res) => {});
});
