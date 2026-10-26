import type { RequestHandler } from "express";
import { pool } from "../db/pool.js";
import { forbidden, unauthorized } from "../lib/errors.js";
import { findSessionUser, touchSession } from "../modules/auth/auth.queries.js";
import { SESSION_COOKIE, hashToken } from "../modules/auth/auth.tokens.js";

const TOUCH_AFTER_MS = 5 * 60_000;

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string" || token === "") return next(unauthorized());

  const sessionId = hashToken(token);
  const row = await findSessionUser(pool, sessionId);
  if (!row) return next(unauthorized("Your session has ended. Log in again."));

  // Record activity at most every few minutes, not on every request.
  if (Date.now() - new Date(row.last_seen_at).getTime() > TOUCH_AFTER_MS) await touchSession(pool, sessionId);

  req.user = { id: row.id, name: row.name, email: row.email, role: row.role };
  req.sessionId = sessionId;
  next();
};

export const requireOwner: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== "owner") return next(forbidden("Only the owner can do this."));
  next();
};
