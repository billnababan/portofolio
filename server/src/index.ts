import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { startScheduler } from "./jobs/scheduler.js";
import { ensureStorage } from "./modules/media/media.storage.js";

await ensureStorage();
await pool.query("SELECT 1"); // fail fast when the database is unreachable

const server = createApp().listen(env.PORT, () => {
  console.log(`CMS server on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
startScheduler();

// Let in-flight requests finish on deploys and restarts.
const shutdown = () => {
  server.close(() => pool.end().then(() => process.exit(0)));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
