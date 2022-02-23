# Architecture

The Hathora architecture is designed to optimize for the following:

1. Minimze latency so games feel as immersive as possible
2. Enable horizontal scaling so that Hathora apps support large numbers of users
3. Reduce operational complexity so that its easy to run Hathora apps in production

## Overview

In Hathora applications, clients don't directly communicate with backends. Instead, they go through a load balancer / reverse proxy known as the Coordinator:

![hathora_arch](https://user-images.githubusercontent.com/5400947/155237946-68a01494-56ab-4472-975e-67c41eafde59.png)

As we can see from the diagram, the Coordinator routes clients to the corresponding backend instance. Each backend instance can run multiple game sessions (states) but a given session runs on exactly one instance at a given time. Games can be migrated from one instance to another given instances write their data to a shared filesystem.

Additionally, the coordinator is multitenent, meaning it is able to support connections for different applications. This is made possible because each Hathora application is assigned a unique appId, and both backends and clients include this appId when communicating to the coordinator.

## Coordinator Features

### Load balancing

The coordinator enables horizontal scalability by routing clients to multiple backend instances. Scaling a Hathora application is as simple as spinning up multiple instances of your backend. They will all register themselves with the coordinator and the coordinator will balance the load between them.

Note that this is a form of stateful routing -- the coordinator has to maintain state of which session lives on which backend instance and route clients consistently based on this state.

### Authentication

The coordinator handles authentication for Hathora applications. It houses the API endpoints with which users log in and receive tokens, and it verifies these credentials when users connect to a particular game session. This way, the actual game backends don't need to handle user authentication at all.

### Edge computing

Although currently there is only a single coordinator instance, the vision is for there to be a network of coordinators running on the Edge, running close to your users so they can enjoy a low latency experience.

### Transparent failover

Since clients don't connect directly to backends, the coordinator is able to seamlessly migrate users to a new backend when the backend their game was originally was on goes down, all without the user noticing (other than perhaps a momentary bump in latency).

### Connection termination

The coordinator handles SSL termination so that backends don't need to worry about it.

The coordinator also implements support for multiple protocols (although only Websocket is implemented today) so that clients can connect with Websocket, TCP, UDP, etc and the backend doesn't need to be aware of the transport mechanism.

### Network topology

In a normal client/server set up, the client needs to connect directly to the server's IP address. This means that the server needs to advertise their IP to allow inbound connections, which can be a security risk (and some firewalls may prevent it).

With Hathora, servers only need one output TCP connection to the coordinator -- all comunication is done through this connection. This allows the server's IP address to remain private and you don't need to allow any inbound connections.

### Stream multiplexing

The coordinator has many client connections but sends data to each backend across a single connection. This minimizes server resources on the backends.

### Monitoring and analytics

The coordinator knows data about backend instance health, active client connections, running game sessions, and more. In the future, we want to expose this data to developers to help them understand their game's usage and performance characteristics.

## Data Privacy and Offline Development

Currently, there is a single cloud coordinator instance deployed at coordinator.hathora.dev. This instance is mainted by the Hathora team.

The coordinator does not store any game data -- that lives entirely within the backend instances which you own. The coordinator simply proxies game packets back and forth from clients and backend instances. The coordinator does store user profile information in order to allow Hathora applications to perform userId lookups.

To allow for local development without using the cloud coordinator, we are working on releasing a local version of the coordinator. It will not have all the features of the cloud coordinator, but it will be suitable for development and will work in offline contexts.
