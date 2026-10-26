import { pool, select } from "../../db/pool.js";
import { eachDay, rangeBounds, type Range } from "../../lib/range.js";
import {
  breakdown,
  dailySeries,
  eventDaily,
  eventLabels,
  eventTotals,
  liveVisitors,
  messagesDaily,
  messagesInWindow,
  totals,
} from "./analytics.queries.js";

// Fill in zero for days without data, in range order.
const fill = (days: string[], rows: { day: string; total: number }[]) => {
  const byDay = new Map(rows.map((r) => [r.day, Number(r.total)]));
  return days.map((d) => byDay.get(d) ?? 0);
};

const kpi = (value: number, previous: number, series: number[]) => ({ value, previous, series });

// Everything the Analytics page and the dashboard's traffic part need, for one range.
export const trafficReport = async (range: Range) => {
  const { days, from, prevFrom } = rangeBounds(range);
  const cur = { from };
  const prev = { from: prevFrom, to: from };
  const dayList = eachDay(from, days);

  const [now, before, series, prevSeries, events, eventsBefore, live, msgs, msgsBefore, msgDaily, cvDaily, opensDaily] = await Promise.all([
    totals(pool, cur),
    totals(pool, prev),
    dailySeries(pool, cur),
    dailySeries(pool, prev),
    eventTotals(pool, cur),
    eventTotals(pool, prev),
    liveVisitors(pool),
    messagesInWindow(pool, cur),
    messagesInWindow(pool, prev),
    messagesDaily(pool, cur),
    eventDaily(pool, "cv_download", cur),
    eventDaily(pool, "project_open", cur),
  ]);

  const [sources, utm, devices, browsers, countries, paths, projects, outbound, social] = await Promise.all([
    breakdown(pool, "referrer_host", cur),
    breakdown(pool, "utm_source", cur),
    breakdown(pool, "device", cur),
    breakdown(pool, "browser", cur),
    breakdown(pool, "country", cur, 10),
    breakdown(pool, "path", cur),
    eventLabels(pool, "project_open", cur),
    eventLabels(pool, "source_click", cur),
    eventLabels(pool, "social_click", cur),
  ]);

  // Project events carry the slug; show the project's title instead.
  const titles = new Map((await select<{ slug: string; title: string }>(pool, `SELECT slug, title FROM projects`)).map((p) => [p.slug, p.title]));

  const eventCount = (rows: { name: string; total: number }[], name: string) => Number(rows.find((r) => r.name === name)?.total ?? 0);
  const seriesByDay = new Map(series.map((s) => [s.day, s]));
  const visitorsSeries = dayList.map((d) => Number(seriesByDay.get(d)?.visitors ?? 0));
  const pageviewsSeries = dayList.map((d) => Number(seriesByDay.get(d)?.pageviews ?? 0));
  // Visitors on the matching day of the previous period, for the dashed comparison line.
  const prevByDay = new Map(prevSeries.map((s) => [s.day, Number(s.visitors)]));
  const previousVisitors = eachDay(prevFrom, days).map((d) => prevByDay.get(d) ?? 0);

  const num = <T extends { visitors: number; pageviews: number }>(rows: T[]) =>
    rows.map((r) => ({ ...r, visitors: Number(r.visitors), pageviews: Number(r.pageviews) }));

  return {
    range,
    days: dayList,
    live,
    kpis: {
      visitors: kpi(now.visitors, before.visitors, visitorsSeries),
      pageviews: kpi(now.pageviews, before.pageviews, pageviewsSeries),
      messages: kpi(msgs, msgsBefore, fill(dayList, msgDaily)),
      cvDownloads: kpi(eventCount(events, "cv_download"), eventCount(eventsBefore, "cv_download"), fill(dayList, cvDaily)),
      projectOpens: kpi(eventCount(events, "project_open"), eventCount(eventsBefore, "project_open"), fill(dayList, opensDaily)),
      emailClicks: kpi(eventCount(events, "email_click"), eventCount(eventsBefore, "email_click"), []),
    },
    series: dayList.map((day, i) => ({ day, visitors: visitorsSeries[i] ?? 0, pageviews: pageviewsSeries[i] ?? 0 })),
    previousVisitors,
    sources: num(sources).map((s) => ({ ...s, value: s.value || "Direct / none" })),
    campaigns: num(utm).filter((u) => u.value !== ""),
    devices: num(devices),
    browsers: num(browsers),
    countries: num(countries).map((c) => ({ ...c, value: c.value || "Unknown" })),
    paths: num(paths),
    events: {
      projects: projects.map((p) => ({ label: titles.get(p.label) ?? p.label, slug: p.label, total: Number(p.total) })),
      outbound: outbound.map((p) => ({ label: p.label, total: Number(p.total) })),
      social: social.map((p) => ({ label: p.label, total: Number(p.total) })),
      totals: events.map((e) => ({ name: e.name, total: Number(e.total), visitors: Number(e.visitors) })),
    },
  };
};
