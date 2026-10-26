import { z } from "zod";
import { optionalText, optionalUrl, requiredText, slug, status } from "../../lib/schema.js";

const stepSchema = z.object({
  label: requiredText(60, "Step label"),
  text: requiredText(2000, "Step text"),
  flow: z.array(requiredText(60, "Stage")).max(12, "Up to 12 stages.").default([]),
  facts: z.array(requiredText(600, "Fact")).max(8, "Up to 8 facts.").default([]),
  features: z
    .array(z.object({ title: requiredText(160, "Feature title"), text: requiredText(600, "Feature text") }))
    .max(8, "Up to 8 features.")
    .default([]),
});

export const projectSchema = z
  .object({
    slug,
    title: requiredText(160, "Title"),
    shortTitle: requiredText(60, "Short title"),
    kicker: optionalText(120),
    summary: requiredText(600, "Summary"),
    note: optionalText(300),
    role: optionalText(300),
    featured: z.boolean(),
    imageId: z.number({ error: "Choose a screenshot." }).int().positive(),
    imageAlt: requiredText(300, "Alt text"),
    sourceUrl: optionalUrl,
    liveUrl: optionalUrl,
    status,
    stack: z.array(requiredText(60, "Technology")).min(1, "Add at least one technology.").max(12),
    stats: z.array(z.object({ value: requiredText(20, "Value"), label: requiredText(60, "Label") })).max(4, "Up to 4 numbers."),
    steps: z.array(stepSchema).max(6, "Up to 6 steps."),
  })
  .superRefine((p, ctx) => {
    // Featured projects are told as stories on the site, so they need the story parts.
    if (!p.featured) return;
    if (p.kicker === "") ctx.addIssue({ code: "custom", path: ["kicker"], message: "A featured project needs a kicker, e.g. “case 03 — client app”." });
    if (p.steps.length === 0) ctx.addIssue({ code: "custom", path: ["steps"], message: "A featured project needs at least one step." });
  });

export type ProjectInput = z.infer<typeof projectSchema>;
