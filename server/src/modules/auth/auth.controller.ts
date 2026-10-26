import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { env, integrations } from "../../config/env.js";
import { pool, withTransaction } from "../../db/pool.js";
import { logActivity } from "../../lib/activity.js";
import { badRequest, notFound, unauthorized } from "../../lib/errors.js";
import { clientIp, currentUser } from "../../lib/request.js";
import {
  deleteOtherSessions,
  deleteSession,
  deleteUserSession,
  findPasswordHash,
  findUserForLogin,
  insertSession,
  listSessions,
  markLogin,
  updatePasswordHash,
} from "./auth.queries.js";
import { SESSION_COOKIE, hashToken, newSessionToken, sessionCookieOptions } from "./auth.tokens.js";

// Compared against when the email does not exist, so a wrong email and a wrong
// password take the same time to answer.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export const PASSWORD_MIN = 10;

const loginSchema = z.object({
  email: z.email().transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Enter your password."),
});

export const login: RequestHandler = async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await findUserForLogin(pool, email);
  const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !ok || !user.is_active) throw unauthorized("Wrong email or password.");

  const token = newSessionToken();
  await withTransaction(async (db) => {
    await insertSession(db, {
      id: hashToken(token),
      userId: user.id,
      ip: clientIp(req),
      userAgent: req.get("user-agent") ?? "",
      ttlDays: env.SESSION_TTL_DAYS,
    });
    await markLogin(db, user.id);
    await logActivity(db, { userId: user.id, action: "auth.login", summary: "Logged in" });
  });

  res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

export const logout: RequestHandler = async (req, res) => {
  if (req.sessionId) await deleteSession(pool, req.sessionId);
  res.clearCookie(SESSION_COOKIE, { ...sessionCookieOptions(), maxAge: undefined });
  res.status(204).end();
};

export const me: RequestHandler = (req, res) => {
  res.json({ user: currentUser(req), integrations, siteUrl: env.siteUrl });
};

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z.string().min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`).max(200),
});

export const changePassword: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const body = passwordSchema.parse(req.body);
  const hash = await findPasswordHash(pool, user.id);
  if (!hash || !(await bcrypt.compare(body.currentPassword, hash))) {
    throw badRequest("Some fields need attention.", { currentPassword: "This is not your current password." });
  }
  await withTransaction(async (db) => {
    await updatePasswordHash(db, user.id, await bcrypt.hash(body.newPassword, 12));
    // Other devices have to log in again with the new password.
    await deleteOtherSessions(db, user.id, req.sessionId ?? "");
    await logActivity(db, { userId: user.id, action: "auth.password", summary: "Changed password" });
  });
  res.status(204).end();
};

export const sessions: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const rows = await listSessions(pool, user.id);
  res.json({ sessions: rows.map((s) => ({ ...s, current: s.id === req.sessionId })) });
};

export const revokeSession: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = String(req.params.id);
  if (id === req.sessionId) throw badRequest("Use Log out to end the session you are using.");
  const result = await deleteUserSession(pool, user.id, id);
  if (result.affectedRows === 0) throw notFound("Session");
  res.status(204).end();
};
