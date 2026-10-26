import { execute, select, selectOne, type Db } from "../../db/pool.js";

export type Role = "owner" | "editor";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

type UserWithHash = AuthUser & { password_hash: string; is_active: number };

type SessionUser = AuthUser & { session_id: string; last_seen_at: Date };

export type SessionRow = {
  id: string;
  ip: string;
  user_agent: string;
  created_at: Date;
  last_seen_at: Date;
  expires_at: Date;
};

export const findUserForLogin = (db: Db, email: string) =>
  selectOne<UserWithHash>(
    db,
    `SELECT id, name, email, role, password_hash, is_active
       FROM users
      WHERE email = ?`,
    [email],
  );

export const findPasswordHash = async (db: Db, userId: number) => {
  const row = await selectOne<{ password_hash: string }>(db, `SELECT password_hash FROM users WHERE id = ?`, [userId]);
  return row?.password_hash ?? null;
};

export const updatePasswordHash = (db: Db, userId: number, hash: string) =>
  execute(db, `UPDATE users SET password_hash = ? WHERE id = ?`, [hash, userId]);

export const markLogin = (db: Db, userId: number) =>
  execute(db, `UPDATE users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?`, [userId]);

export const insertSession = (db: Db, s: { id: string; userId: number; ip: string; userAgent: string; ttlDays: number }) =>
  execute(
    db,
    `INSERT INTO sessions (id, user_id, ip, user_agent, expires_at)
     VALUES (?, ?, ?, ?, UTC_TIMESTAMP() + INTERVAL ? DAY)`,
    [s.id, s.userId, s.ip.slice(0, 45), s.userAgent.slice(0, 255), s.ttlDays],
  );

export const findSessionUser = (db: Db, sessionId: string) =>
  selectOne<SessionUser>(
    db,
    `SELECT s.id AS session_id, s.last_seen_at, u.id, u.name, u.email, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = ?
        AND s.expires_at > UTC_TIMESTAMP()
        AND u.is_active = 1`,
    [sessionId],
  );

export const touchSession = (db: Db, sessionId: string) =>
  execute(db, `UPDATE sessions SET last_seen_at = UTC_TIMESTAMP() WHERE id = ?`, [sessionId]);

export const deleteSession = (db: Db, sessionId: string) => execute(db, `DELETE FROM sessions WHERE id = ?`, [sessionId]);

export const deleteUserSession = (db: Db, userId: number, sessionId: string) =>
  execute(db, `DELETE FROM sessions WHERE id = ? AND user_id = ?`, [sessionId, userId]);

export const deleteOtherSessions = (db: Db, userId: number, keepSessionId: string) =>
  execute(db, `DELETE FROM sessions WHERE user_id = ? AND id <> ?`, [userId, keepSessionId]);

export const listSessions = (db: Db, userId: number) =>
  select<SessionRow>(
    db,
    `SELECT id, ip, user_agent, created_at, last_seen_at, expires_at
       FROM sessions
      WHERE user_id = ? AND expires_at > UTC_TIMESTAMP()
      ORDER BY last_seen_at DESC`,
    [userId],
  );
