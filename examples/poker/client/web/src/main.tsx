import React from "react";
import ReactDOM from "react-dom/client";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import "./index.css";
import HathoraContextProvider from "./context/GameContext";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["playing-card"]: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { rank?: string; suit?: string },
        HTMLElement
      >;
    }
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HathoraContextProvider>
      <App />
    </HathoraContextProvider>
  </React.StrictMode>
);
