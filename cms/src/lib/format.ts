const nf = new Intl.NumberFormat("en-US");
export const num = (n: number) => nf.format(Math.round(n));

export const compact = (n: number) => (n >= 10_000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k` : num(n));

export const pct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;

// Change against the previous period, or null when there is nothing to compare with.
export const change = (now: number, before: number) => (before === 0 ? null : (now - before) / before);

export const bytes = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export const date = (d: string | Date) => dateFmt.format(new Date(d));
export const dateTime = (d: string | Date) => dateTimeFmt.format(new Date(d));
export const day = (iso: string) => dayFmt.format(new Date(`${iso}T00:00:00Z`));

// "4 min ago", "yesterday", "3 Oct"
export const ago = (d: string | Date) => {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 172_800) return "yesterday";
  if (s < 604_800) return `${Math.floor(s / 86_400)} days ago`;
  return dayFmt.format(new Date(d));
};

export const slugify = (v: string) =>
  v
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
