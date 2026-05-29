import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["recharts", "d3-scale", "d3-shape", "d3-format", "lodash"],
  },
  ssr: {
    noExternal: ["recharts"],
  },
});
