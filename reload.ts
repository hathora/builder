import * as fs from "fs";

export function reload(importFn: () => any, extractFn: (module: any) => any) {
  const oldKeys = new Set(Object.keys(require.cache));
  const module = importFn();
  const newKeys = Object.keys(require.cache);
  const filesToWatch = newKeys.filter(x => !oldKeys.has(x));

  let extracted = extractFn(module);
  filesToWatch.forEach(file => {
    fs.watch(file, () => {
      delete require.cache[file];
      try {
        extracted = extractFn(importFn());
        console.log("Reloaded module " + file);
      } catch (err) {
        console.error("Error reloading module " + file + "\n" + err);
      }
    });
  });

  const handler = {
    get: (_target: any, prop: PropertyKey) => {
      return extracted[prop];
    }
  };
  return new Proxy(extracted, handler);
}
