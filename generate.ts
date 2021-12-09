import { load } from "js-yaml";
import { readdirSync, readFileSync, outputFileSync, existsSync, statSync } from "fs-extra";
import { compile } from "handlebars";
import { z } from "zod";
import { join, basename } from "path";

const TypeArgs = z.union([z.string(), z.array(z.string()), z.record(z.string())]);
const RtagConfig = z
  .object({
    types: z.record(TypeArgs),
    methods: z.record(z.nullable(z.record(z.string()))),
    auth: z
      .object({
        anonymous: z.optional(z.object({ separator: z.string() }).strict()),
        google: z.optional(z.object({ clientId: z.string() }).strict()),
        email: z.optional(z.object({ magicPublicApiKey: z.string() }).strict()),
      })
      .strict(),
    userState: z.string(),
    initialize: z.string(),
    error: z.string(),
    tick: z.optional(z.number().int().gte(50)),
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
  doc: z.infer<typeof RtagConfig>,
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

function enrichDoc(doc: z.infer<typeof RtagConfig>, plugins: string[], appName: string) {
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
    error: getArgsInfo(doc, plugins, doc.error, false),
    plugins,
    appName,
  };
}

export function generate(rootDir: string, templatesDir: string) {
  const clientDir = join(rootDir, "client");
  const doc = RtagConfig.parse(load(readFileSync(join(rootDir, "rtag.yml"), "utf8")));
  if (!Object.keys(doc.types).includes(doc.userState)) {
    throw new Error("Invalid userState");
  }
  if (!Object.keys(doc.methods).includes(doc.initialize)) {
    throw new Error("Invalid initialize");
  }

  const plugins = existsSync(join(clientDir, "plugins"))
    ? readdirSync(join(clientDir, "plugins")).map((p) => p.replace(/\..*$/, ""))
    : [];
  const appName = basename(rootDir);
  const enrichedDoc = enrichDoc(doc, plugins, appName);

  function codegen(inDir: string, outDir: string) {
    readdirSync(inDir).forEach((f) => {
      const file = join(inDir, f);
      if (statSync(file).isDirectory()) {
        codegen(file, join(outDir, f));
      } else {
        const template = compile(readFileSync(file, "utf8"));
        outputFileSync(join(outDir, f.split(".hbs")[0]), template(enrichedDoc));
      }
    });
  }
  codegen(join(__dirname, templatesDir), rootDir);
}
