import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/spatial-glass-os/" : "/",
  plugins: [react(), tailwindcss()],
  build: { chunkSizeWarningLimit: 1600 },
});
