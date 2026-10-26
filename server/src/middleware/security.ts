import type { RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import { badRequest } from "../lib/errors.js";

// The CMS sends `X-CMS: 1` on every write. A page on another site cannot add a
// custom header without a CORS preflight, which this API never grants, so this
// (with SameSite=Lax cookies) blocks cross-site request forgery.
export const requireCmsHeader: RequestHandler = (req, _res, next) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();
  if (req.get("x-cms") !== "1") return next(badRequest("Missing X-CMS header."));
  next();
};

const limiter = (windowMinutes: number, limit: number, message: string) =>
  rateLimit({
    windowMs: windowMinutes * 60_000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: message },
  });

export const loginLimiter = limiter(15, 10, "Too many login attempts. Try again in 15 minutes.");
export const contactLimiter = limiter(10, 5, "Too many messages. Try again later.");
export const trackLimiter = limiter(1, 120, "Too many requests.");
