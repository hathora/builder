const path = require("path");
module.exports = {
  content: ["./index.html"]
    .map((str) => path.relative(process.cwd(), path.resolve(__dirname, str)))
    .concat(`${path.relative(process.cwd(), path.resolve(__dirname, "src"))}/**/*.{jsx,ts,js,tsx}`),
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
