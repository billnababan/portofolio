import mysql, { type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { env } from "../config/env.js";

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: 10,
  timezone: "Z",
  charset: "utf8mb4",
  decimalNumbers: true,
});

// Every connection works in UTC, matching `timezone: "Z"` above.
pool.on("connection", (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

// Either the pool or a connection inside a transaction.
export type Db = typeof pool | PoolConnection;

// Thin, typed wrappers. All SQL in this project goes through these with `?`
// placeholders; mysql2 escapes the values, so no string building with user input.
export const select = async <T>(db: Db, sql: string, params: unknown[] = []): Promise<T[]> => {
  const [rows] = await db.query<RowDataPacket[]>(sql, params);
  return rows as T[];
};

export const selectOne = async <T>(db: Db, sql: string, params: unknown[] = []): Promise<T | null> => {
  const rows = await select<T>(db, sql, params);
  return rows[0] ?? null;
};

export const execute = async (db: Db, sql: string, params: unknown[] = []): Promise<ResultSetHeader> => {
  const [result] = await db.query<ResultSetHeader>(sql, params);
  return result;
};

export const withTransaction = async <T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
