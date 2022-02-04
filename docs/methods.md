# Methods

Methods are the server side functions which contain the business logic for evolving the `InternalState` in a Hathora application. Their signatures are defined in `hathora.yml` and client calls invoke the methods.

## Validation

Methods return a `Response` object, which can either be `Response.ok()` or `Response.error(...)`. One responsibility of the method logic is to validate the method call to make sure the action is allowed. For example, methods can return an error response if it is not the calling user's turn.

## Determinism

Hathora requires that methods are reproducible, i.e. anytime the method is called with the same inputs it should always produce the same effects. Methods are to base their action on the function inputs: `state` (the current `InternalState` object), `userId` (who called the method), and `request` (the method's arguments supplied by the client). For sources of nondeterminism the method additionally has access to a context input `ctx`, which it can use to get pseudorandom values (`ctx.chance`, a [chancejs](https://chancejs.com) object) or the current time (`ctx.time`).

## Simulation

There is a special method which isn't triggered by the client: `onTick`. The `onTick` function is called by the framework at a configurable interval and can be used for background tasks like physics simulations or timers.

## Change detection

Hathora detects changes on `InternalState` by listening for property value changes. Hathora is also aware of mutation methods for data structures in the javascript standard library (arrays, sets, maps, etc). If you are using a custom data structure (e.g. from a library) that has internal mutations that don't modify visible property values, make sure your methods modify some dummy property to convey change to the framework.
