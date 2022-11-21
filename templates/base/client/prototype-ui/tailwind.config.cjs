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
      sans: ["Space Grotesk", "sans-serif"],
      display: ['"Space Grotesk"', "sans-serif"],
      mono: ["Menlo", "sans-serif"],
    },
    extend: {
      colors: {
        brand: {
          200: 'rgba(97,231,91,0.3)',
          300: 'rgba(97,231,91,0.4)',
          400: '#66B9A0',
          500: '#02FE57',
        },
        secondary: {
          200: '#e5ddf8',
          300: '#DACAFC',
          400: '#B399EA',
          500: '#AF64EE',
          550: '#9347d2',
          600: '#7132A6',
        },
        neutralgray: {
          200: '#E6E6F2',
          225: '#d4d4e3',
          250: '#cacadc',
          300: '#B8B8CF',
          350: '#afafcb',
          400: '#8585A6',
          500: '#5E5E7D',
          525: '#484860',
          550: '#29293a',
          650: '#191927',
          600: '#151521',
          700: '#0E0E1B',
          800: '#060611',
        },
        clearwhite: {
          200: 'rgba(255,255,255,0.2)',
          300: 'rgba(255,255,255,0.3)',
          500: 'rgba(255,255,255,0.5)',
          700: 'rgba(255,255,255,0.7)',
          800: 'rgba(255,255,255,0.8)',
          900: '#fff',
        },
        error: {
          100: '#f5d8dd',
          200: 'rgba(229,57,89,0.3)',
          300: '#f18397',
          500: '#E53959',
          700: '#280a10',
        },
        warning: {
          300: 'rgba(243,213,117,0.3)',
          400: '#f3d575',
          500: '#e5bd39',
        }
      }
    },
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
