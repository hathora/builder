import MoonIcon from "../../assets/moon.svg";
import SunIcon from "../../assets/sunlight.svg";
import useDarkMode from "../../hook/useDarkMode";

const DarkModeToggler = () => {
  const [colorTheme, setTheme] = useDarkMode();
  return (
    <div className="cursor-pointer " onClick={() => setTheme(colorTheme)}>
      {colorTheme === "light" ? <img src={SunIcon} alt="Dark Mode" /> : <img src={MoonIcon} alt="light mode" />}
    </div>
  );
};

export default DarkModeToggler;
