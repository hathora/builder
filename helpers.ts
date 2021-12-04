import { createHash } from "crypto";
import { registerHelper } from "handlebars";
import { v4 as uuidv4 } from "uuid";

registerHelper("concat", (...arr) => arr.splice(0, arr.length - 1).join(""));
registerHelper("eq", (a, b) => a === b);
registerHelper("ne", (a, b) => a !== b);
registerHelper("stringify", JSON.stringify);
registerHelper("isArray", Array.isArray);
registerHelper("isObject", (x) => typeof x === "object");
registerHelper("capitalize", capitalize);
registerHelper("uppercase", (x) =>
  x
    .split(/(?=[A-Z])/)
    .join("_")
    .toUpperCase()
);
registerHelper("makeRequestName", (x) => "I" + capitalize(x) + "Request");
registerHelper("makePluginName", (x) => x.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() + "-plugin");
registerHelper("uuid", () => uuidv4());
registerHelper("sha256", (x) => createHash("sha256").update(x).digest("hex"));

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
