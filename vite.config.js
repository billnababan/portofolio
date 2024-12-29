import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/billjeff/", // Sesuaikan dengan subfolder jika diperlukan
  plugins: [react()],
});
