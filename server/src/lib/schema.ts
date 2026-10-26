import { z } from "zod";
import { SLUG_RE } from "./text.js";

// Field builders shared by the content schemas, with messages written for the editor.
export const requiredText = (max: number, label = "This") =>
  z.string().trim().min(1, `${label} is required.`).max(max, `Keep it under ${max} characters.`);

export const optionalText = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters.`).default("");

export const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "Enter a full link, starting with https://")
  .default("");

export const slug = z.string().trim().regex(SLUG_RE, "Use lowercase letters, numbers and dashes.");

export const status = z.enum(["draft", "published"]);

export const idList = z.array(z.number().int().positive()).min(1);
