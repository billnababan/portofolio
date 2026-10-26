import { execute, type Db } from "../db/pool.js";

// Content actions change what the public site shows; the Publish page lists the ones
// made since the last publish. Other actions (login, user management) are audit only.
type Activity = {
  userId: number | null;
  action: string;
  entityType?: string;
  entityId?: number | null;
  summary: string;
  isContent?: boolean;
};

export const logActivity = async (db: Db, a: Activity): Promise<void> => {
  await execute(
    db,
    `INSERT INTO activity_log (user_id, action, entity_type, entity_id, summary, is_content)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [a.userId, a.action, a.entityType ?? "", a.entityId ?? null, a.summary.slice(0, 255), a.isContent ? 1 : 0],
  );
};
