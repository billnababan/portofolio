import type { RequestHandler } from "express";
import { z } from "zod";
import { pool, withTransaction } from "../../db/pool.js";
import { logActivity } from "../../lib/activity.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { currentUser, idParam } from "../../lib/request.js";
import { idList, status } from "../../lib/schema.js";
import { findMedia } from "../media/media.queries.js";
import { variantFile } from "../media/media.storage.js";
import {
  deleteProject,
  findProject,
  insertProject,
  listProjects,
  loadChildren,
  reorderProjects,
  replaceChildren,
  setProjectStatus,
  updateProject,
  type ProjectChildren,
  type ProjectRow,
} from "./projects.queries.js";
import { projectSchema, type ProjectInput } from "./projects.schema.js";

const toDto = (p: ProjectRow, c: ProjectChildren) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  shortTitle: p.short_title,
  kicker: p.kicker,
  summary: p.summary,
  note: p.note,
  role: p.role,
  featured: p.featured === 1,
  imageId: p.image_id,
  imageAlt: p.image_alt,
  imageUrl: `/media/${variantFile(p.image_name, Math.min(...p.image_widths), p.image_version, "webp")}`,
  sourceUrl: p.source_url,
  liveUrl: p.live_url,
  status: p.status,
  sortOrder: p.sort_order,
  updatedAt: p.updated_at,
  updatedBy: p.updated_by_name,
  ...c,
});

const checkImage = async (input: ProjectInput) => {
  const m = await findMedia(pool, input.imageId);
  if (!m || m.kind !== "image") throw badRequest("Some fields need attention.", { imageId: "Choose an image from the media library." });
};

export const list: RequestHandler = async (_req, res) => {
  const rows = await listProjects(pool);
  const children = await loadChildren(pool, rows.map((r) => r.id));
  res.json({ projects: rows.map((r) => toDto(r, children.get(r.id)!)) });
};

export const get: RequestHandler = async (req, res) => {
  const row = await findProject(pool, idParam(req));
  if (!row) throw notFound("Project");
  const children = await loadChildren(pool, [row.id]);
  res.json({ project: toDto(row, children.get(row.id)!) });
};

export const create: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const input = projectSchema.parse(req.body);
  await checkImage(input);
  const id = await withTransaction(async (db) => {
    const id = await insertProject(db, input, user.id);
    await replaceChildren(db, id, input);
    await logActivity(db, { userId: user.id, action: "project.create", entityType: "project", entityId: id, summary: `Added project ${input.title}`, isContent: input.status === "published" });
    return id;
  });
  const row = await findProject(pool, id);
  res.status(201).json({ project: toDto(row!, (await loadChildren(pool, [id])).get(id)!) });
};

export const update: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = idParam(req);
  const input = projectSchema.parse(req.body);
  const before = await findProject(pool, id);
  if (!before) throw notFound("Project");
  await checkImage(input);
  await withTransaction(async (db) => {
    await updateProject(db, id, input, user.id);
    await replaceChildren(db, id, input);
    // A draft that stays a draft does not change the live site.
    const isContent = input.status === "published" || before.status === "published";
    await logActivity(db, { userId: user.id, action: "project.update", entityType: "project", entityId: id, summary: `Edited project ${input.title}`, isContent });
  });
  const row = await findProject(pool, id);
  res.json({ project: toDto(row!, (await loadChildren(pool, [id])).get(id)!) });
};

const statusSchema = z.object({ status });

export const changeStatus: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = idParam(req);
  const body = statusSchema.parse(req.body);
  const row = await findProject(pool, id);
  if (!row) throw notFound("Project");
  await withTransaction(async (db) => {
    await setProjectStatus(db, id, body.status, user.id);
    const verb = body.status === "published" ? "Shown on site" : "Hidden from site";
    await logActivity(db, { userId: user.id, action: "project.status", entityType: "project", entityId: id, summary: `${verb}: ${row.title}`, isContent: true });
  });
  res.status(204).end();
};

export const remove: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = idParam(req);
  const row = await findProject(pool, id);
  if (!row) throw notFound("Project");
  await withTransaction(async (db) => {
    await deleteProject(db, id);
    await logActivity(db, { userId: user.id, action: "project.delete", entityType: "project", entityId: id, summary: `Deleted project ${row.title}`, isContent: row.status === "published" });
  });
  res.status(204).end();
};

export const reorder: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const { ids } = z.object({ ids: idList }).parse(req.body);
  const existing = await listProjects(pool);
  if (ids.length !== existing.length || !existing.every((p) => ids.includes(p.id))) {
    throw badRequest("The order must list every project once. Reload and try again.");
  }
  await withTransaction(async (db) => {
    await reorderProjects(db, ids);
    await logActivity(db, { userId: user.id, action: "project.reorder", entityType: "project", summary: "Reordered projects", isContent: true });
  });
  res.status(204).end();
};
