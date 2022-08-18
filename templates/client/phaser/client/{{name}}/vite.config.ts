import { defineConfig } from "vite";

export default defineConfig({
  build: { target: "esnext" },
  publicDir: "src/assets",
  define: {
    "process.env": {
      COORDINATOR_HOST: process.env.COORDINATOR_HOST,
      MATCHMAKER_HOST: process.env.MATCHMAKER_HOST,
    },
  },
  server: { host: "0.0.0.0" },
  clearScreen: false,
});
