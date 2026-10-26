import type { RequestHandler } from "express";
import { pool, withTransaction } from "../../db/pool.js";
import { logActivity } from "../../lib/activity.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { currentUser } from "../../lib/request.js";
import { findMedia } from "../media/media.queries.js";
import { makeOgImage } from "../media/media.storage.js";
import { getAllSettings, putSetting, settingsUpdatedAt } from "./settings.queries.js";
import { SETTING_LABELS, isSettingKey, settingsSchemas, type SettingKey } from "./settings.schema.js";

export const getAll: RequestHandler = async (_req, res) => {
  const [settings, updated] = await Promise.all([getAllSettings(pool), settingsUpdatedAt(pool)]);
  res.json({ settings, updatedAt: Object.fromEntries(updated.map((u) => [u.setting_key, u.updated_at])) });
};

// A setting that points at a file must point at the right kind of file.
const checkMedia = async (field: string, id: number, kind: "image" | "file") => {
  const m = await findMedia(pool, id);
  if (!m) throw badRequest("Some fields need attention.", { [field]: "This file no longer exists." });
  if (m.kind !== kind) throw badRequest("Some fields need attention.", { [field]: kind === "image" ? "Choose an image." : "Choose a PDF." });
  return m;
};

export const update: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const key = String(req.params.key);
  if (!isSettingKey(key)) throw notFound("Setting");
  const value = settingsSchemas[key as SettingKey].parse(req.body);

  if (key === "hero") await checkMedia("imageId", (value as { imageId: number }).imageId, "image");
  if (key === "profile") await checkMedia("cvMediaId", (value as { cvMediaId: number }).cvMediaId, "file");
  if (key === "seo") {
    const og = await checkMedia("ogImageId", (value as { ogImageId: number }).ogImageId, "image");
    await makeOgImage(og.name, og.version, og.ext);
  }

  await withTransaction(async (db) => {
    await putSetting(db, key, value, user.id);
    await logActivity(db, { userId: user.id, action: "settings.update", entityType: key, summary: `Edited ${SETTING_LABELS[key]}`, isContent: true });
  });
  res.json({ value });
};
