import { execute, select, selectOne, type Db } from "../../db/pool.js";

export type MessageStatus = "new" | "read" | "archived" | "spam";

export type MessageRow = {
  id: number;
  name: string;
  email: string;
  body: string;
  status: MessageStatus;
  source_page: string;
  created_at: Date;
  read_at: Date | null;
};

const PAGE_SIZE = 25;

// The inbox list: "inbox" means new + read; search matches name, email and text.
export const listMessages = (db: Db, f: { status: MessageStatus | "inbox"; q: string; page: number }) => {
  const where: string[] = [];
  const params: unknown[] = [];
  if (f.status === "inbox") where.push(`status IN ('new', 'read')`);
  else {
    where.push(`status = ?`);
    params.push(f.status);
  }
  if (f.q !== "") {
    where.push(`(name LIKE ? OR email LIKE ? OR body LIKE ?)`);
    const like = `%${f.q.replace(/[%_\\]/g, "\\$&")}%`;
    params.push(like, like, like);
  }
  return select<MessageRow & { total: number }>(
    db,
    `SELECT id, name, email, body, status, source_page, created_at, read_at, COUNT(*) OVER () AS total
       FROM messages
      WHERE ${where.join(" AND ")}
      ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, (f.page - 1) * PAGE_SIZE],
  );
};

export const messageCounts = (db: Db) =>
  select<{ status: MessageStatus; total: number }>(db, `SELECT status, COUNT(*) AS total FROM messages GROUP BY status`);

export const findMessage = (db: Db, id: number) =>
  selectOne<MessageRow>(db, `SELECT id, name, email, body, status, source_page, created_at, read_at FROM messages WHERE id = ?`, [id]);

export const setMessageStatus = (db: Db, id: number, status: MessageStatus) =>
  execute(
    db,
    `UPDATE messages SET status = ?, read_at = IF(? = 'read' AND read_at IS NULL, UTC_TIMESTAMP(), read_at) WHERE id = ?`,
    [status, status, id],
  );

export const deleteMessage = (db: Db, id: number) => execute(db, `DELETE FROM messages WHERE id = ?`, [id]);

export const insertMessage = async (db: Db, m: { name: string; email: string; body: string; sourcePage: string; visitor: string; userAgent: string }) => {
  const result = await execute(
    db,
    `INSERT INTO messages (name, email, body, source_page, visitor, user_agent) VALUES (?, ?, ?, ?, ?, ?)`,
    [m.name, m.email, m.body, m.sourcePage.slice(0, 255), m.visitor, m.userAgent.slice(0, 255)],
  );
  return result.insertId;
};

export const latestMessages = (db: Db, limit: number) =>
  select<MessageRow>(
    db,
    `SELECT id, name, email, body, status, source_page, created_at, read_at
       FROM messages WHERE status IN ('new', 'read') ORDER BY created_at DESC LIMIT ?`,
    [limit],
  );

export { PAGE_SIZE };
