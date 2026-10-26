import { execute, select, selectOne, type Db } from "../../db/pool.js";
import type { Role } from "../auth/auth.queries.js";

export type UserRow = { id: number; name: string; email: string; role: Role; is_active: number; last_login_at: Date | null; created_at: Date };

const COLUMNS = `id, name, email, role, is_active, last_login_at, created_at`;

export const listUsers = (db: Db) => select<UserRow>(db, `SELECT ${COLUMNS} FROM users ORDER BY role = 'owner' DESC, name`);

export const findUser = (db: Db, id: number) => selectOne<UserRow>(db, `SELECT ${COLUMNS} FROM users WHERE id = ?`, [id]);

export const insertUser = async (db: Db, u: { name: string; email: string; role: Role; passwordHash: string }) => {
  const result = await execute(db, `INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)`, [u.name, u.email, u.role, u.passwordHash]);
  return result.insertId;
};

export const updateUser = (db: Db, id: number, u: { name: string; role: Role; isActive: boolean }) =>
  execute(db, `UPDATE users SET name = ?, role = ?, is_active = ? WHERE id = ?`, [u.name, u.role, u.isActive ? 1 : 0, id]);

export const setUserPassword = (db: Db, id: number, hash: string) => execute(db, `UPDATE users SET password_hash = ? WHERE id = ?`, [hash, id]);

export const deleteUser = (db: Db, id: number) => execute(db, `DELETE FROM users WHERE id = ?`, [id]);

export const deleteAllSessions = (db: Db, userId: number) => execute(db, `DELETE FROM sessions WHERE user_id = ?`, [userId]);

export const activeOwnerCount = async (db: Db) =>
  Number((await selectOne<{ total: number }>(db, `SELECT COUNT(*) AS total FROM users WHERE role = 'owner' AND is_active = 1`))?.total ?? 0);
