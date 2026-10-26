import { z } from "zod";

// Date ranges used by the dashboard, analytics and search pages.
export const rangeSchema = z.enum(["7d", "30d", "90d"]).default("30d");
export type Range = z.infer<typeof rangeSchema>;

export const rangeDays = (range: Range): number => Number(range.replace("d", ""));

// [start of the current period, start of the previous period of equal length], both UTC midnight.
export const rangeBounds = (range: Range) => {
  const days = rangeDays(range);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const from = new Date(today.getTime() - (days - 1) * 86_400_000);
  const prevFrom = new Date(from.getTime() - days * 86_400_000);
  return { days, from, prevFrom };
};

// Every day in the range as YYYY-MM-DD, so charts have a point for days without data.
export const eachDay = (from: Date, days: number): string[] =>
  Array.from({ length: days }, (_, i) => new Date(from.getTime() + i * 86_400_000).toISOString().slice(0, 10));
