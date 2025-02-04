import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      include: "**/*.tsx",
    }),
  ],
  server: {
    host: '0.0.0.0', // Allows access from other devices on the network
    port: 5173,      // You can specify a custom port if needed
  },
  
});
