import { execute, select, selectOne, type Db } from "../../db/pool.js";
import type { ProjectInput } from "./projects.schema.js";

export type ProjectRow = {
  id: number;
  slug: string;
  title: string;
  short_title: string;
  kicker: string;
  summary: string;
  note: string;
  role: string;
  featured: number;
  image_id: number;
  image_alt: string;
  source_url: string;
  live_url: string;
  status: "draft" | "published";
  sort_order: number;
  updated_at: Date;
  updated_by_name: string | null;
  image_name: string;
  image_version: string;
  image_widths: number[];
};

export type ProjectChildren = {
  stack: string[];
  stats: { value: string; label: string }[];
  steps: { label: string; text: string; flow: string[]; facts: string[]; features: { title: string; text: string }[] }[];
};

const COLUMNS = `p.id, p.slug, p.title, p.short_title, p.kicker, p.summary, p.note, p.role, p.featured, p.image_id, p.image_alt,
                 p.source_url, p.live_url, p.status, p.sort_order, p.updated_at, u.name AS updated_by_name,
                 m.name AS image_name, m.version AS image_version, m.widths AS image_widths`;

const FROM = `FROM projects p
              JOIN media m ON m.id = p.image_id
              LEFT JOIN users u ON u.id = p.updated_by`;

export const listProjects = (db: Db, onlyPublished = false) =>
  select<ProjectRow>(db, `SELECT ${COLUMNS} ${FROM} ${onlyPublished ? "WHERE p.status = 'published'" : ""} ORDER BY p.sort_order, p.id`);

export const findProject = (db: Db, id: number) => selectOne<ProjectRow>(db, `SELECT ${COLUMNS} ${FROM} WHERE p.id = ?`, [id]);

// Stack, stats, steps and step items for many projects in four queries.
export const loadChildren = async (db: Db, ids: number[]): Promise<Map<number, ProjectChildren>> => {
  const out = new Map<number, ProjectChildren>(ids.map((id) => [id, { stack: [], stats: [], steps: [] }]));
  if (ids.length === 0) return out;

  const stack = await select<{ project_id: number; label: string }>(
    db,
    `SELECT project_id, label FROM project_stack WHERE project_id IN (?) ORDER BY sort_order, id`,
    [ids],
  );
  const stats = await select<{ project_id: number; value: string; label: string }>(
    db,
    `SELECT project_id, value, label FROM project_stats WHERE project_id IN (?) ORDER BY sort_order, id`,
    [ids],
  );
  const steps = await select<{ id: number; project_id: number; label: string; body: string }>(
    db,
    `SELECT id, project_id, label, body FROM project_steps WHERE project_id IN (?) ORDER BY sort_order, id`,
    [ids],
  );
  const stepIds = steps.map((s) => s.id);
  const items =
    stepIds.length === 0
      ? []
      : await select<{ step_id: number; kind: "flow" | "fact" | "feature"; title: string; body: string }>(
          db,
          `SELECT step_id, kind, title, body FROM project_step_items WHERE step_id IN (?) ORDER BY sort_order, id`,
          [stepIds],
        );

  for (const s of stack) out.get(s.project_id)?.stack.push(s.label);
  for (const s of stats) out.get(s.project_id)?.stats.push({ value: s.value, label: s.label });
  const stepById = new Map<number, ProjectChildren["steps"][number]>();
  for (const s of steps) {
    const step = { label: s.label, text: s.body, flow: [] as string[], facts: [] as string[], features: [] as { title: string; text: string }[] };
    stepById.set(s.id, step);
    out.get(s.project_id)?.steps.push(step);
  }
  for (const it of items) {
    const step = stepById.get(it.step_id);
    if (!step) continue;
    if (it.kind === "flow") step.flow.push(it.title);
    if (it.kind === "fact") step.facts.push(it.body);
    if (it.kind === "feature") step.features.push({ title: it.title, text: it.body });
  }
  return out;
};

const projectValues = (p: ProjectInput) => [
  p.slug,
  p.title,
  p.shortTitle,
  p.kicker,
  p.summary,
  p.note,
  p.role,
  p.featured ? 1 : 0,
  p.imageId,
  p.imageAlt,
  p.sourceUrl,
  p.liveUrl,
  p.status,
];

export const insertProject = async (db: Db, p: ProjectInput, userId: number) => {
  // New projects go to the end of the list.
  const result = await execute(
    db,
    `INSERT INTO projects (slug, title, short_title, kicker, summary, note, role, featured, image_id, image_alt, source_url, live_url, status,
                           sort_order, created_by, updated_by)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(MAX(sort_order), 0) + 1, ?, ? FROM projects`,
    [...projectValues(p), userId, userId],
  );
  return result.insertId;
};

export const updateProject = (db: Db, id: number, p: ProjectInput, userId: number) =>
  execute(
    db,
    `UPDATE projects
        SET slug = ?, title = ?, short_title = ?, kicker = ?, summary = ?, note = ?, role = ?, featured = ?, image_id = ?, image_alt = ?,
            source_url = ?, live_url = ?, status = ?, updated_by = ?
      WHERE id = ?`,
    [...projectValues(p), userId, id],
  );

// Children are replaced as a whole: simpler than diffing, and it runs inside the save transaction.
export const replaceChildren = async (db: Db, projectId: number, p: ProjectInput) => {
  await execute(db, `DELETE FROM project_stack WHERE project_id = ?`, [projectId]);
  await execute(db, `DELETE FROM project_stats WHERE project_id = ?`, [projectId]);
  await execute(db, `DELETE FROM project_steps WHERE project_id = ?`, [projectId]);

  if (p.stack.length > 0) {
    await execute(db, `INSERT INTO project_stack (project_id, label, sort_order) VALUES ?`, [p.stack.map((label, i) => [projectId, label, i])]);
  }
  if (p.stats.length > 0) {
    await execute(db, `INSERT INTO project_stats (project_id, value, label, sort_order) VALUES ?`, [
      p.stats.map((s, i) => [projectId, s.value, s.label, i]),
    ]);
  }
  for (const [i, step] of p.steps.entries()) {
    const { insertId: stepId } = await execute(db, `INSERT INTO project_steps (project_id, label, body, sort_order) VALUES (?, ?, ?, ?)`, [
      projectId,
      step.label,
      step.text,
      i,
    ]);
    const items = [
      ...step.flow.map((title, k) => [stepId, "flow", title, "", k]),
      ...step.facts.map((body, k) => [stepId, "fact", "", body, k]),
      ...step.features.map((f, k) => [stepId, "feature", f.title, f.text, k]),
    ];
    if (items.length > 0) await execute(db, `INSERT INTO project_step_items (step_id, kind, title, body, sort_order) VALUES ?`, [items]);
  }
};

export const setProjectStatus = (db: Db, id: number, status: "draft" | "published", userId: number) =>
  execute(db, `UPDATE projects SET status = ?, updated_by = ? WHERE id = ?`, [status, userId, id]);

export const deleteProject = (db: Db, id: number) => execute(db, `DELETE FROM projects WHERE id = ?`, [id]);

export const reorderProjects = async (db: Db, ids: number[]) => {
  for (const [i, id] of ids.entries()) await execute(db, `UPDATE projects SET sort_order = ? WHERE id = ?`, [i + 1, id]);
};

export const countProjects = (db: Db) =>
  select<{ status: string; featured: number; total: number }>(db, `SELECT status, featured, COUNT(*) AS total FROM projects GROUP BY status, featured`);
