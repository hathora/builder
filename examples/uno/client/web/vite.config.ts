import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: { target: "esnext", emptyOutDir: true },
  define: {
    "process.env": {
      COORDINATOR_HOST: process.env.COORDINATOR_HOST,
      MATCHMAKER_HOST: process.env.MATCHMAKER_HOST,
    },
  },
  server: { host: "0.0.0.0" },
  clearScreen: false,
});
