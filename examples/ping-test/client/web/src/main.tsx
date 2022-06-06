import React from "react";
import ReactDOM from "react-dom/client";
import { HathoraClient } from "../../.hathora/client";

import App from "./App";

setupApp().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

async function setupApp() {
  const seenStates = new Set<string>();
  let counter = 0;
  const client = new HathoraClient();
  debugger;
  if (sessionStorage.getItem("token") === null) {
    sessionStorage.setItem("token", await client.loginAnonymous());
  }
  const token = sessionStorage.getItem("token")!;
  const user = HathoraClient.getUserFromToken(token);
  const stateId = await client.create(token, {});
  const connection = client.connect(
    token,
    stateId,
    (state) => {
      // console.log(state);
    },
    console.error
  );

  setInterval(async () => {
    const before = Date.now();
    await connection.ping({ message: { uuid: counter++, time: Date.now() } });
    const after = Date.now();
    console.log(`Ping took ${after - before}ms`);
  }, 1000);
}
