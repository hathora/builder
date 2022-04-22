const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{html,js,tsx,ts}", "./index.{html,js}", "./App.tsx"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        wine: "#FF3860",
        white: "#fdfdfd",
        indingo: "#260D61"
      },
    },
  },
  plugins: [],
};
