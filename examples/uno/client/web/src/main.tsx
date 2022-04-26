import ReactDOM from "react-dom/client";
import "react-toastify/dist/ReactToastify.css";
import HathoraContextProvider from "./context/GameContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HathoraContextProvider>
    <App />
  </HathoraContextProvider>
);
