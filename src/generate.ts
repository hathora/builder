import { basename, join } from "path";

import { z } from "zod";
import { load } from "js-yaml";
import { compile } from "handlebars";
import { copySync, existsSync, outputFileSync, readdirSync, readFileSync, statSync } from "fs-extra";
import "./helpers";

const TypeArgs = z.union([z.string(), z.array(z.string()), z.record(z.string())]);
const HathoraConfig = z
  .object({
    types: z.record(TypeArgs),
    methods: z.record(z.nullable(z.record(z.string()))),
    auth: z
      .object({
        anonymous: z.optional(z.object({ separator: z.optional(z.string()).default("-") }).strict()),
        nickname: z.optional(z.object({}).strict()),
        google: z.optional(z.object({ clientId: z.string() }).strict()),
      })
      .strict(),
    userState: z.string(),
    initializeArgs: z.optional(z.string()),
    error: z.string(),
    tick: z.optional(z.number().int().gte(25)),
    events: z.optional(z.record(z.string())),
  })
  .strict();

type Arg =
  | ObjectArg
  | ArrayArg
  | OptionalArg
  | DisplayPluginArg
  | EnumArg
  | UnionArg
  | StringArg
  | IntArg
  | FloatArg
  | BooleanArg;
interface ObjectArg {
  type: "object";
  alias: boolean;
  typeString?: string;
  properties: Record<string, Arg>;
}
interface UnionArg {
  type: "union";
  alias: boolean;
  typeString?: string;
  options: Record<string, Arg>;
}
interface ArrayArg {
  type: "array";
  alias: boolean;
  typeString?: string;
  items: Arg;
}
interface OptionalArg {
  type: "optional";
  alias: boolean;
  typeString?: string;
  item: Arg;
}
interface DisplayPluginArg {
  type: "plugin";
  alias: boolean;
  typeString?: string;
  item: Arg;
}
interface EnumArg {
  type: "enum";
  alias: boolean;
  typeString?: string;
  options: { label: string; value: number }[];
}
interface StringArg {
  type: "string";
  alias: boolean;
  typeString?: string;
}
interface IntArg {
  type: "int";
  alias: boolean;
  typeString?: string;
}
interface FloatArg {
  type: "float";
  alias: boolean;
  typeString?: string;
}
interface BooleanArg {
  type: "boolean";
  alias: boolean;
  typeString?: string;
}

function getArgsInfo(
  doc: z.infer<typeof HathoraConfig>,
  plugins: string[],
  args: z.infer<typeof TypeArgs>,
  alias: boolean,
  typeString?: string
): Arg {
  if (Array.isArray(args)) {
    if (args.every((arg) => arg in doc.types)) {
      return {
        type: "union",
        typeString,
        alias,
        options: Object.fromEntries(args.map((type) => [type, getArgsInfo(doc, plugins, type, false)])),
      };
    }
    return {
      type: "enum",
      typeString,
      alias,
      options: args.map((label, value) => ({ label, value })),
    };
  } else if (typeof args === "object") {
    return {
      type: "object",
      typeString,
      alias,
      properties: Object.fromEntries(
        Object.entries(args).map(([name, type]) => [name.replace(/[\W]+/g, ""), getArgsInfo(doc, plugins, type, false)])
      ),
    };
  } else {
    if (args.endsWith("?")) {
      return {
        type: "optional",
        typeString: args,
        alias,
        item: getArgsInfo(doc, plugins, args.substring(0, args.length - 1), false),
      };
    } else if (args.endsWith("[]")) {
      return {
        type: "array",
        typeString: typeString ?? args,
        alias,
        items: getArgsInfo(doc, plugins, args.substring(0, args.length - 2), false),
      };
    } else if (args in doc.types) {
      const argsInfo = getArgsInfo(doc, plugins, doc.types[args], true, args);
      return plugins.includes(args) ? { type: "plugin", typeString: args, alias, item: argsInfo } : argsInfo;
    } else if (args === "string" || args === "int" || args === "float" || args === "boolean") {
      const argsInfo: Arg = { type: args, typeString: typeString ?? args, alias };
      return plugins.includes(args) ? { type: "plugin", typeString: args, alias, item: argsInfo } : argsInfo;
    } else {
      throw new Error("Invalid args: " + args);
    }
  }
}

function enrichDoc(doc: z.infer<typeof HathoraConfig>, plugins: string[], appName: string) {
  doc.types["UserId"] = "string";
  return {
    ...doc,
    types: Object.fromEntries(
      Object.entries(doc.types).map(([key, val]) => {
        const argsInfo = getArgsInfo(doc, plugins, val, false, key);
        return [
          key,
          plugins.includes(key) ? { type: "plugin", typeString: key, alias: false, item: argsInfo } : argsInfo,
        ];
      })
    ),
    methods: Object.fromEntries(
      Object.entries(doc.methods).map(([key, val]) => {
        return [key, getArgsInfo(doc, plugins, val === null ? {} : val, false)];
      })
    ),
    initializeArgs: getArgsInfo(doc, plugins, doc.initializeArgs ?? {}, false),
    error: getArgsInfo(doc, plugins, doc.error, false),
    plugins,
    appName,
    events:
      doc.events &&
      Object.fromEntries(
        Object.entries(doc.events).map(([key, val]) => {
          return [key, getArgsInfo(doc, plugins, val, false)];
        })
      ),
  };
}

export function generate(rootDir: string, templatesDir: string, args: Record<string, string> = {}) {
  const clientDir = join(rootDir, "client");
  const doc = HathoraConfig.parse(load(readFileSync(join(rootDir, "hathora.yml"), "utf8")));
  if (!Object.keys(doc.types).includes(doc.userState)) {
    throw new Error("Invalid userState");
  }

  const pluginsDir = join(clientDir, "prototype-ui", "plugins");
  const plugins = existsSync(pluginsDir) ? readdirSync(pluginsDir).map((p) => p.replace(/\..*$/, "")) : [];
  const appName = basename(rootDir);
  const enrichedDoc = { ...enrichDoc(doc, plugins, appName), ...args };

  function codegen(inDir: string, outDir: string) {
    readdirSync(inDir).forEach((f) => {
      const file = join(inDir, f);
      if (statSync(file).isDirectory()) {
        const outFile = f.replace(/\{\{(.+)\}\}/, (_, val) => (val in args ? args[val] : ""));
        codegen(file, join(outDir, outFile));
      } else if (f.endsWith(".hbs")) {
        const template = compile(readFileSync(file, "utf8"));
        outputFileSync(join(outDir, f.split(".hbs")[0]), template(enrichedDoc));
      } else {
        copySync(file, join(outDir, f));
      }
    });
  }
  codegen(join(__dirname, "..", "templates", templatesDir), rootDir);
}
