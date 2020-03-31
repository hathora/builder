import { safeLoad } from "js-yaml";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { compile, registerHelper } from "handlebars";

registerHelper("ne", (a, b) => a !== b);
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
    return (prepend && paramsStr.length ? joinStr : "") + paramsStr + (postpend && paramsStr.length ? joinStr : "");
  }
});
registerHelper("getArgsInfo", (args: { [name: string]: string }) => {
  return Object.entries(args).map(([name, type]) => {
    if (type.endsWith("[]")) {
      const primType = getPrimitiveTypeRecursively(type.substring(0, type.length - 2));
      if (Array.isArray(primType)) {
        return { name, type: "enum", multi: true, values: primType };
      } else {
        return { name, type: primType, multi: true };
      }
    } else {
      const primType = getPrimitiveTypeRecursively(type);
      if (Array.isArray(primType)) {
        return { name, type: "enum", multi: false, values: primType };
      } else {
        return { name, type: primType, multi: false };
      }
    }
  });
});

function getPrimitiveTypeRecursively(type: string | string[]): string | string[] {
  if (type !== "string" && !Array.isArray(type)) {
    return getPrimitiveTypeRecursively(doc.types[type]);
  }
  return type;
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
