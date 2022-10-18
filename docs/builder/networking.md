# Hathora Builder - Concepts: Networking

## Transport

A client/server application's transport refers to the mechanism through which the client and server communicate. Some example transports include: UDP, TCP, HTTP, Websocket, WebRTC.

Hathora Builder aims to be transport agnostic, meaning that multiple transport mechanisms are supported and the application isn't necessarily aware of which one is being used. This allows the framework to do things like choose UDP when in a native app and low latency context, websockets in browsers, and even fall back to HTTP for environments with strict firewall restrictions.

That being said, the only transport currently implemented for Hathora Builder is WebSocket.

## Protocol

There are two modes of messaging between a Hathora Builder server and client: state synchronization and events.

State synchronization is the process of keeping clients up to date with data on the server. State synchronization is handled automatically by Hathora Builder -- when state is mutated inside server methods, Hathora Builder detects the mutation and computes what data needs to be sent to each subscribed client. Network packets are kept small by only sending diffs and by utilizing an optimized binary serialization format.

Events are one-off messages that can be sent to individual users or broadcast to all subscribers. They are invoked inside server methods via `ctx.sendEvent(event, data, userId)` and `ctx.broadcastEvent(event, data)`. Events are useful for ephermeral actions, like telling clients when to start an animation or play a sound.
