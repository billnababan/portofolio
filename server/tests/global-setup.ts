import fs from "node:fs/promises";
import mysql from "mysql2/promise";

// Runs once before all test files: empty the test database, migrate, seed.
export default async function setup() {
  Object.assign(process.env, {
    NODE_ENV: "test",
    DB_HOST: "127.0.0.1",
    DB_USER: process.env.TEST_DB_USER ?? "portfolio",
    DB_PASSWORD: process.env.TEST_DB_PASSWORD ?? "portfolio_dev",
    DB_NAME: process.env.TEST_DB_NAME ?? "portfolio_test",
    SITE_URL: "http://127.0.0.1:4598",
    STORAGE_DIR: "./storage-test",
  });
  const conn = await mysql.createConnection({ host: "127.0.0.1", user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const [tables] = await conn.query<mysql.RowDataPacket[]>(`SELECT table_name AS t FROM information_schema.tables WHERE table_schema = DATABASE()`);
  await conn.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const { t } of tables) await conn.query(`DROP TABLE \`${t}\``);
  await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  await conn.end();
  await fs.rm("./storage-test", { recursive: true, force: true });

  const { migrate } = await import("../src/db/migrate.js");
  await migrate();
  const { seed } = await import("../src/db/seed.js");
  await seed({ name: "Owner", email: "owner@example.com", password: "owner-password-123" });
  const { pool } = await import("../src/db/pool.js");
  await pool.end();

  return async () => {
    await fs.rm("./storage-test", { recursive: true, force: true });
  };
}
