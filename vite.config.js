import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  // 'mpa' = no SPA fallback in dev/preview, matching production (unknown URLs 404).
  appType: "mpa",
  define: {
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
  build: {
    target: "es2020",
    modulePreload: { polyfill: false },
    // The SSR bundle (used once at build time by scripts/prerender.mjs) needs no public files.
    copyPublicDir: !isSsrBuild,
  },
}));
