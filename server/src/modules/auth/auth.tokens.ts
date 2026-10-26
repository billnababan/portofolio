import crypto from "node:crypto";
import type { CookieOptions } from "express";
import { env } from "../../config/env.js";

export const SESSION_COOKIE = "cms_sid";

// The browser holds a random token; the database only ever sees its SHA-256.
export const newSessionToken = () => crypto.randomBytes(32).toString("base64url");
export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const sessionCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax",
  path: "/",
  maxAge: env.SESSION_TTL_DAYS * 86_400_000,
});
