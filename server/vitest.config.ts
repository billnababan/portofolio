import { defineConfig } from "vitest/config";

// Integration tests run against a real MySQL database (portfolio_test) that the
// global setup empties, migrates and seeds before the run.
export default defineConfig({
  test: {
    globalSetup: ["./tests/global-setup.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
    env: {
      NODE_ENV: "test",
      DB_HOST: "127.0.0.1",
      DB_USER: process.env.TEST_DB_USER ?? "portfolio",
      DB_PASSWORD: process.env.TEST_DB_PASSWORD ?? "portfolio_dev",
      DB_NAME: process.env.TEST_DB_NAME ?? "portfolio_test",
      SITE_URL: "http://127.0.0.1:4598",
      STORAGE_DIR: "./storage-test",
      CMS_DIST: "./no-cms-dist",
      VERCEL_DEPLOY_HOOK_URL: "http://127.0.0.1:4599/hook",
      SEED_OWNER_EMAIL: "owner@example.com",
      SEED_OWNER_PASSWORD: "owner-password-123",
    },
  },
});
