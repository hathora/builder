import { safeLoad } from "js-yaml";
import { readFileSync, writeFileSync, existsSync, mkdirSync, promises } from "fs";
import { compile, registerHelper } from "handlebars";

type Arg = ObjectArg | ArrayArg | EnumArg | StringArg | NumberArg | BooleanArg;
interface ObjectArg {
  type: "object";
  properties: Record<string, Arg>;
}
interface ArrayArg {
  type: "array";
  items: Arg;
}
interface EnumArg {
  type: "enum";
  options: { label: string; value: number }[];
}
interface StringArg {
  type: "string";
}
interface NumberArg {
  type: "number";
}
interface BooleanArg {
  type: "boolean";
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
registerHelper("getArgsInfo", getArgsInfo);

function getArgsInfo(args: any): Arg {
  if (Array.isArray(args)) {
    return {
      type: "enum",
      options: args.map((label: string, value) => ({ label, value })),
    };
  } else if (typeof args === "object") {
    return {
      type: "object",
      properties: Object.fromEntries(Object.entries(args).map(([name, type]) => [name, getArgsInfo(type)])),
    };
  } else if (typeof args === "string") {
    if (args.endsWith("[]")) {
      return { type: "array", items: getArgsInfo(args.substring(0, args.length - 2)) };
    } else if (args in doc.types) {
      return getArgsInfo(doc.types[args]);
    } else if (args === "string" || args === "number" || args === "boolean") {
      return { type: args };
    }
  }
  throw new Error("Invalid args: " + args);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generate(filename: string) {
  const template = compile(readFileSync("templates/" + filename, "utf8"));
  writeFileSync("src/generated/" + filename.substring(0, filename.indexOf(".hbs")), template(doc), "utf8");
}

const doc = safeLoad(readFileSync("src/types.yml", "utf8"));

if (!existsSync("src/generated")) {
  mkdirSync("src/generated");
}

promises.readdir("templates").then((files) => files.forEach(generate));
