import type { RequestHandler } from "express";
import { z } from "zod";
import { pool, withTransaction } from "../../db/pool.js";
import { logActivity } from "../../lib/activity.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { currentUser, idParam } from "../../lib/request.js";
import { idList, optionalText, requiredText } from "../../lib/schema.js";
import { deleteGroup, findGroup, insertGroup, listGroups, reorderGroups, replaceItems, updateGroup } from "./skills.queries.js";

const groupSchema = z.object({
  title: requiredText(80, "Title"),
  subtitle: optionalText(160),
  items: z.array(z.object({ name: requiredText(60, "Skill"), tag: optionalText(40) })).max(20, "Up to 20 skills per layer."),
});

export const list: RequestHandler = async (_req, res) => {
  res.json({ groups: await listGroups(pool) });
};

export const create: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const input = groupSchema.parse(req.body);
  const id = await withTransaction(async (db) => {
    const id = await insertGroup(db, input);
    await replaceItems(db, id, input.items);
    await logActivity(db, { userId: user.id, action: "skills.create", entityType: "skill_group", entityId: id, summary: `Added skill layer ${input.title}`, isContent: true });
    return id;
  });
  res.status(201).json({ id });
};

export const update: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = idParam(req);
  const input = groupSchema.parse(req.body);
  if (!(await findGroup(pool, id))) throw notFound("Skill layer");
  await withTransaction(async (db) => {
    await updateGroup(db, id, input);
    await replaceItems(db, id, input.items);
    await logActivity(db, { userId: user.id, action: "skills.update", entityType: "skill_group", entityId: id, summary: `Edited skill layer ${input.title}`, isContent: true });
  });
  res.status(204).end();
};

export const remove: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = idParam(req);
  const group = await findGroup(pool, id);
  if (!group) throw notFound("Skill layer");
  await withTransaction(async (db) => {
    await deleteGroup(db, id);
    await logActivity(db, { userId: user.id, action: "skills.delete", entityType: "skill_group", entityId: id, summary: `Deleted skill layer ${group.title}`, isContent: true });
  });
  res.status(204).end();
};

export const reorder: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const { ids } = z.object({ ids: idList }).parse(req.body);
  const existing = await listGroups(pool);
  if (ids.length !== existing.length || !existing.every((g) => ids.includes(g.id))) {
    throw badRequest("The order must list every layer once. Reload and try again.");
  }
  await withTransaction(async (db) => {
    await reorderGroups(db, ids);
    await logActivity(db, { userId: user.id, action: "skills.reorder", entityType: "skill_group", summary: "Reordered skill layers", isContent: true });
  });
  res.status(204).end();
};
