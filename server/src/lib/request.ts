import type { Request } from "express";
import { badRequest, unauthorized } from "./errors.js";
import type { AuthUser } from "../modules/auth/auth.queries.js";

export const currentUser = (req: Request): AuthUser => {
  if (!req.user) throw unauthorized();
  return req.user;
};

// Numeric route parameter, e.g. /projects/:id
export const idParam = (req: Request, name = "id"): number => {
  const value = Number(req.params[name]);
  if (!Number.isInteger(value) || value <= 0) throw badRequest("Invalid id.");
  return value;
};

// Real visitor IP. Behind Vercel's rewrite the client is in x-vercel-forwarded-for;
// otherwise Express derives it from X-Forwarded-For using the TRUST_PROXY setting.
export const clientIp = (req: Request): string =>
  (req.get("x-vercel-forwarded-for")?.split(",")[0] ?? req.ip ?? "").trim();
