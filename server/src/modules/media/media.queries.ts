import { execute, select, selectOne, type Db } from "../../db/pool.js";

export type MediaRow = {
  id: number;
  name: string;
  kind: "image" | "file";
  original_name: string;
  mime: string;
  ext: string;
  bytes: number;
  width: number | null;
  height: number | null;
  version: string;
  has_alpha: number;
  widths: number[] | null;
  formats: string[] | null;
  alt: string;
  created_at: Date;
  updated_at: Date;
  created_by_name: string | null;
};

const COLUMNS = `m.id, m.name, m.kind, m.original_name, m.mime, m.ext, m.bytes, m.width, m.height, m.version,
                 m.has_alpha, m.widths, m.formats, m.alt, m.created_at, m.updated_at, u.name AS created_by_name`;

export const listMedia = (db: Db) =>
  select<MediaRow>(db, `SELECT ${COLUMNS} FROM media m LEFT JOIN users u ON u.id = m.created_by ORDER BY m.created_at DESC, m.id DESC`);

export const findMedia = (db: Db, id: number) =>
  selectOne<MediaRow>(db, `SELECT ${COLUMNS} FROM media m LEFT JOIN users u ON u.id = m.created_by WHERE m.id = ?`, [id]);

export const findMediaByIds = (db: Db, ids: number[]) =>
  ids.length === 0
    ? Promise.resolve([] as MediaRow[])
    : select<MediaRow>(db, `SELECT ${COLUMNS} FROM media m LEFT JOIN users u ON u.id = m.created_by WHERE m.id IN (?)`, [ids]);

export const mediaNameTaken = async (db: Db, name: string) =>
  (await selectOne<{ id: number }>(db, `SELECT id FROM media WHERE name = ?`, [name])) !== null;

type NewMedia = {
  name: string;
  kind: "image" | "file";
  originalName: string;
  mime: string;
  ext: string;
  bytes: number;
  width: number | null;
  height: number | null;
  version: string;
  hasAlpha: boolean;
  widths: number[] | null;
  formats: string[] | null;
  alt: string;
  userId: number | null;
};

export const insertMedia = async (db: Db, m: NewMedia) => {
  const result = await execute(
    db,
    `INSERT INTO media (name, kind, original_name, mime, ext, bytes, width, height, version, has_alpha, widths, formats, alt, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      m.name,
      m.kind,
      m.originalName.slice(0, 255),
      m.mime,
      m.ext,
      m.bytes,
      m.width,
      m.height,
      m.version,
      m.hasAlpha ? 1 : 0,
      m.widths ? JSON.stringify(m.widths) : null,
      m.formats ? JSON.stringify(m.formats) : null,
      m.alt,
      m.userId,
    ],
  );
  return result.insertId;
};

export const replaceMediaFile = (db: Db, id: number, m: Omit<NewMedia, "name" | "alt" | "userId" | "kind">) =>
  execute(
    db,
    `UPDATE media
        SET original_name = ?, mime = ?, ext = ?, bytes = ?, width = ?, height = ?, version = ?, has_alpha = ?, widths = ?, formats = ?
      WHERE id = ?`,
    [
      m.originalName.slice(0, 255),
      m.mime,
      m.ext,
      m.bytes,
      m.width,
      m.height,
      m.version,
      m.hasAlpha ? 1 : 0,
      m.widths ? JSON.stringify(m.widths) : null,
      m.formats ? JSON.stringify(m.formats) : null,
      id,
    ],
  );

export const updateMediaAlt = (db: Db, id: number, alt: string) => execute(db, `UPDATE media SET alt = ? WHERE id = ?`, [alt, id]);

export const deleteMedia = (db: Db, id: number) => execute(db, `DELETE FROM media WHERE id = ?`, [id]);

export type MediaUse = { type: "project" | "certification" | "setting"; id: number | null; label: string };

// Where an item is used: as a project or certificate image (enforced by foreign keys),
// or in settings — hero portrait, share image, CV (checked here because they are JSON).
export const findMediaUsage = async (db: Db, mediaId: number): Promise<MediaUse[]> => {
  const projects = await select<{ id: number; title: string }>(db, `SELECT id, title FROM projects WHERE image_id = ?`, [mediaId]);
  const certs = await select<{ id: number; title: string }>(db, `SELECT id, title FROM certifications WHERE image_id = ?`, [mediaId]);
  const settings = await select<{ setting_key: string }>(
    db,
    `SELECT setting_key FROM settings
      WHERE (setting_key = 'hero' AND JSON_EXTRACT(value, '$.imageId') = ?)
         OR (setting_key = 'seo' AND JSON_EXTRACT(value, '$.ogImageId') = ?)
         OR (setting_key = 'profile' AND JSON_EXTRACT(value, '$.cvMediaId') = ?)`,
    [mediaId, mediaId, mediaId],
  );
  const settingLabel: Record<string, string> = { hero: "Hero portrait", seo: "Share image (SEO)", profile: "CV download" };
  return [
    ...projects.map((p) => ({ type: "project" as const, id: p.id, label: p.title })),
    ...certs.map((c) => ({ type: "certification" as const, id: c.id, label: c.title })),
    ...settings.map((s) => ({ type: "setting" as const, id: null, label: settingLabel[s.setting_key] ?? s.setting_key })),
  ];
};

export const usageCounts = async (db: Db): Promise<Map<number, number>> => {
  const rows = await select<{ media_id: number; uses: number }>(
    db,
    `SELECT media_id, COUNT(*) AS uses FROM (
        SELECT image_id AS media_id FROM projects
        UNION ALL SELECT image_id FROM certifications
        UNION ALL SELECT CAST(JSON_EXTRACT(value, '$.imageId') AS UNSIGNED) FROM settings WHERE setting_key = 'hero'
        UNION ALL SELECT CAST(JSON_EXTRACT(value, '$.ogImageId') AS UNSIGNED) FROM settings WHERE setting_key = 'seo'
        UNION ALL SELECT CAST(JSON_EXTRACT(value, '$.cvMediaId') AS UNSIGNED) FROM settings WHERE setting_key = 'profile'
     ) used
     WHERE media_id IS NOT NULL
     GROUP BY media_id`,
  );
  return new Map(rows.map((r) => [r.media_id, Number(r.uses)]));
};
