import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool, withTransaction } from "../../db/pool.js";
import { logActivity } from "../../lib/activity.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { currentUser, idParam } from "../../lib/request.js";
import { requiredText } from "../../lib/schema.js";
import { PASSWORD_MIN } from "../auth/auth.controller.js";
import { activeOwnerCount, deleteAllSessions, deleteUser, findUser, insertUser, listUsers, setUserPassword, updateUser, type UserRow } from "./users.queries.js";

const role = z.enum(["owner", "editor"]);
const password = z.string().min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`).max(200);

const toDto = (u: UserRow) => ({ id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.is_active === 1, lastLoginAt: u.last_login_at, createdAt: u.created_at });

export const list: RequestHandler = async (_req, res) => {
  res.json({ users: (await listUsers(pool)).map(toDto) });
};

const createSchema = z.object({ name: requiredText(120, "Name"), email: z.email("Enter a valid email address.").transform((v) => v.toLowerCase()), role, password });

export const create: RequestHandler = async (req, res) => {
  const me = currentUser(req);
  const input = createSchema.parse(req.body);
  const id = await withTransaction(async (db) => {
    const id = await insertUser(db, { name: input.name, email: input.email, role: input.role, passwordHash: await bcrypt.hash(input.password, 12) });
    await logActivity(db, { userId: me.id, action: "user.create", entityType: "user", entityId: id, summary: `Added ${input.role} ${input.name}` });
    return id;
  });
  res.status(201).json({ user: toDto((await findUser(pool, id))!) });
};

const updateSchema = z.object({ name: requiredText(120, "Name"), role, isActive: z.boolean() });

// The last active owner can never be demoted, deactivated or deleted — someone must be able to log in and manage users.
const keepsAnOwner = async (target: UserRow, next: { role: string; isActive: boolean } | null) => {
  const removesOwner = target.role === "owner" && target.is_active === 1 && (next === null || next.role !== "owner" || !next.isActive);
  if (removesOwner && (await activeOwnerCount(pool)) <= 1) throw badRequest("There must always be at least one active owner.");
};

export const update: RequestHandler = async (req, res) => {
  const me = currentUser(req);
  const id = idParam(req);
  const input = updateSchema.parse(req.body);
  const target = await findUser(pool, id);
  if (!target) throw notFound("User");
  if (id === me.id && (!input.isActive || input.role !== me.role)) throw badRequest("You cannot change your own role or deactivate yourself.");
  await keepsAnOwner(target, input);
  await withTransaction(async (db) => {
    await updateUser(db, id, input);
    if (!input.isActive) await deleteAllSessions(db, id);
    await logActivity(db, { userId: me.id, action: "user.update", entityType: "user", entityId: id, summary: `Edited user ${input.name}` });
  });
  res.json({ user: toDto((await findUser(pool, id))!) });
};

export const resetPassword: RequestHandler = async (req, res) => {
  const me = currentUser(req);
  const id = idParam(req);
  const input = z.object({ password }).parse(req.body);
  const target = await findUser(pool, id);
  if (!target) throw notFound("User");
  await withTransaction(async (db) => {
    await setUserPassword(db, id, await bcrypt.hash(input.password, 12));
    await deleteAllSessions(db, id);
    await logActivity(db, { userId: me.id, action: "user.password", entityType: "user", entityId: id, summary: `Set a new password for ${target.name}` });
  });
  res.status(204).end();
};

export const remove: RequestHandler = async (req, res) => {
  const me = currentUser(req);
  const id = idParam(req);
  if (id === me.id) throw badRequest("You cannot delete yourself.");
  const target = await findUser(pool, id);
  if (!target) throw notFound("User");
  await keepsAnOwner(target, null);
  await withTransaction(async (db) => {
    await deleteUser(db, id);
    await logActivity(db, { userId: me.id, action: "user.delete", entityType: "user", entityId: id, summary: `Deleted user ${target.name}` });
  });
  res.status(204).end();
};
