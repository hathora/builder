import { safeLoad } from "js-yaml";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { compile, registerHelper } from "handlebars";

registerHelper("eq", (a, b) => a === b);
registerHelper("ne", (a, b) => a !== b);
registerHelper("isArray", Array.isArray);
registerHelper("isObject", (x) => typeof x === "object");
registerHelper("join", (params, joinStr, prepend, postpend, options) => {
  if (Array.isArray(params)) {
    const paramsStr = params.map((name) => options.fn({ name })).join(joinStr);
    return (prepend && paramsStr.length ? joinStr : "") + paramsStr;
  } else {
    const paramsStr = Object.entries(params || {})
      .map(([name, type]) => options.fn({ name, type }))
      .join(joinStr);
    return (prepend && paramsStr.length ? joinStr : "") + paramsStr + (postpend && paramsStr.length ? joinStr : "");
  }
});
registerHelper("getArgsInfo", (args: { [name: string]: string }) => {
  return Object.entries(args).map(([name, type]) => {
    if (type.endsWith("[]")) {
      return { ...resolveType(type.substring(0, type.length - 2)), name, base: "array" };
    } else {
      return { ...resolveType(type), name, base: "primitive" };
    }
  });
});

function resolveType(type: string): { type: string; values?: string[] } {
  if (type === "string" || type === "number" || type === "boolean") {
    return { type };
  }
  const resolvedType = doc.types[type];
  if (Array.isArray(resolvedType)) {
    return { type: "enum", values: resolvedType };
  } else {
    return { type: resolvedType };
  }
}

function generate(filename: string) {
  const template = compile(readFileSync(filename + ".hbs", "utf8"));
  writeFileSync("src/generated/" + filename, template(doc), "utf8");
}

const doc = safeLoad(readFileSync("src/types.yml", "utf8"));

if (!existsSync("src/generated")) {
  mkdirSync("src/generated");
}

generate("types.ts");
generate("client.ts");
generate("server.ts");
generate("app.ts");
generate("styles.css");
generate("index.html");
