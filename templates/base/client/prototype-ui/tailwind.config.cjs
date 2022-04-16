const colors = require("tailwindcss/colors");
const path = require("path");

module.exports = {
  content: ["./index.html", "./App.tsx", "./State.tsx", "./Forms.tsx"].map((str) =>
    path.relative(process.cwd(), path.resolve(__dirname, str))
  ),
  theme: {
    colors: {
      transparent: "transparent",
      gray: colors.gray,
      red: colors.rose,
      green: colors.teal,
      blue: colors.cyan,
      orange: colors.amber,
      indigo: {
        50: "#AF93F0",
        100: "#956FEB",
        200: "#7A4BE7",
        300: "#551DD7",
        400: "#4016A2",
        500: "#260D61",
        600: "#1C0A48",
        700: "#150736",
        800: "#0E0524",
        900: "#070212",
      },
      white: colors.white,
      black: colors.black,
    },
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      display: ['"Josefin Sans"', "Inter", "sans-serif"],
      mono: ["Inconsolata", "Inter", "sans-serif"],
    },
    extend: {},
  },
  variants: {
    extend: {
      backgroundColor: ["responsive", "hover", "focus", "active", "disabled"],
      cursor: ["responsive", "hover", "focus", "active", "disabled"],
      opacity: ["responsive", "hover", "focus", "active", "disabled"],
      pointerEvents: ["responsive", "hover", "focus", "active", "disabled"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
