import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/errors.js";

// "steps.0.label" -> "Required" — the CMS shows each message next to its field.
const zodFields = (err: ZodError): Record<string, string> => {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
};

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Not found." });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(422).json({ error: "Some fields need attention.", fields: zodFields(err) });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, fields: err.fields });
    return;
  }
  // Body too large / malformed JSON from express.json()
  if (err?.type === "entity.too.large") {
    res.status(413).json({ error: "The request is too large." });
    return;
  }
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "The request body is not valid JSON." });
    return;
  }
  if (err?.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ error: "The file is too large." });
    return;
  }
  // MySQL constraint errors that can be explained to the user.
  if (err?.code === "ER_DUP_ENTRY") {
    res.status(409).json({ error: "That value is already used by another item." });
    return;
  }
  if (err?.code === "ER_ROW_IS_REFERENCED_2") {
    res.status(409).json({ error: "This is still used somewhere else, so it cannot be deleted." });
    return;
  }
  // Client errors raised by Express itself, e.g. a missing file under /media.
  if (err?.status >= 400 && err.status < 500) {
    res.status(err.status).json({ error: err.status === 404 ? "Not found." : err.message });
    return;
  }
  console.error(`[${req.method} ${req.originalUrl}]`, err);
  res.status(500).json({ error: "Something went wrong on the server." });
};
