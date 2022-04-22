import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Authentication from "./pages/Authentication/Auth";
import Home from "./pages/Home/Home";
import Game from "./pages/Game/Game";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/auth" element={<Authentication />} />
      </Routes>
    </Router>
  );
}
