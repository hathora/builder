# Concepts

> This section is under construction!

The primary goal of rtag is to offer the simplest development experience possible. This document explores some of the features which aim to accomplish this.

## Type driven development

By encoding the API in the `rtag.yml` upfront, rtag is given a lot of information about how the application functions. It then tries to use this information to help the developer as much as possible, by generating (1) typesafe clients with the method calls and types built in, (2) the server interface which the implmentation needs to implement, and (3) a debug application which allows extremely fast prototyping and testing.

## Core loop

1. clients call methods, server runs `onTick`
2. state is mutated inside methods/`onTick`
3. changes are picked up by framework via change detection
4. updates are broadcasted via `getUserState`

## Replay log

rtag models the backend as a deterministic state machine. Internal state is modified determinsitically as a function of its inputs. If we write down the method + its inputs every time we detect a modification, we can later reconstruct the state by replaying all the method calls sequentially.

There are a few common sources of non-determinism that often live in server side logic: (pseudo-)random numbers, current time, and api calls. To still be able to determinsitically reconstruct the state while still allowing for these sources, rtag passes in a `context` object as an argument to methods/`onTick`. By utilizing the functions on this object (e.g. `context.time()`), rtag is able to write down the appropriate information in the replay log so that it can feed in the same values during replay time.

Ultimately, this system frees developers from having to think about persistence in their server side logic and operate soley on in-memory objects, while still providing durability automatically.
