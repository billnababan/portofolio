import type { RequestHandler } from "express";
import { z } from "zod";
import { pool } from "../../db/pool.js";
import { logActivity } from "../../lib/activity.js";
import { notFound } from "../../lib/errors.js";
import { currentUser, idParam } from "../../lib/request.js";
import { PAGE_SIZE, deleteMessage, findMessage, listMessages, messageCounts, setMessageStatus, type MessageRow } from "./messages.queries.js";

const STATUSES = ["new", "read", "archived", "spam"] as const;

const toDto = (m: MessageRow) => ({
  id: m.id,
  name: m.name,
  email: m.email,
  body: m.body,
  status: m.status,
  sourcePage: m.source_page,
  createdAt: m.created_at,
  readAt: m.read_at,
});

const listQuery = z.object({
  status: z.enum(["inbox", ...STATUSES]).default("inbox"),
  q: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).default(1),
});

export const list: RequestHandler = async (req, res) => {
  const filter = listQuery.parse(req.query);
  const [rows, counts] = await Promise.all([listMessages(pool, filter), messageCounts(pool)]);
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, Number(counts.find((c) => c.status === s)?.total ?? 0)]));
  res.json({
    messages: rows.map(toDto),
    total: Number(rows[0]?.total ?? 0),
    page: filter.page,
    pageSize: PAGE_SIZE,
    counts: byStatus,
  });
};

// Opening a new message marks it read.
export const get: RequestHandler = async (req, res) => {
  const id = idParam(req);
  const row = await findMessage(pool, id);
  if (!row) throw notFound("Message");
  if (row.status === "new") await setMessageStatus(pool, id, "read");
  res.json({ message: toDto({ ...row, status: row.status === "new" ? "read" : row.status }) });
};

export const changeStatus: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = idParam(req);
  const { status } = z.object({ status: z.enum(STATUSES) }).parse(req.body);
  const row = await findMessage(pool, id);
  if (!row) throw notFound("Message");
  await setMessageStatus(pool, id, status);
  await logActivity(pool, { userId: user.id, action: "message.status", entityType: "message", entityId: id, summary: `Moved message from ${row.name} to ${status}` });
  res.status(204).end();
};

export const remove: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = idParam(req);
  const row = await findMessage(pool, id);
  if (!row) throw notFound("Message");
  await deleteMessage(pool, id);
  await logActivity(pool, { userId: user.id, action: "message.delete", entityType: "message", entityId: id, summary: `Deleted message from ${row.name}` });
  res.status(204).end();
};
