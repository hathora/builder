# State

## Overview

Hathora applications consist of a collection of independent instances called "states". Each state corresponds to a new instance of `InternalState` on the server and has an associated `stateId`. Users can either create a new state or connect to an existing one by providing its `stateId`.

An `InternalState` is the server side in-memory representation of state. It is created in your `initialize` method, mutated by your custom business logic inside your other methods, and is mapped to the `userState` via `getUserState()`.

The `userState` is the client specific view of the data which is kept synchronized by the server. Its structure is defined inside `hathora.yml`.

## Data privacy

One advantage of separating `InternalState` and `userState` is that you can choose exactly which data the user gets to see. For example, you may want to filter out face down cards if the user shouldn't be able to see them. This prevents leaking private information to the user.

## Data relevancy

Another key functionality this separation is useful is for not sending unnecessary data to the user. For example, you may want to exclude entities far away from the user if they wouldn't be rendered in their viewport anyway. This can save bandwidth by only sending the relevent data to the user.

## Data modeling

You should model your server data independently of how you model your client data. For example, you may want to use a data structure optimized for spatial search in the server, but end up transforming this into a simple list of entities inside `getUserState`.

It is important to note that there are no restrictions on how you define `InternalState` for your application. Being able to use standard language constructs as well as imported libraries lets you use tools you are already familiar with rather than forcing you to learn a specific modeling and query syntax, ultimately lowering the barrier for usability.

## Persistence

TODO
