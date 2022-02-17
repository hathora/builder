# Hathora

> A multiplayer game development framework

## Motivation

Building an immersive multiplayer game can be extremely challenging. On top of the challenges of building a single player game, you now have to constantly battle the network and latency, find ways to prevent cheating, and figure out how to make a scalable backend architecture.

Hathora's abstractions greatly simplify these aspects so that you can focus on what matters - making your game!

## Use cases

Hathora can be used for:

- Turn based games (both synchronous games like chess, or asynchronous games like Words With Friends)
- Realtime games (social games like Among Us, io games like Agar.io, etc)
- Other realtime and social applications (chat apps, delivery tracking apps, etc)

See the [showcase](./showcase.md) to see some example games and demos made with Hathora!

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

```
npm install -g hathora
```

## Getting started

Try out the [Uno](./tutorial_uno.md) or [Among Us](./tutorial_among_us.md) tutorials.
