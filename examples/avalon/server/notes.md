how do i start a server?

npm install fails, needed to run rtag to get it started

found server start docs

```


[plugin:vite:import-analysis] Failed to resolve import "vue-router". Does the file exist?

/home/szunami/git/rtag/examples/avalon/client/.rtag/app.ts:4:24

2  |  import * as Types from "./types";
3  |  import Vue from "vue";
4  |  import VueRouter from "vue-router";
   |                         ^
5  |  import Toasted from "vue-toasted";
6  |  import GAuth from "vue-google-oauth2";

    at formatError (/home/szunami/git/rtag/examples/avalon/server/.rtag/node_modules/vite/dist/node/chunks/dep-4065e69a.js:53327:46)
    at TransformContext.error (/home/szunami/git/rtag/examples/avalon/server/.rtag/node_modules/vite/dist/node/chunks/dep-4065e69a.js:53323:19)
    at normalizeUrl (/home/szunami/git/rtag/examples/avalon/server/.rtag/node_modules/vite/dist/node/chunks/dep-4065e69a.js:46606:26)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
    at TransformContext.transform (/home/szunami/git/rtag/examples/avalon/server/.rtag/node_modules/vite/dist/node/chunks/dep-4065e69a.js:46743:57)
    at Object.transform (/home/szunami/git/rtag/examples/avalon/server/.rtag/node_modules/vite/dist/node/chunks/dep-4065e69a.js:53544:30)
    at transformRequest (/home/szunami/git/rtag/examples/avalon/server/.rtag/node_modules/vite/dist/node/chunks/dep-4065e69a.js:60585:29)
    at /home/szunami/git/rtag/examples/avalon/server/.rtag/node_modules/vite/dist/node/chunks/dep-4065e69a.js:60679:32

Click outside or fix the code to dismiss.
You can also disable this overlay with hmr: { overlay: false } in vite.config.js.

```

need to npm install in .rtag/client too


post install hook seemed to loop?

```
szunami@it-desktop:~/git/rtag/examples/hello/client$ npm install

> hello-client@0.0.1 postinstall
> cd .rtag && npm install


> hello-client@0.0.1 postinstall
> cd .rtag && npm install


> hello-client@0.0.1 postinstall
> cd .rtag && npm install


> hello-client@0.0.1 postinstall
> cd .rtag && npm install


> hello-client@0.0.1 postinstall
> cd .rtag && npm install


> hello-client@0.0.1 postinstall
> cd .rtag && npm install


> hello-client@0.0.1 postinstall
> cd .rtag && npm install


> hello-client@0.0.1 postinstall
> cd .rtag && npm install


> hello-client@0.0.1 postinstall
> cd .rtag && npm install


> hello-client@0.0.1 postinstall
> cd .rtag && npm install


> hello-client@0.0.1 postinstall
> cd .rtag && npm install

```


rtag fails, not sure what minimal types.yml looks like

```

/home/szunami/.nvm/versions/node/v14.15.5/lib/node_modules/rtag/generate.ts:109
  return s.charAt(0).toUpperCase() + s.slice(1);
           ^
TypeError: Cannot read property 'charAt' of undefined
    at capitalize (/home/szunami/.nvm/versions/node/v14.15.5/lib/node_modules/rtag/generate.ts:109:12)
    at Object.<anonymous> (/home/szunami/.nvm/versions/node/v14.15.5/lib/node_modules/rtag/generate.ts:61:48)
    at Object.wrapper (/home/szunami/.nvm/versions/node/v14.15.5/lib/node_modules/rtag/node_modules/handlebars/lib/handlebars/internal/wrapHelper.js:10:19)
    at Object.eval (eval at createFunctionContext (/home/szunami/.nvm/versions/node/v14.15.5/lib/node_modules/rtag/node_modules/handlebars/lib/handlebars/compiler/javascript-compiler.js:260:23), <anonymous>:17:120)
    at main (/home/szunami/.nvm/versions/node/v14.15.5/lib/node_modules/rtag/node_modules/handlebars/lib/handlebars/runtime.js:230:22)
    at ret (/home/szunami/.nvm/versions/node/v14.15.5/lib/node_modules/rtag/node_modules/handlebars/lib/handlebars/runtime.js:250:12)
    at ret (/home/szunami/.nvm/versions/node/v14.15.5/lib/node_modules/rtag/node_modules/handlebars/lib/handlebars/compiler/compiler.js:548:21)
    at generate (/home/szunami/.nvm/versions/node/v14.15.5/lib/node_modules/rtag/generate.ts:120:5)
    at /home/szunami/.nvm/versions/node/v14.15.5/lib/node_modules/rtag/generate.ts:150:3
    at Array.forEach (<anonymous>)
```

szunami@it-desktop:~/git/rtag/examples/hello/server$ node --loader ts-node/esm --experimental-specifier-resolution=node .rtag/proxy.ts
(node:145414) ExperimentalWarning: --experimental-loader is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)

/home/szunami/git/rtag/node_modules/ts-node/src/index.ts:513
    return new TSError(diagnosticText, diagnosticCodes)
           ^
TSError: ⨯ Unable to compile TypeScript:
.rtag/proxy.ts:21:41 - error TS1343: The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'esnext', or 'system'.

21 const __dirname = dirname(fileURLToPath(import.meta.url));
                                           ~~~~~~~~~~~
.rtag/proxy.ts:25:14 - error TS1378: Top-level 'await' expressions are only allowed when the 'module' option is set to 'esnext' or 'system', and the 'target' option is set to 'es2017' or higher.

25 const vite = await createServer({
                ~~~~~

    at createTSError (/home/szunami/git/rtag/node_modules/ts-node/src/index.ts:513:12)
    at reportTSError (/home/szunami/git/rtag/node_modules/ts-node/src/index.ts:517:19)
    at getOutput (/home/szunami/git/rtag/node_modules/ts-node/src/index.ts:752:36)
    at Object.compile (/home/szunami/git/rtag/node_modules/ts-node/src/index.ts:968:32)
    at /home/szunami/git/rtag/node_modules/ts-node/src/esm.ts:99:38
    at Generator.next (<anonymous>)
    at /home/szunami/git/rtag/node_modules/ts-node/dist/esm.js:8:71
    at new Promise (<anonymous>)
    at __awaiter (/home/szunami/git/rtag/node_modules/ts-node/dist/esm.js:4:12)
    at transformSource (/home/szunami/git/rtag/node_modules/ts-node/dist/esm.js:72:16)


had to create InternalState + export Impl


.rtag/auth.ts:3:67 - error TS2307: Cannot find module 'unique-names-generator' or its corresponding type declarations.

3 import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";
                                                                    ~~~~~~~~~~~~~~~~~~~~~~~~

    at createTSError (/home/szunami/git/rtag/node_modules/ts-node/src/index.ts:513:12)
    at reportTSError (/home/szunami/git/rtag/node_modules/ts-node/src/index.ts:517:19)
    at getOutput (/home/szunami/git/rtag/node_modules/ts-node/src/index.ts:752:36)
    at Object.compile (/home/szunami/git/rtag/node_modules/ts-node/src/index.ts:968:32)
    at /home/szunami/git/rtag/node_modules/ts-node/src/esm.ts:99:38
    at Generator.next (<anonymous>)
    at /home/szunami/git/rtag/node_modules/ts-node/dist/esm.js:8:71
    at new Promise (<anonymous>)
    at __awaiter (/home/szunami/git/rtag/node_modules/ts-node/dist/esm.js:4:12)
    at transformSource (/home/szunami/git/rtag/node_modules/ts-node/dist/esm.js:72:16)


removed auth /shrug

had to add package.json

 Unexpected ";"
  5  |  export interface ICreateGameRequest {
  6  |  }
  7  |  export type UserData = ;
     |                         ^
  8  |  
  
