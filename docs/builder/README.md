# Hathora Builder

> A multiplayer game development framework

![image](https://user-images.githubusercontent.com/5400947/155251444-403b1dcc-904e-4283-931c-883c896bbce5.png)

## Use cases

Hathora Builder can be used for:

1. 🎲 **Turn-based multiplayer games** - Examples: Chess, Words with Friends, Codenames, etc

2. 🎮 **Realtime multiplayer games** - Examples: Among Us, Agar.io, Slither.io, etc

3. 💬 **Realtime & social applications** - Examples: chat apps, delivery tracking apps, etc

See the [showcase](showcase.md) to see some example games and demos made with Hathora Builder!

## Motivation

Building a multiplayer game can be extremely challenging. On top of the challenges of building a single player game, you now have to constantly battle the network and latency, find ways to prevent cheating, and figure out how to make a scalable backend architecture.

Hathora Builder's abstractions greatly simplify these aspects so that you can focus on what matters - making your game!

## Features

Hathora Builder comes with the following features out of the box:

- Built in [networking](networking.md)
  - Automatic state synchronization of server state to all subscribed clients
  - Optimized binary protocol with delta encoding
  - Easy to use remote procedure calls (RPCs)
- Declarative [API format](type-driven-development.md) with code generation of typesafe data models and clients
- Development server with built in [prototyping interface](type-driven-development.md?id=prototype-ui)
- Built in [matchmaking](state.md?id=lifecycle) service
- Various built in [authentication providers](auth.md)
- Automatic [persistence](state.md?id=persistence) of server state
- Horizontally scalable [architecture](architecture.md)

## Installation

Requirements:

- node v16.12.0+

Install Hathora from the npm registry:

```sh
npm install -g hathora
```

## Getting started

Try out the [Uno](tutorial_uno.md) or [Among Us](tutorial_among_us.md) tutorials.
