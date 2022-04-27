import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Game from "./pages/Game";


export default function App() {
  return (
      <Router>
        <Routes>
            <Route path="/" element={<Game/>} />
          <Route path="/game/:gameId" element={<div />} />
        </Routes>
      </Router>
  );
}
