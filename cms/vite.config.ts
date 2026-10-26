import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development the API runs on :4000 (server/); in production the server serves this build.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    proxy: {
      "/api": "http://localhost:4000",
      "/media": "http://localhost:4000",
    },
  },
});
