import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://192.168.1.2:5000",
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ["zod"], // ✅ Ensure zod is bundled
  },
  build: {
    rollupOptions: {
      external: [], // ✅ Ensure zod is not externalized
    },
  },
});
