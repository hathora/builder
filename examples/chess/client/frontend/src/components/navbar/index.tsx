import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/hathora-hammer-logo-light.png";
import MoonIcon from "../../assets/moon.svg";
import SunIcon from "../../assets/sunlight.svg";
import useDarkMode from "../../hook/useDarkMode";

const Navbar = () => {
  const navigate = useNavigate();
  const [colorTheme, setTheme] = useDarkMode();
  return (
    <nav className="shadow px-5 lg:px-10 py-4 bg-white flex justify-between fixed w-full items-center">
      
      <div className="flex items-center" onClick={() => navigate("/")}>
        <img src={Logo} alt="Hathora Logo" className="w-10 w-10" />
        <h3 className="font-bold text-indingo  text-2xl uppercase">Chess</h3>
      </div>
      <div className="cursor-pointer" onClick={() => setTheme(colorTheme)}>
        {colorTheme === "light" ? <img src={SunIcon} alt="Dark Mode" /> : <img src={MoonIcon} alt="light mode" />}
      </div>
    </nav>
  );
};

export default Navbar;
