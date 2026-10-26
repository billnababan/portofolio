// Shapes returned by the API (see server/src/modules/*/…controller.ts).

export type Role = "owner" | "editor";
export type User = { id: number; name: string; email: string; role: Role };
export type Integrations = { publish: boolean; searchConsole: boolean; email: boolean };
export type Me = { user: User; integrations: Integrations; siteUrl: string };

export type Range = "7d" | "30d" | "90d";
export type Kpi = { value: number; previous: number; series: number[] };
export type Breakdown = { value: string; visitors: number; pageviews: number };

export type Traffic = {
  range: Range;
  days: string[];
  live: number;
  kpis: Record<"visitors" | "pageviews" | "messages" | "cvDownloads" | "projectOpens" | "emailClicks", Kpi>;
  series: { day: string; visitors: number; pageviews: number }[];
  previousVisitors: number[];
  sources: Breakdown[];
  campaigns: Breakdown[];
  devices: Breakdown[];
  browsers: Breakdown[];
  countries: Breakdown[];
  paths: Breakdown[];
  events: {
    projects: { label: string; slug: string; total: number }[];
    outbound: { label: string; total: number }[];
    social: { label: string; total: number }[];
    totals: { name: string; total: number; visitors: number }[];
  };
};

export type Activity = { id: number; action: string; entityType: string; entityId: number | null; summary: string; isContent: boolean; user: string | null; createdAt: string };

export type Dashboard = {
  range: Range;
  traffic: Pick<Traffic, "days" | "live" | "kpis" | "series" | "previousVisitors" | "sources" | "devices"> & { projects: Traffic["events"]["projects"] };
  seo: { score: number; createdAt: string; fails: number; warns: number; history: { score: number; createdAt: string }[] } | null;
  search: { connected: boolean; data: { clicks: number; impressions: number; ctr: number; position: number; previous: { clicks: number; impressions: number; ctr: number; position: number }; lastDay: string } | null };
  inbox: { newCount: number; latest: { id: number; name: string; email: string; excerpt: string; status: MessageStatus; createdAt: string }[] };
  publish: { configured: boolean; lastPublishedAt: string | null; pendingCount: number };
  activity: Activity[];
  content: Record<string, number>;
  notes: { tone: "good" | "bad" | "neutral"; text: string; link: string }[];
};

export type Media = {
  id: number;
  name: string;
  kind: "image" | "file";
  originalName: string;
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  version: string;
  hasAlpha: boolean;
  widths: number[] | null;
  formats: string[] | null;
  alt: string;
  url: string;
  uses: number;
  createdBy: string | null;
  createdAt: string;
};

export type Status = "draft" | "published";

export type Step = { label: string; text: string; flow: string[]; facts: string[]; features: { title: string; text: string }[] };

export type Project = {
  id: number;
  slug: string;
  title: string;
  shortTitle: string;
  kicker: string;
  summary: string;
  note: string;
  role: string;
  featured: boolean;
  imageId: number;
  imageAlt: string;
  imageUrl: string;
  sourceUrl: string;
  liveUrl: string;
  status: Status;
  sortOrder: number;
  updatedAt: string;
  updatedBy: string | null;
  stack: string[];
  stats: { value: string; label: string }[];
  steps: Step[];
};

export type ProjectInput = Omit<Project, "id" | "imageUrl" | "sortOrder" | "updatedAt" | "updatedBy">;

export type SkillGroup = { id: number; title: string; subtitle: string; sortOrder: number; items: { name: string; tag: string }[] };

export type Certification = {
  id: number;
  slug: string;
  title: string;
  issuer: string;
  year: number;
  dateLabel: string;
  imageId: number;
  imageAlt: string;
  imageUrl: string;
  linkUrl: string;
  linkLabel: string;
  status: Status;
  sortOrder: number;
  updatedAt: string;
};

export type MessageStatus = "new" | "read" | "archived" | "spam";
export type Message = { id: number; name: string; email: string; body: string; status: MessageStatus; sourcePage: string; createdAt: string; readAt: string | null };

export type Settings = {
  profile: { name: string; shortName: string; role: string; location: string; availability: string; email: string; phoneDisplay: string; phoneHref: string; timezone: string; cvMediaId: number };
  social: { label: string; href: string }[];
  hero: { imageId: number; imageAlt: string; taglineTop: string; taglineBottom: string };
  marquee: string[];
  story: { struck: string[]; now: string; lede: string; paragraphs: string[] };
  sections: { workTitle: string; workNote: string; moreTitle: string; moreNote: string; skillsTitle: string; skillsNote: string; certificationsTitle: string; certificationsNote: string };
  contact: { eyebrow: string; title: string; lede: string; ledeStrong: string; messageLabel: string };
  seo: SeoSettings;
};

export type SeoSettings = {
  siteUrl: string;
  title: string;
  description: string;
  keywords: string[];
  ogImageId: number;
  ogImageAlt: string;
  robotsIndex: boolean;
  googleVerification: string;
  jobTitle: string;
  alumniOf: string;
  knowsAbout: string[];
};

export type CheckStatus = "pass" | "warn" | "fail";
export type Check = { id: string; group: string; label: string; status: CheckStatus; value: string; advice: string; weight: number };
export type Audit = { id: number; url: string; score: number; statusCode: number; responseMs: number; htmlBytes: number; checks: Check[]; trigger: string; createdAt: string; createdBy: string | null };

export type SeoOverview = {
  settings: SeoSettings;
  ogImageUrl: string | null;
  latestAudit: Audit | null;
  history: { id: number; score: number; trigger: string; createdAt: string; fails: number; warns: number }[];
  searchConsole: { connected: boolean; syncedAt: string | null; lastDay: string | null };
};

export type SearchRow = { key: string; clicks: number; impressions: number; ctr: number; position: number };
export type SearchReport = {
  connected: boolean;
  range: Range;
  window: { from: string; to: string };
  syncedAt: string | null;
  lastDay: string | null;
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  previous: { clicks: number; impressions: number; ctr: number; position: number };
  series: { day: string; clicks: number; impressions: number; position: number; ctr: number }[];
  queries: SearchRow[];
  pages: SearchRow[];
  keywords: { keyword: string; clicks: number; impressions: number; position: number | null; previousPosition: number | null }[];
};

export type PublishStatus = {
  configured: boolean;
  lastPublishedAt: string | null;
  pending: { id: number; action: string; summary: string; user: string | null; createdAt: string }[];
  history: { id: number; status: "triggered" | "failed"; note: string; response: string; user: string | null; createdAt: string }[];
};

export type UserRow = { id: number; name: string; email: string; role: Role; isActive: boolean; lastLoginAt: string | null; createdAt: string };
export type Session = { id: string; ip: string; user_agent: string; created_at: string; last_seen_at: string; expires_at: string; current: boolean };
