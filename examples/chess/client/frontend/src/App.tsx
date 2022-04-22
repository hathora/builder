import { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Home from "./Pages/Home";
import Nav from "./components/navbar";
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;
