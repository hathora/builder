#!/usr/bin/env ts-node-script

import { safeLoad } from "js-yaml";
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, promises } from "fs";
import { compile, registerHelper } from "handlebars";
import path from "path";
import npm from "npm";

type Arg = ObjectArg | ArrayArg | EnumArg | StringArg | NumberArg | BooleanArg | DisplayPluginArg;
interface ObjectArg {
  type: "object";
  required: boolean;
  properties: Record<string, Arg>;
}
interface ArrayArg {
  type: "array";
  required: boolean;
  items: Arg;
}
interface EnumArg {
  type: "enum";
  required: boolean;
  options: { label: string; value: number }[];
}
interface StringArg {
  type: "string";
  required: boolean;
}
interface NumberArg {
  type: "number";
  required: boolean;
}
interface BooleanArg {
  type: "boolean";
  required: boolean;
}
interface DisplayPluginArg {
  type: "display-plugin";
  required: boolean;
  componentId: string;
}

registerHelper("eq", (a, b) => a === b);
registerHelper("ne", (a, b) => a !== b);
registerHelper("stringify", JSON.stringify);
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

function getArgsInfo(args: any, required: boolean): Arg {
  if (Array.isArray(args)) {
    return {
      type: "enum",
      required,
      options: args.map((label: string, value) => ({ label, value })),
    };
  } else if (typeof args === "object") {
    return {
      type: "object",
      required,
      properties: Object.fromEntries(
        Object.entries(args).map(([name, type]) => [sanitize(name), getArgsInfo(type, !name.endsWith("?"))]),
      ),
    };
  } else if (typeof args === "string") {
    if (plugins.includes(getPluginName(args).concat(".ts"))) {
      return { type: "display-plugin", required, componentId: getPluginName(args) };
    } else if (args.endsWith("[]")) {
      return { type: "array", required, items: getArgsInfo(args.substring(0, args.length - 2), required) };
    } else if (args in doc.types) {
      return getArgsInfo(doc.types[args], required);
    } else if (args === "string" || args === "number" || args === "boolean") {
      return { type: args, required };
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

function getPluginName(s: string) {
  return s.replace(/\[\]$/, "s");
}

function generate(file: string) {
  const template = compile(readFileSync(path.join(__dirname, "templates", file), "utf8"));
  writeFileSync(path.join(".lsot", file.split(".hbs")[0]), template({ ...doc, plugins }), "utf8");
}

const doc = safeLoad(readFileSync("types.yml", "utf8"));
const plugins = readdirSync("plugins", "utf8");

if (!existsSync(".lsot")) {
  mkdirSync(".lsot");
}

promises
  .readdir(path.join(__dirname, "templates"))
  .then((files) => files.forEach(generate))
  .then(() => {
    process.chdir(".lsot");
    npm.load(() => {
      npm.commands.install([], (err, res) => {});
    });
  });
