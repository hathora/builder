# rtag

## Requirements
  - node v15+
  - ts-node on classpath (`npm install -g ts-node`)

## Installation
```
npm install -g rtag
```

## Usage:

Inside a new directory, create a `types.yml` file and run `rtag` to generate rtag project.

Run `npm install` inside both the client and server directories.

Start server:
```
cd server
node --loader ts-node/esm --experimental-specifier-resolution=node .rtag/proxy.ts
```

View debug app at http://localhost:3000/
