import { execute, select, selectOne, type Db } from "../../db/pool.js";

export type SkillGroup = { id: number; title: string; subtitle: string; sort_order: number; updated_at: Date };
export type SkillGroupInput = { title: string; subtitle: string; items: { name: string; tag: string }[] };

export const listGroups = async (db: Db) => {
  const groups = await select<SkillGroup>(db, `SELECT id, title, subtitle, sort_order, updated_at FROM skill_groups ORDER BY sort_order, id`);
  const items = await select<{ group_id: number; name: string; tag: string }>(db, `SELECT group_id, name, tag FROM skills ORDER BY sort_order, id`);
  return groups.map((g) => ({
    id: g.id,
    title: g.title,
    subtitle: g.subtitle,
    sortOrder: g.sort_order,
    updatedAt: g.updated_at,
    items: items.filter((i) => i.group_id === g.id).map((i) => ({ name: i.name, tag: i.tag })),
  }));
};

export const findGroup = (db: Db, id: number) => selectOne<SkillGroup>(db, `SELECT id, title, subtitle, sort_order, updated_at FROM skill_groups WHERE id = ?`, [id]);

export const insertGroup = async (db: Db, g: SkillGroupInput) => {
  const result = await execute(
    db,
    `INSERT INTO skill_groups (title, subtitle, sort_order)
     SELECT ?, ?, COALESCE(MAX(sort_order), 0) + 1 FROM skill_groups`,
    [g.title, g.subtitle],
  );
  return result.insertId;
};

export const updateGroup = (db: Db, id: number, g: SkillGroupInput) =>
  execute(db, `UPDATE skill_groups SET title = ?, subtitle = ? WHERE id = ?`, [g.title, g.subtitle, id]);

export const replaceItems = async (db: Db, groupId: number, items: SkillGroupInput["items"]) => {
  await execute(db, `DELETE FROM skills WHERE group_id = ?`, [groupId]);
  if (items.length > 0) {
    await execute(db, `INSERT INTO skills (group_id, name, tag, sort_order) VALUES ?`, [items.map((it, i) => [groupId, it.name, it.tag, i])]);
  }
};

export const deleteGroup = (db: Db, id: number) => execute(db, `DELETE FROM skill_groups WHERE id = ?`, [id]);

export const reorderGroups = async (db: Db, ids: number[]) => {
  for (const [i, id] of ids.entries()) await execute(db, `UPDATE skill_groups SET sort_order = ? WHERE id = ?`, [i + 1, id]);
};
