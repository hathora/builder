# Hathora Builder - Concepts: Data flow

Let's examine the information flow for a typical Hathora Builder application:

![image](https://user-images.githubusercontent.com/5400947/149608079-7ea39790-b379-47ab-aa18-37c13180e5b7.png)

## User Input

Based on user input, clients call methods on the server (via remote procedure calls, or RPCs) to mutate state. For example, a user key press of the up arrow may trigger the client to call a `moveUp()` method on the server.

## State mutations

Inside the server methods, Hathora Builder executes user defined business logic to modify the application's internal state. The business logic is also responsible to potentially reject the request with an error if deemed invalid -- this is known as a "server authoritative" approach since we don't assume trust of the client.

## State synchronization

Upon detecting state modifications from inside the methods, Hathora Builder computes the user state diff for each subscribed user and sends them out at a regular interval.

## Rendering

Clients receive state diffs from the server and apply them to their local state to obtain the latest user state snapshot. The client is then free to render this data however they want.
