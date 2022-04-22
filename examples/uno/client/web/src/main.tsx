import React from "react";
import ReactDOM from "react-dom/client";
import HathuraContextProvider from "./context/AuthContext";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HathuraContextProvider>
      <App />
    </HathuraContextProvider>
  </React.StrictMode>
);
