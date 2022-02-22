# Deploy

After your application is working as desired locally, you may want to deploy it on the internet.

## Build

First, you must build your project by running `hathora build`. This will create a `dist` folder at your project root, and inside `dist` you will find a `client` and `server` directory.

The directory structure will look something like this:

```
. # project root
└─ dist
   ├─ client
   │  ├─ prototype-ui
   │  └─ web
   └─ server
```

## Client

The `client/<app>` directory is a self contained frontend application and can be deployed to any cdn like [netlify](https://www.netlify.com/), [vercel](vercel.com), or [surge](https://surge.sh/).

For example, you can deploy your application's Prototype UI to surge by running the following command from your project root:

```sh
surge dist/client/prototype-ui my-app.surge.sh
```

## Server

The `server` directory is a self contains backend application that can be deployed to any cloud server or application hosting environment.

For typescript backends, the two files inside the `server` directory are `index.mjs` and `.env`. Two requirements for running the backend are:

- node.js must be installed
- the `DATA_DIR` environment variable must be set to the path where Hathora should write its data files

Example command to start the backend:

```sh
DATA_DIR=./data node index.mjs
```

> For running in production, it may be preferable to use a process manager like [pm2](https://pm2.keymetrics.io/).

## Managed Hosting

We are working on a managed hosting option called Hathora Cloud and hope to release it soon. The vision is that you won't need to do all the above steps and can deploy your app by simply running `hathora deploy`. Hathora Cloud will simplify running Hathora apps in production by offering features like auto scaling, live application monitoring, managed migrations, and more.

That being said, self-hosting will remain an option for those that want more control.
