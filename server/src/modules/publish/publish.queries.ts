import { execute, select, selectOne, type Db } from "../../db/pool.js";

export type PublishRow = { id: number; status: "triggered" | "failed"; note: string; response: string; created_at: Date; user_name: string | null };

export const lastSuccessfulPublish = (db: Db) =>
  selectOne<{ id: number; created_at: Date; last_activity_id: number }>(
    db,
    `SELECT id, created_at, last_activity_id FROM publishes WHERE status = 'triggered' ORDER BY id DESC LIMIT 1`,
  );

export const publishHistory = (db: Db, limit = 20) =>
  select<PublishRow>(
    db,
    `SELECT p.id, p.status, p.note, p.response, p.created_at, u.name AS user_name
       FROM publishes p LEFT JOIN users u ON u.id = p.triggered_by
      ORDER BY p.id DESC LIMIT ?`,
    [limit],
  );

// Content changes made after the last successful publish: what is not live yet.
export const pendingChanges = (db: Db, afterActivityId: number) =>
  select<{ id: number; action: string; summary: string; created_at: Date; user_name: string | null }>(
    db,
    `SELECT a.id, a.action, a.summary, a.created_at, u.name AS user_name
       FROM activity_log a LEFT JOIN users u ON u.id = a.user_id
      WHERE a.is_content = 1 AND a.id > ?
      ORDER BY a.id DESC LIMIT 100`,
    [afterActivityId],
  );

// Records the publish together with the newest activity it includes.
export const insertPublish = async (db: Db, p: { status: PublishRow["status"]; note: string; response: string; userId: number; lastActivityId: number }) => {
  const result = await execute(db, `INSERT INTO publishes (status, last_activity_id, note, response, triggered_by) VALUES (?, ?, ?, ?, ?)`, [
    p.status,
    p.lastActivityId,
    p.note,
    p.response.slice(0, 500),
    p.userId,
  ]);
  return result.insertId;
};

export const newestActivityId = async (db: Db) =>
  Number((await selectOne<{ id: number | null }>(db, `SELECT MAX(id) AS id FROM activity_log`))?.id ?? 0);
