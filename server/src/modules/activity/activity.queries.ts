import { select, type Db } from "../../db/pool.js";

export type ActivityRow = { id: number; action: string; entity_type: string; entity_id: number | null; summary: string; is_content: number; created_at: Date; user_name: string | null };

export const listActivity = (db: Db, f: { limit: number; before: number | null; userId: number | null }) => {
  const where: string[] = [];
  const params: unknown[] = [];
  if (f.before) {
    where.push(`a.id < ?`);
    params.push(f.before);
  }
  if (f.userId) {
    where.push(`a.user_id = ?`);
    params.push(f.userId);
  }
  return select<ActivityRow>(
    db,
    `SELECT a.id, a.action, a.entity_type, a.entity_id, a.summary, a.is_content, a.created_at, u.name AS user_name
       FROM activity_log a LEFT JOIN users u ON u.id = a.user_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY a.id DESC LIMIT ?`,
    [...params, f.limit],
  );
};
