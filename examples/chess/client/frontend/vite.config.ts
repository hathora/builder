import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: { overlay: false },
  },
  build: {
    target: "es2020",
    brotliSize: false,
    chunkSizeWarningLimit: 2000,
  },
});
