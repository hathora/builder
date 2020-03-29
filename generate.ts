import { safeLoad } from "js-yaml";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { ArgumentType, TypeMetadata, MethodArgument } from "./formTypes";

const stringifyType = (key: string, value: any) => {
  if (Array.isArray(value)) {
    return `export enum ${key} {\n  ${value.join(",\n  ")}\n}`;
  } else if (typeof value === "object") {
    const parts = Object.entries(value).map(([k, v]) => `${k}: ${v};`);
    return `export interface ${key} {\n  ${parts.join("\n  ")}\n}`;
  } else {
    return `export type ${key} = ${value};`;
  }
};

const stringifyServerMethod = (key: string, value: any) => {
  const args = value ? Object.keys(value) : [];
  return `    socket.on("${key}", (${args.join(", ")}) => {
      impl.${key}(state, userData${args.length ? [""].concat(args).join(", ") : ""});
      broadcastUpdates(stateId, state);
    });`;
};

const stringifyClientMethod = (key: string, value: any) => {
  const args = value ?? {};
  const argNames = Object.keys(args);
  const argsStr = Object.entries(args)
    .map(([name, type]) => `${name}: ${type}`)
    .join(", ");
  return `  public ${key}(${argsStr}): void {
    this.socket.emit("${key}"${argNames.length ? [""].concat(argNames).join(", ") : ""});
  }`;
};

const createMethodArgument = (name: string | undefined, value: string): MethodArgument => {
  if (value.length == 0) {
    throw new TypeError("No type was provided for: " + name);
  } else if (value.endsWith("[]")) {
    return {
      name,
      type: ArgumentType.ARRAY,
      args: createMethodArgument(undefined, value.substring(0, value.length - 2)),
    };
  }
  const metadata: TypeMetadata | undefined = typeMetadataMap.get(value);
  if (metadata == null) {
    throw new TypeError("Unknown type: " + value);
  } else if (metadata.argType == ArgumentType.OBJECT) {
    return { name, type: ArgumentType.OBJECT, args: [] };
  } else if (metadata.argType == ArgumentType.ENUM) {
    return { name, type: ArgumentType.ENUM, values: metadata.values };
  } else {
    return { name, type: metadata.argType };
  }
};

const createMethodArguments = (value: any): MethodArgument[] => {
  if (value == null) {
    return [];
  }
  return Object.entries(value).map(([key, value]) => createMethodArgument(key, value as string));
};

const doc = safeLoad(readFileSync("src/types.yml", "utf8"));

if (!existsSync("src/generated")) {
  mkdirSync("src/generated");
}

// types
let typesOutput = "";
typesOutput += "export type UserId = string;\n";
Object.entries(doc.types).forEach(([key, value]) => {
  typesOutput += stringifyType(key, value) + "\n";
});
writeFileSync("src/generated/types.ts", typesOutput, "utf8");

// server
let serverMethodOutput = "";
Object.entries(doc.methods).forEach(([key, value]) => {
  if (key !== doc.initialize) {
    serverMethodOutput += stringifyServerMethod(key, value) + "\n";
  }
});
const serverTemplate = readFileSync("server.ts.template", "utf8");
const serverOutput = serverTemplate
  .replace(/{{methods}}/g, serverMethodOutput)
  .replace(/{{UserData}}/g, doc.userData);
writeFileSync("src/generated/server.ts", serverOutput, "utf8");

// client
let clientMethodOutput = "";
Object.entries(doc.methods).forEach(([key, value]) => {
  if (key !== doc.initialize) {
    clientMethodOutput += stringifyClientMethod(key, value) + "\n\n";
  }
});
const clientTemplate = readFileSync("client.ts.template", "utf8");
const clientOutput = clientTemplate
  .replace(/{{methods}}/g, clientMethodOutput)
  .replace(/{{UserState}}/g, doc.userState);
writeFileSync("src/generated/client.ts", clientOutput, "utf8");

// app
const typeMetadataMap: Map<string, TypeMetadata> = new Map<string, TypeMetadata>();
Object.entries(doc.types).forEach(([key, value]) => {
  if (Array.isArray(value)) {
    typeMetadataMap.set(key, { argType: ArgumentType.ENUM, values: value });
  } else if (typeof value === "object") {
    typeMetadataMap.set(key, { argType: ArgumentType.OBJECT, values: [] });
  } else if (value == "string") {
    typeMetadataMap.set(key, { argType: ArgumentType.STRING, values: [] });
  } else if (value == "number") {
    typeMetadataMap.set(key, { argType: ArgumentType.NUMBER, values: [] });
  } else if (value == "boolean") {
    typeMetadataMap.set(key, { argType: ArgumentType.BOOLEAN, values: [] });
  }
});
const appmethods = Object.entries(doc.methods)
  .filter(([key, _value]) => key !== doc.initialize)
  .map(([key, value]) => ({ name: key, args: createMethodArguments(value) }));
const appTemplate = readFileSync("app.ts.template", "utf8");
writeFileSync("src/generated/app.ts", appTemplate, "utf8");

// methods
const methodTemplate = readFileSync("methods.ts.template", "utf8");
const methodOutput = methodTemplate.replace(/{{methods}}/g, JSON.stringify(appmethods, null, 2));
writeFileSync("src/generated/methods.ts", methodOutput, "utf8");

// index
const indexTemplate = readFileSync("index.html.template", "utf8");
const indexOutput = indexTemplate;
writeFileSync("src/generated/index.html", indexOutput, "utf8");

// styles
writeFileSync("src/generated/styles.css", readFileSync("styles.css", "utf8"), "utf8");

// form
writeFileSync("src/generated/form.ts", readFileSync("form.ts.template", "utf8"), "utf8");
writeFileSync("src/generated/formTypes.ts", readFileSync("formTypes.ts", "utf8"), "utf8");
