import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5165",
        changeOrigin: true,
      },
      "/imagenes-servicios": {
        target: "http://localhost:5165",
        changeOrigin: true,
      },
      "/chathub": {
        target: "http://localhost:5165",
        changeOrigin: true,
        ws: true,
      },
      "/avatars": {
        target: "http://localhost:5165",
        changeOrigin: true,
      }
    }
  }
});