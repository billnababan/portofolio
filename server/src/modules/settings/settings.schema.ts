import { z } from "zod";

const text = (max: number, label = "This") => z.string().trim().min(1, `${label} is required.`).max(max, `Keep it under ${max} characters.`);
const optionalText = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters.`).default("");
const url = z.url("Enter a full link, starting with https://").max(500);

// One schema per settings row. The CMS edits each as one form.
export const settingsSchemas = {
  profile: z.object({
    name: text(120, "Full name"),
    shortName: text(40, "Short name"),
    role: text(60, "Role"),
    location: text(80, "Location"),
    availability: optionalText(80),
    email: z.email("Enter a valid email address."),
    phoneDisplay: optionalText(40),
    phoneHref: z.string().trim().regex(/^(tel:\+?[0-9]{6,20})?$/, "Use the form tel:+62812…").default(""),
    timezone: optionalText(40),
    cvMediaId: z.number({ error: "Choose the CV (PDF)." }).int().positive(),
  }),
  social: z
    .array(z.object({ label: text(30, "Label"), href: url }))
    .max(8, "Up to 8 links."),
  hero: z.object({
    imageId: z.number({ error: "Choose a portrait." }).int().positive(),
    imageAlt: text(200, "Alt text"),
    taglineTop: optionalText(60),
    taglineBottom: optionalText(60),
  }),
  marquee: z.array(text(30, "Word")).min(1, "Add at least one word.").max(16),
  story: z.object({
    struck: z.array(text(20, "Word")).min(1).max(3),
    now: text(20, "Current role word"),
    lede: text(240, "Lede"),
    paragraphs: z.array(text(600, "Paragraph")).min(1).max(4),
  }),
  sections: z.object({
    workTitle: text(40, "Title"),
    workNote: optionalText(120),
    moreTitle: text(40, "Title"),
    moreNote: optionalText(120),
    skillsTitle: text(40, "Title"),
    skillsNote: optionalText(160),
    certificationsTitle: text(40, "Title"),
    certificationsNote: optionalText(160),
  }),
  contact: z.object({
    eyebrow: optionalText(40),
    title: text(60, "Title"),
    lede: text(240, "Lede"),
    ledeStrong: optionalText(60),
    messageLabel: text(80, "Message label"),
  }),
  seo: z.object({
    siteUrl: url,
    title: text(70, "Title"),
    description: text(170, "Description"),
    keywords: z.array(text(60, "Keyword")).max(15, "Track up to 15 keywords."),
    ogImageId: z.number({ error: "Choose a share image." }).int().positive(),
    ogImageAlt: optionalText(200),
    robotsIndex: z.boolean(),
    googleVerification: optionalText(100),
    jobTitle: text(60, "Job title"),
    alumniOf: optionalText(120),
    knowsAbout: z.array(text(40, "Topic")).max(30),
  }),
};

export type SettingKey = keyof typeof settingsSchemas;
export type Settings = { [K in SettingKey]: z.infer<(typeof settingsSchemas)[K]> };

export const SETTING_KEYS = Object.keys(settingsSchemas) as SettingKey[];
export const isSettingKey = (key: string): key is SettingKey => key in settingsSchemas;

export const SETTING_LABELS: Record<SettingKey, string> = {
  profile: "Profile",
  social: "Social links",
  hero: "Hero",
  marquee: "Marquee",
  story: "Story",
  sections: "Section texts",
  contact: "Contact texts",
  seo: "SEO settings",
};
