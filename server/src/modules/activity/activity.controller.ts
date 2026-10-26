import type { RequestHandler } from "express";
import { z } from "zod";
import { pool } from "../../db/pool.js";
import { listActivity, type ActivityRow } from "./activity.queries.js";

export const activityDto = (a: ActivityRow) => ({
  id: a.id,
  action: a.action,
  entityType: a.entity_type,
  entityId: a.entity_id,
  summary: a.summary,
  isContent: a.is_content === 1,
  user: a.user_name,
  createdAt: a.created_at,
});

const query = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.coerce.number().int().positive().nullable().default(null),
  userId: z.coerce.number().int().positive().nullable().default(null),
});

export const list: RequestHandler = async (req, res) => {
  const f = query.parse(req.query);
  const rows = await listActivity(pool, f);
  res.json({ activity: rows.map(activityDto), nextBefore: rows.length === f.limit ? rows[rows.length - 1]!.id : null });
};
