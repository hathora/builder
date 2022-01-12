# Data flow

![hathora_game_flow](https://user-images.githubusercontent.com/5400947/149067789-54f4bbf1-fcde-4cde-bfca-eb2009bf338b.png)

### User Input

Based on user input, clients call methods on the server (via remote procedure calls, or RPCs) to mutate state. For example, a user key press of the up arrow may trigger the client to call a `moveForward()` method on the server.

### State mutations

Inside the server methods, it executes user defined business logic to modify the application's internal state. The business logic is also responsible to potentially reject the request with an error if deemed invalid. This server authoritative approach provides a way for the developer to prevent cheating in their game by validating all mutations.

### State synchronization

Upon detecting state modifications from inside the methods, Hathora computes the user state diff for each subscribed user and sends them out at a regular interval.

### Rendering

Clients receive state diffs from the server and apply them to their local state to obtain the latest user state snapshot. The client is then free to render this data however they want.
