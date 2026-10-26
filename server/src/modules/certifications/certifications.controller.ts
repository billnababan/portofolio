import type { RequestHandler } from "express";
import { z } from "zod";
import { pool, withTransaction } from "../../db/pool.js";
import { logActivity } from "../../lib/activity.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { currentUser, idParam } from "../../lib/request.js";
import { idList, optionalText, optionalUrl, requiredText, slug, status } from "../../lib/schema.js";
import { findMedia } from "../media/media.queries.js";
import { variantFile } from "../media/media.storage.js";
import {
  deleteCertification,
  findCertification,
  insertCertification,
  listCertifications,
  reorderCertifications,
  setCertificationStatus,
  updateCertification,
  type CertificationRow,
} from "./certifications.queries.js";

const certificationSchema = z
  .object({
    slug,
    title: requiredText(200, "Title"),
    issuer: requiredText(200, "Issuer"),
    year: z.number({ error: "Enter the year." }).int().min(1990).max(2100),
    dateLabel: requiredText(60, "Date"),
    imageId: z.number({ error: "Choose the certificate image." }).int().positive(),
    imageAlt: requiredText(300, "Alt text"),
    linkUrl: optionalUrl,
    linkLabel: optionalText(80),
    status,
  })
  .refine((c) => c.linkUrl === "" || c.linkLabel !== "", { path: ["linkLabel"], message: "Give the link a label, e.g. “Verify on Credly”." });

const toDto = (c: CertificationRow) => ({
  id: c.id,
  slug: c.slug,
  title: c.title,
  issuer: c.issuer,
  year: c.year,
  dateLabel: c.date_label,
  imageId: c.image_id,
  imageAlt: c.image_alt,
  imageUrl: `/media/${variantFile(c.image_name, Math.min(...c.image_widths), c.image_version, "webp")}`,
  linkUrl: c.link_url,
  linkLabel: c.link_label,
  status: c.status,
  sortOrder: c.sort_order,
  updatedAt: c.updated_at,
});

const checkImage = async (imageId: number) => {
  const m = await findMedia(pool, imageId);
  if (!m || m.kind !== "image") throw badRequest("Some fields need attention.", { imageId: "Choose an image from the media library." });
};

export const list: RequestHandler = async (_req, res) => {
  res.json({ certifications: (await listCertifications(pool)).map(toDto) });
};

export const create: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const input = certificationSchema.parse(req.body);
  await checkImage(input.imageId);
  const id = await withTransaction(async (db) => {
    const id = await insertCertification(db, input);
    await logActivity(db, { userId: user.id, action: "certification.create", entityType: "certification", entityId: id, summary: `Added certification ${input.title}`, isContent: input.status === "published" });
    return id;
  });
  res.status(201).json({ certification: toDto((await findCertification(pool, id))!) });
};

export const update: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = idParam(req);
  const input = certificationSchema.parse(req.body);
  const before = await findCertification(pool, id);
  if (!before) throw notFound("Certification");
  await checkImage(input.imageId);
  await withTransaction(async (db) => {
    await updateCertification(db, id, input);
    const isContent = input.status === "published" || before.status === "published";
    await logActivity(db, { userId: user.id, action: "certification.update", entityType: "certification", entityId: id, summary: `Edited certification ${input.title}`, isContent });
  });
  res.json({ certification: toDto((await findCertification(pool, id))!) });
};

export const changeStatus: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = idParam(req);
  const body = z.object({ status }).parse(req.body);
  const row = await findCertification(pool, id);
  if (!row) throw notFound("Certification");
  await withTransaction(async (db) => {
    await setCertificationStatus(db, id, body.status);
    const verb = body.status === "published" ? "Shown on site" : "Hidden from site";
    await logActivity(db, { userId: user.id, action: "certification.status", entityType: "certification", entityId: id, summary: `${verb}: ${row.title}`, isContent: true });
  });
  res.status(204).end();
};

export const remove: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = idParam(req);
  const row = await findCertification(pool, id);
  if (!row) throw notFound("Certification");
  await withTransaction(async (db) => {
    await deleteCertification(db, id);
    await logActivity(db, { userId: user.id, action: "certification.delete", entityType: "certification", entityId: id, summary: `Deleted certification ${row.title}`, isContent: row.status === "published" });
  });
  res.status(204).end();
};

export const reorder: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const { ids } = z.object({ ids: idList }).parse(req.body);
  const existing = await listCertifications(pool);
  if (ids.length !== existing.length || !existing.every((c) => ids.includes(c.id))) {
    throw badRequest("The order must list every certification once. Reload and try again.");
  }
  await withTransaction(async (db) => {
    await reorderCertifications(db, ids);
    await logActivity(db, { userId: user.id, action: "certification.reorder", entityType: "certification", summary: "Reordered certifications", isContent: true });
  });
  res.status(204).end();
};
