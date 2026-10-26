import { execute, select, type Db } from "../../db/pool.js";
import { settingsSchemas, type SettingKey, type Settings } from "./settings.schema.js";

export const getAllSettings = async (db: Db): Promise<Settings> => {
  const rows = await select<{ setting_key: SettingKey; value: unknown }>(db, `SELECT setting_key, value FROM settings`);
  const out: Partial<Settings> = {};
  for (const row of rows) {
    // Parsed on the way out too, so the rest of the code can trust the shape.
    (out as Record<string, unknown>)[row.setting_key] = settingsSchemas[row.setting_key].parse(row.value);
  }
  for (const key of Object.keys(settingsSchemas)) {
    if (!(key in out)) throw new Error(`settings: row "${key}" is missing. Run npm run db:seed.`);
  }
  return out as Settings;
};

export const getSetting = async <K extends SettingKey>(db: Db, key: K): Promise<Settings[K]> => {
  const rows = await select<{ value: unknown }>(db, `SELECT value FROM settings WHERE setting_key = ?`, [key]);
  if (!rows[0]) throw new Error(`settings: row "${key}" is missing. Run npm run db:seed.`);
  return settingsSchemas[key].parse(rows[0].value) as Settings[K];
};

export const putSetting = (db: Db, key: SettingKey, value: unknown, userId: number | null) =>
  execute(
    db,
    `INSERT INTO settings (setting_key, value, updated_by) VALUES (?, ?, ?) AS new
     ON DUPLICATE KEY UPDATE value = new.value, updated_by = new.updated_by`,
    [key, JSON.stringify(value), userId],
  );

export const settingsUpdatedAt = (db: Db) =>
  select<{ setting_key: string; updated_at: Date }>(db, `SELECT setting_key, updated_at FROM settings`);
