import type { RequestHandler } from "express";
import { z } from "zod";
import { pool, withTransaction } from "../../db/pool.js";
import { logActivity } from "../../lib/activity.js";
import { badRequest, conflict, notFound } from "../../lib/errors.js";
import { currentUser, idParam } from "../../lib/request.js";
import { slugify } from "../../lib/text.js";
import { toMediaDto } from "./media.dto.js";
import {
  deleteMedia,
  findMedia,
  findMediaUsage,
  insertMedia,
  listMedia,
  mediaNameTaken,
  replaceMediaFile,
  updateMediaAlt,
  usageCounts,
} from "./media.queries.js";
import { ACCEPTED_TYPES, processUpload, removeFiles, type Processed } from "./media.storage.js";

const uniqueName = async (base: string) => {
  let name = base;
  for (let n = 2; await mediaNameTaken(pool, name); n++) name = `${base.slice(0, 74)}-${n}`;
  return name;
};

const requireFile = (file: Express.Multer.File | undefined) => {
  if (!file) throw badRequest("Choose a file to upload.");
  if (!ACCEPTED_TYPES.includes(file.mimetype)) throw badRequest("Upload a PNG, JPEG, WebP, AVIF image or a PDF.");
  return file;
};

export const list: RequestHandler = async (_req, res) => {
  const [rows, uses] = await Promise.all([listMedia(pool), usageCounts(pool)]);
  res.json({ media: rows.map((m) => toMediaDto(m, uses.get(m.id) ?? 0)) });
};

export const usage: RequestHandler = async (req, res) => {
  const id = idParam(req);
  if (!(await findMedia(pool, id))) throw notFound("File");
  res.json({ usage: await findMediaUsage(pool, id) });
};

const uploadSchema = z.object({
  name: z.string().trim().max(80).default(""),
  alt: z.string().trim().max(300).default(""),
});

export const upload: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const file = requireFile(req.file);
  const body = uploadSchema.parse(req.body ?? {});
  const name = await uniqueName(slugify(body.name || file.originalname.replace(/\.[^.]+$/, "")) || "file");

  const p = await processUpload(name, file.mimetype, file.buffer);
  try {
    const id = await withTransaction(async (db) => {
      const id = await insertMedia(db, {
        name,
        kind: p.kind,
        originalName: file.originalname,
        mime: file.mimetype,
        ext: p.ext,
        bytes: p.bytes,
        width: p.width,
        height: p.height,
        version: p.version,
        hasAlpha: p.hasAlpha,
        widths: p.widths,
        formats: p.formats,
        alt: body.alt,
        userId: user.id,
      });
      await logActivity(db, { userId: user.id, action: "media.upload", entityType: "media", entityId: id, summary: `Uploaded ${name}` });
      return id;
    });
    const row = await findMedia(pool, id);
    res.status(201).json({ media: toMediaDto(row!, 0) });
  } catch (err) {
    await removeFiles({ ...p, name });
    throw err;
  }
};

// New file, same name: everything that uses it shows the new version after the next publish.
export const replace: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = idParam(req);
  const file = requireFile(req.file);
  const old = await findMedia(pool, id);
  if (!old) throw notFound("File");

  const p: Processed = await processUpload(old.name, file.mimetype, file.buffer);
  if (p.kind !== old.kind) {
    await removeFiles({ ...p, name: old.name });
    throw badRequest(old.kind === "file" ? "Replace a document with a PDF." : "Replace an image with an image.");
  }
  const used = (await findMediaUsage(pool, id)).length > 0;
  await withTransaction(async (db) => {
    await replaceMediaFile(db, id, {
      originalName: file.originalname,
      mime: file.mimetype,
      ext: p.ext,
      bytes: p.bytes,
      width: p.width,
      height: p.height,
      version: p.version,
      hasAlpha: p.hasAlpha,
      widths: p.widths,
      formats: p.formats,
    });
    await logActivity(db, { userId: user.id, action: "media.replace", entityType: "media", entityId: id, summary: `Replaced ${old.name}`, isContent: used });
  });
  if (old.version !== p.version) await removeFiles(old);
  const row = await findMedia(pool, id);
  res.json({ media: toMediaDto(row!, used ? 1 : 0) });
};

const altSchema = z.object({ alt: z.string().trim().max(300) });

export const updateAlt: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = idParam(req);
  const { alt } = altSchema.parse(req.body);
  const result = await updateMediaAlt(pool, id, alt);
  if (result.affectedRows === 0) throw notFound("File");
  await logActivity(pool, { userId: user.id, action: "media.update", entityType: "media", entityId: id, summary: "Edited alt text" });
  res.status(204).end();
};

export const remove: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const id = idParam(req);
  const row = await findMedia(pool, id);
  if (!row) throw notFound("File");
  const used = await findMediaUsage(pool, id);
  if (used.length > 0) throw conflict(`Still used by: ${used.map((u) => u.label).join(", ")}.`);

  await withTransaction(async (db) => {
    await deleteMedia(db, id);
    await logActivity(db, { userId: user.id, action: "media.delete", entityType: "media", entityId: id, summary: `Deleted ${row.name}` });
  });
  await removeFiles(row);
  res.status(204).end();
};
