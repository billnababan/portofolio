// Applies every .sql file in ./migrations that has not run yet, in name order.
// Usage: npm run db:migrate
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { env } from "../config/env.js";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "migrations");

export const migrate = async (): Promise<string[]> => {
  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true,
    timezone: "Z",
  });
  try {
    await conn.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         name VARCHAR(100) NOT NULL PRIMARY KEY,
         applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    );
    const [rows] = await conn.query<mysql.RowDataPacket[]>("SELECT name FROM schema_migrations");
    const done = new Set(rows.map((r) => r.name as string));
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

    const applied: string[] = [];
    for (const file of files) {
      if (done.has(file)) continue;
      const sql = await fs.readFile(path.join(dir, file), "utf8");
      // MySQL commits DDL implicitly, so a failed migration is reported and stops the run.
      await conn.query(sql);
      await conn.query("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
      applied.push(file);
    }
    return applied;
  } finally {
    await conn.end();
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const applied = await migrate();
  console.log(applied.length ? `migrate: applied ${applied.join(", ")}` : "migrate: nothing to apply");
}
