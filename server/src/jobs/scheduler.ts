import cron from "node-cron";
import { integrations } from "../config/env.js";
import { pool, execute } from "../db/pool.js";
import { pruneAnalytics } from "../modules/analytics/analytics.queries.js";
import { auditAndStore, syncSearchConsole } from "../modules/seo/seo.service.js";

const run = (name: string, fn: () => Promise<unknown>) => async () => {
  try {
    await fn();
    console.log(`job ${name}: done`);
  } catch (err) {
    console.error(`job ${name}: failed —`, err instanceof Error ? err.message : err);
  }
};

// Daily housekeeping, in the owner's time zone.
export const startScheduler = () => {
  const options = { timezone: "Asia/Jakarta", noOverlap: true };
  cron.schedule("30 2 * * *", run("seo-audit", () => auditAndStore("schedule", null)), options);
  if (integrations.searchConsole) cron.schedule("0 3 * * *", run("search-console", syncSearchConsole), options);
  cron.schedule(
    "0 4 * * *",
    run("cleanup", async () => {
      await pruneAnalytics(pool);
      await execute(pool, `DELETE FROM sessions WHERE expires_at < UTC_TIMESTAMP()`);
    }),
    options,
  );
};
