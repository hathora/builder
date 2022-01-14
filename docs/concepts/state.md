# State

## Overview

Hathora applications are a collection of independent stateIds. Users connect to a specific stateId. Instance of a game. <!-- TODO: expand on this -->

`InternalState` is the server side in-memory representation of state. It is created in your `initialize` method, mutated by your custom business logic inside your other methods, and is mapped to the `userState` via `getUserState()`.

## Data privacy

One advantage of separating `InternalState` and `userState` is that you can choose exactly which data the user gets to see. For example, you may want to filter out face down cards if the user shouldn't be able to see them, or exclude entities far away from the user if they are off screen.

Prevents leaking information

## Data relevancy

TODO

Saves bandwidth

## Data modeling

Internal state has no restrictions

You should model your server data independently of how you model your client data. For example, you may want to use a data structure optimized for spatial search in the server, but end up transforming this into a simple list of entities inside `getUserState`.

Being able to use standard language constructs as well as imported libraries lets you use tools you are already familiar with rather than forcing you to learn a specific modeling and query syntax, ultimately lowering the barrier for usability.
