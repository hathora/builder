import { safeLoad } from "js-yaml";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { compile, registerHelper } from "handlebars";

registerHelper("ne", (a, b) => a !== b);
registerHelper("eq", (a, b) => a === b);
registerHelper("isArray", Array.isArray);
registerHelper("isObject", x => typeof x === "object");
registerHelper("join", (params, joinStr, prepend, postpend, options) => {
  if (Array.isArray(params)) {
    const paramsStr = params.map(name => options.fn({ name })).join(joinStr);
    return (prepend && paramsStr.length ? joinStr : "") + paramsStr;
  } else {
    const paramsStr = Object.entries(params || {})
      .map(([name, type]) => options.fn({ name, type }))
      .join(joinStr);
    return (
      (prepend && paramsStr.length ? joinStr : "") +
      paramsStr +
      (postpend && paramsStr.length ? joinStr : "")
    );
  }
});
registerHelper("getArgsInfo", (args: { [name: string]: string }) => {
  return Object.entries(args).map(([name, type]) => getType(name, type));
});

function getType(name: string, type: string | string[] | { [name: string]: string }): any {
  if (typeof type === "string") {
    if (type.endsWith("[]")) {
      return { name, type: "array", args: getType("", type.substring(0, type.length - 2)) };
    }
    if (type === "string" || type === "number" || type === "boolean") {
      return { name, type };
    } else {
      return getType(name, doc.types[type]);
    }
  } else if (Array.isArray(type)) {
    return { name, type: "enum", values: type };
  } else {
    return {
      name,
      type: "object",
      args: Object.entries(([name, value]: any) => getType(name, value)),
    };
  }
}

function generate(filename: string) {
  const template = compile(readFileSync(filename + ".hbs", "utf8"));
  writeFileSync("src/generated/" + filename, template(doc), "utf8");
}

const doc = safeLoad(readFileSync("src/types.yml", "utf8"));
console.log(doc.types);

if (!existsSync("src/generated")) {
  mkdirSync("src/generated");
}

generate("types.ts");
generate("client.ts");
generate("server.ts");
generate("app.ts");
generate("styles.css");
generate("index.html");
