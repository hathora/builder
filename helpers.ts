import Handlebars from "handlebars";
import { v4 as uuidv4 } from "uuid";

Handlebars.registerHelper("concat", (...arr) => arr.splice(0, arr.length - 1).join(""));
Handlebars.registerHelper("eq", (a, b) => a === b);
Handlebars.registerHelper("ne", (a, b) => a !== b);
Handlebars.registerHelper("stringify", JSON.stringify);
Handlebars.registerHelper("len", (x) => (Array.isArray(x) ? x.length : Object.keys(x).length));
Handlebars.registerHelper("isArray", Array.isArray);
Handlebars.registerHelper("isObject", (x) => typeof x === "object");
Handlebars.registerHelper("capitalize", capitalize);
Handlebars.registerHelper("uppercase", (x) =>
  x
    .split(/(?=[A-Z])/)
    .join("_")
    .toUpperCase()
);
Handlebars.registerHelper("makeRequestName", (x) => "I" + capitalize(x) + "Request");
Handlebars.registerHelper("makePluginName", (x) => x.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() + "-plugin");
Handlebars.registerHelper("uuid", () => uuidv4());

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
