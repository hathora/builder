const colors = require("tailwindcss/colors");
const path = require("path");

module.exports = {
  content: ["./src/**/*.{html,js,tsx,ts}", "./index.{html,js}", "./App.tsx"].map((str) =>
    path.relative(process.cwd(), path.resolve(__dirname, str))
  ),
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        wine: "#FF3860",
        white: "#fdfdfd",
        indingo: "#260D61",
      },
    },
  },
  plugins: [],
};
