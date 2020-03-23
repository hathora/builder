import { safeLoad } from "js-yaml";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";

const stringifyType = (key, value) => {
  if (Array.isArray(value)) {
    return `export enum ${key} {\n\t${value.join(",\n\t")}\n}`;
  } else if (typeof value === "object") {
    const parts = Object.entries(value).map(([k, v]) => `${k}: ${v}`);
    return `export interface ${key} {\n\t${parts.join("\n\t")}\n}`;
  } else {
    return `export type ${key} = ${value}`;
  }
};

const stringifyMethod = (key, value) => {
  const args = value ? Object.keys(value) : [];
  return `  socket.on("${key}", (${args.join(', ')}) => {
    impl.${key}(state, userData${args.length ? [''].concat(args).join(', ') : ''});
    broadcastUpdates(stateId, state);
  });`;
};

const doc = safeLoad(readFileSync("src/types.yml", "utf8"));

if (!existsSync("src/generated")) {
  mkdirSync("src/generated");
}

// types
let typesOutput = "";
typesOutput += "export type UserId = string\n";
Object.entries(doc.types).forEach(([key, value]) => {
  typesOutput += stringifyType(key, value) + "\n";
});
writeFileSync("src/generated/types.ts", typesOutput, "utf8");

// server
let methodOutput = "";
Object.entries(doc.methods).forEach(([key, value]) => {
  if (key !== doc.initialize) {
    methodOutput += stringifyMethod(key, value) + "\n";
  }
});
const serverTemplate = readFileSync("server.ts.template", "utf8");
const serverOutput = serverTemplate
  .replace(/{{methods}}/g, methodOutput)
  .replace(/{{UserData}}/g, doc.userData);
writeFileSync("src/generated/server.ts", serverOutput, "utf8");

// client
const clientTemplate = readFileSync("client.ts.template", "utf8");
const clientOutput = clientTemplate;
writeFileSync("src/generated/client.ts", clientOutput, "utf8");

// app
const appTemplate = readFileSync("index.html.template", "utf8");
const appOutput = appTemplate;
writeFileSync("src/generated/index.html", appOutput, "utf8");
