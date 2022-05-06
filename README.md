<p align="center">
  <a href="https://hathora.dev" target="_blank" rel="noopener noreferrer">
    <img src="https://uploads-ssl.webflow.com/6257361ae96887d2c8c7faa8/6266fdf044a3635e060499d7_Hathora_logo_with_name.png" alt="Hathora logo">
  </a>
</p>
<br/>
<p align="center">
  <a href="https://npmjs.com/package/hathora"><img src="https://badge.fury.io/js/hathora.svg" alt="npm version"></a>
  <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/hathora.svg" alt="node compatibility"></a>
  <a href="https://github.com/hathora/hathora/actions/workflows/build.yml"><img src="https://github.com/hathora/hathora/actions/workflows/build.yml/badge.svg" alt="build status"></a>
  <a href="https://discord.gg/6nVdeCBffR"><img src="https://img.shields.io/badge/chat-discord-blue?logo=discord" alt="discord chat"></a>
</p>
<br/>

# Hathora - multiplayer game framework

## Overview

Hathora is a framework for building multiplayer games and other realtime applications.

## Documentation

Visit https://docs.hathora.dev

## Quick start

First, make sure you have node v16.12.0+ installed.

Then install the hathora cli from the npm registry:

```sh
npm install -g hathora
```

Clone an example hathora game:

```sh
git clone https://github.com/hathora/ship-battle.git
```

Inside the `ship-battle` directory, start the Hathora dev server:

```sh
hathora dev
```

Finally, visit http://localhost:3001 to see the game in action (add multiple users by opening the same url in different tabs):

> Instructions: Arrow keys to move, space bar to fire.

![image](https://user-images.githubusercontent.com/5400947/149647035-91442df6-73d6-4b55-ae30-f3862e8b5c8b.png)

For a deeper introduction, take a look at the [tutorial](https://docs.hathora.dev/#/tutorial_among_us).

## Examples

Here are some other example apps built with hathora:

- [avalon](examples/avalon)
- [chess](examples/chess)
- [codenames](examples/codenames)
- [poker](examples/poker)
- [rock-paper-scissor](examples/rock-paper-scissor)
- [uno](examples/uno)
- [tussie-missue](https://github.com/hpx7/tussie-mussie)
- [hive](https://github.com/knigam/hive)

## Community

Discord: https://discord.gg/6nVdeCBffR

## Contributing

To contribute to Hathora, first clone the repo:

```sh
https://github.com/hathora/hathora
```

Make sure you have `ts-node` installed globally:

```sh
npm install -g ts-node
```

You can now invoke your local hathora cli as follows:

```
ts-node /path/to/hathora/cli.ts dev
```
