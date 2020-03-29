import { safeLoad } from "js-yaml";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";

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
  .replace(/{{UserState}}/g, doc.userState)
writeFileSync("src/generated/client.ts", clientOutput, "utf8");

// app
const appTemplate = readFileSync("app.ts.template", "utf8");
const appOutput = appTemplate;
writeFileSync("src/generated/app.ts", appOutput, "utf8");

// index
const indexTemplate = readFileSync("index.html.template", "utf8");
const indexOutput = indexTemplate;
writeFileSync("src/generated/index.html", indexOutput, "utf8");
