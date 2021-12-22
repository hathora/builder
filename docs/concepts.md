# Concepts

> This section is under construction!

The primary goal of hathora is to offer the simplest development experience possible. This document explores some of the features which aim to accomplish this.

## Type driven development

By encoding the API in the `rtag.yml` upfront, hathora is given a lot of information about how the application functions. It then tries to use this information to help the developer as much as possible, by generating

1. typesafe clients with the method calls and types built in
2. the server interface which the implmentation needs to implement
3. a debug application which allows extremely fast prototyping and testing

## Core loop

hathora applications consist of a set of independent "states", each of which represent a new instance of the application.

First, clients initialize a new state via the `initialize` method. Then the state evolves over time with this lifecycle:

1. clients call methods to modify the state
2. the server validates the method calls and if valid, mutates the state
3. changes to the state are automatically picked up by the framework
4. the server obtains new user states per client via `getUserState` and broadcasts updates

## Replay log

hathora models the backend as a deterministic state machine. Internal state is modified determinsitically as a function of its inputs. If we write down the method name and its inputs every time state is modified, we can later reconstruct the state by replaying all the method calls sequentially.

There are a few common sources of non-determinism that often live in server side logic: (pseudo-)random numbers, current time, and api calls. To still be able to determinsitically reconstruct the state while still allowing for these sources, hathora passes in a `context` object as an argument to methods/`onTick`. By utilizing the functions on this object (e.g. `ctx.time()`), hathora is able to write down the appropriate information in the replay log so that it can feed in the same values during replay time.

The alternative to this approach is to write down full state snapshots instead. However, if the state is large, this can be quite slow, reducing the frequency at which state snapshots can be written. In contrast, method inputs will typically be very small and thus writing them down will be very fast. The other disadvantage of writing state snapshots is that it is required for the internal state to be serializable. With the replay log approach, you can use e.g. libraries with hidden state and not worry how they serialize!

Ultimately, this system frees developers from having to think about persistence in their server side logic and operate soley on in-memory objects, while still providing durability automatically.
