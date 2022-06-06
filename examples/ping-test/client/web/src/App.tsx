import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HathoraClient } from "../../.hathora/client";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

function Home() {
  return <h1>Home</h1>;
}
