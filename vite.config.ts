import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      // Disable the error overlay so it doesn't block the whole screen
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      // Allows importing from @/components instead of ../../components
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));



