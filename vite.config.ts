import { basename } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      generateScopedName: (name, filename) =>
        `${basename(filename, ".module.scss")}__${name}`,
    },
  },
  base: process.env.VITE_BASE_PATH || "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("/@mui/") || id.includes("/@emotion/"))
            return "material-ui";
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/")
          )
            return "react-runtime";
        },
      },
    },
  },
});
