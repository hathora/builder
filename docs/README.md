# Hathora

> A multiplayer game development framework

## Use cases

Hathora can be used for:

1. 🎲 **Turn-based multiplayer games** - Examples: Chess, Words with Friends, Codenames, etc

2. 🎮 **Realtime multiplayer games** - Examples: Among Us, Agar.io, Slither.io, etc

3. 💬 **Realtime & social applications** - Examples: chat apps, delivery tracking apps, etc

See the [showcase](./showcase.md) to see some example games and demos made with Hathora!

## Motivation

Building a multiplayer game can be extremely challenging. On top of the challenges of building a single player game, you now have to constantly battle the network and latency, find ways to prevent cheating, and figure out how to make a scalable backend architecture.

Hathora's abstractions greatly simplify these aspects so that you can focus on what matters - making your game!

## Features

Hathora comes with the following features out of the box:

- Built in networking
  - Automaitic state synchronization of server state to all subscribed clients
  - Optimized binary protocol with delta encoding
  - Easy to use remote procedure calls (RPCs)
- Declarative API format with code generation of typesafe data models and clients
- Development server with built in prototyping interface
- Various authentication providers
- Durable persistence of server state
- Horizontally scalable architecture

## Installation

Requirements:

- node v16.12.0+

Install hathora from the npm registry:

```sh
npm install -g hathora
```

## Getting started

Try out the [Uno](./tutorial_uno.md) or [Among Us](./tutorial_among_us.md) tutorials.
