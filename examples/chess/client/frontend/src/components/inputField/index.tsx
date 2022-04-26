import React from "react";
import CopyIcon from "../../assets/copy.svg";
import useDarkMode from "../../hook/useDarkMode";
import CopyLightIcon from "../../assets/copylight.svg";

// interface InputChange{
//   onChange : ()=> void
// }

const Input = () => {
  const [colorTheme, setTheme] = useDarkMode();
  return (
    <label className="relative text-gray-400 focus-within:text-gray-600 block">
      {colorTheme === "dark" ? (
        <img
          src={CopyIcon}
          alt="Copy Dark Link ICON "
          className="pointer-events-none w-4 h-4 absolute top-1/2 transform -translate-y-1/2 left-3"
        />
      ) : (
        <img
          src={CopyLightIcon}
          alt="Copy Light Link Icon "
          className="pointer-events-none w-4 h-4 absolute top-1/2 transform -translate-y-1/2 left-3"
        />
      )}

      <input
        type="text"
        name="link"
        id="link"
        placeholder="Enter a link"
        className="form-input border border-indingo py-2 rounded px-4 bg-white dark:bg-black dark:border-white placeholder-gray-400 text-gray-500 dark:text-white appearance-none block pl-8 focus:outline-none"
      />
    </label>
  );
};

export default Input;
