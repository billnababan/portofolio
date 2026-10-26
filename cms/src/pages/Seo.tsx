import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AreaChart } from "../components/charts/AreaChart";
import { ScoreHistory } from "../components/charts/Small";
import { Delta, EmptyState, ErrorBlock, PageHeader, SectionTitle, Spinner } from "../components/ui/Bits";
import { useFeedback } from "../components/ui/Feedback";
import { FormCard } from "../components/ui/FormCard";
import { Segmented, Switch, TextField } from "../components/ui/Form";
import { Icon } from "../components/ui/Icon";
import { ChipsInput } from "../components/ui/Lists";
import { MediaField, useMedia } from "../components/ui/MediaPicker";
import { useRange } from "../hooks/useRange";
import { useSettingForm } from "../hooks/useSettingForm";
import { useUnsaved } from "../hooks/useUnsaved";
import { api } from "../lib/api";
import { ago, compact, dateTime, num, pct } from "../lib/format";
import type { Audit, Check, CheckStatus, SearchReport, SeoOverview } from "../lib/types";
import { RANGES } from "./Dashboard";

type Tab = "health" | "search" | "settings";

export function Seo() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "health";
  const overview = useQuery({ queryKey: ["seo"], queryFn: () => api.get<SeoOverview>("/seo") });

  return (
    <>
      <PageHeader
        eyebrow="growth"
        title="SEO"
        description="How search engines see the live site, how it does in Google, and the words that describe it."
        actions={
          <Segmented
            label="Section"
            value={tab}
            onChange={(t) => setParams((p) => (p.set("tab", t), p), { replace: true })}
            options={[
              { value: "health", label: "Health" },
              { value: "search", label: "Search performance" },
              { value: "settings", label: "Settings" },
            ]}
          />
        }
      />
      {overview.isPending && <Spinner />}
      {overview.isError && <ErrorBlock error={overview.error} retry={() => overview.refetch()} />}
      {overview.data && tab === "health" && <Health o={overview.data} />}
      {overview.data && tab === "search" && <Search o={overview.data} />}
      {overview.data && tab === "settings" && <SeoSettings o={overview.data} />}
    </>
  );
}

const STATUS: Record<CheckStatus, { icon: "check" | "alert" | "x"; label: string; cls: string }> = {
  fail: { icon: "x", label: "failing", cls: "border-bad/50 text-bad" },
  warn: { icon: "alert", label: "could be better", cls: "border-line-strong text-mute" },
  pass: { icon: "check", label: "passing", cls: "border-fg bg-fg text-bg" },
};

function Health({ o }: { o: SeoOverview }) {
  const qc = useQueryClient();
  const { toast } = useFeedback();
  const run = useMutation({
    mutationFn: () => api.post<{ audit: Audit }>("/seo/audits"),
    onSuccess: ({ audit }) => {
      toast(`Audit done — score ${audit.score}`);
      qc.invalidateQueries({ queryKey: ["seo"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast(e.message, "error"),
  });
  const [filter, setFilter] = useState<"all" | "problems">("problems");
  const a = o.latestAudit;

  const groups = useMemo(() => {
    if (!a) return [];
    const order: Record<CheckStatus, number> = { fail: 0, warn: 1, pass: 2 };
    const checks = [...a.checks].filter((c) => filter === "all" || c.status !== "pass").sort((x, y) => order[x.status] - order[y.status] || y.weight - x.weight);
    const by = new Map<string, Check[]>();
    for (const c of checks) by.set(c.group, [...(by.get(c.group) ?? []), c]);
    return [...by.entries()];
  }, [a, filter]);

  if (!a)
    return (
      <div className="card">
        <EmptyState
          icon="seo"
          title="No audit yet"
          body={`The audit fetches ${o.settings.siteUrl} like a search engine and runs 25 checks. It also runs every night and a few minutes after each publish.`}
          action={
            <button type="button" className="btn-primary" onClick={() => run.mutate()} disabled={run.isPending}>
              <span>{run.isPending ? "Checking the site…" : "Run the first audit"}</span>
            </button>
          }
        />
      </div>
    );

  const counts = { fail: a.checks.filter((c) => c.status === "fail").length, warn: a.checks.filter((c) => c.status === "warn").length, pass: a.checks.filter((c) => c.status === "pass").length };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section className="card flex flex-col p-6 lg:col-span-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="meta">health score</p>
              <p className="mt-2 flex items-end gap-2">
                <span className="display num text-[88px]">{a.score}</span>
                <span className="meta pb-3">/ 100</span>
              </p>
            </div>
            <button type="button" className="btn" onClick={() => run.mutate()} disabled={run.isPending}>
              <Icon name="refresh" size={15} />
              <span>{run.isPending ? "Checking…" : "Check again"}</span>
            </button>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised" aria-hidden="true">
            <div className="h-full rounded-full bg-fg transition-[width] duration-700 ease-out" style={{ width: `${a.score}%` }} />
          </div>
          <p className="mt-4 text-[13.5px] text-mute">
            {a.url} · {dateTime(a.createdAt)} · {a.trigger === "manual" ? `run by ${a.createdBy ?? "you"}` : a.trigger === "publish" ? "after a publish" : "nightly check"}
          </p>
          <dl className="mt-5 grid grid-cols-3 gap-3">
            {(["fail", "warn", "pass"] as const).map((s) => (
              <div key={s} className="rounded-xl border border-line p-3">
                <dt className="meta">{STATUS[s].label}</dt>
                <dd className={`display num mt-1 text-[30px] ${s === "fail" && counts.fail ? "text-bad" : ""}`}>{counts[s]}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="card p-6 lg:col-span-7">
          <SectionTitle title="Score over time" meta={`${o.history.length} audit${o.history.length === 1 ? "" : "s"}`} />
          <ScoreHistory items={o.history} />
          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
            <div>
              <dt className="meta">response</dt>
              <dd className="display num mt-1 text-[28px]">{a.responseMs} ms</dd>
            </div>
            <div>
              <dt className="meta">html</dt>
              <dd className="display num mt-1 text-[28px]">{Math.round(a.htmlBytes / 1024)} KB</dd>
            </div>
            <div>
              <dt className="meta">status</dt>
              <dd className="display num mt-1 text-[28px]">{a.statusCode}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
          <h2 className="text-[15px] font-semibold">Checks</h2>
          <Segmented
            label="Show"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "problems", label: "Needs attention", count: counts.fail + counts.warn },
              { value: "all", label: "All", count: a.checks.length },
            ]}
          />
        </div>
        {groups.length === 0 && <EmptyState icon="check" title="Nothing to fix" body="Every check passes. Nice." />}
        {groups.map(([group, checks]) => (
          <div key={group} className="border-b border-line last:border-b-0">
            <p className="meta px-6 pb-1 pt-4">{group}</p>
            <ul>
              {checks.map((c) => (
                <li key={c.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-4 px-6 py-3 transition-colors hover:bg-raised">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${STATUS[c.status].cls}`} title={STATUS[c.status].label}>
                        <Icon name={STATUS[c.status].icon} size={12} strokeWidth={2.6} />
                        <span className="sr-only">{STATUS[c.status].label}</span>
                      </span>
                      <span className="flex-1 text-[14px]">{c.label}</span>
                      <span className="meta hidden max-w-[40%] truncate text-right sm:inline">{c.value}</span>
                      <Icon name="chevronDown" size={14} className="text-faint transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-4 pl-16 text-[13.5px] leading-relaxed text-mute">
                      <p className="meta mb-1 sm:hidden">{c.value}</p>
                      {c.advice}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

function Search({ o }: { o: SeoOverview }) {
  const [range, setRange] = useRange();
  const qc = useQueryClient();
  const { toast } = useFeedback();
  const q = useQuery({ queryKey: ["seo-search", range], queryFn: () => api.get<SearchReport>(`/seo/search?range=${range}`), placeholderData: keepPreviousData });
  const sync = useMutation({
    mutationFn: () => api.post<{ rows: number }>("/seo/search/sync"),
    onSuccess: (r) => (toast(`Synced ${num(r.rows)} rows from Google`), qc.invalidateQueries({ queryKey: ["seo-search"] }), qc.invalidateQueries({ queryKey: ["seo"] })),
    onError: (e) => toast(e.message, "error"),
  });

  if (q.isPending) return <Spinner />;
  if (q.isError) return <ErrorBlock error={q.error} retry={() => q.refetch()} />;
  const s = q.data;

  if (s.series.length === 0)
    return (
      <div className="card">
        <EmptyState
          icon="seo"
          title={s.connected ? "No search data yet" : "Connect Google Search Console"}
          body={
            s.connected
              ? "Press Sync to pull the last 90 days. Google’s numbers arrive two to three days late."
              : "Create a service account in Google Cloud, add its email as a user on your Search Console property, then set GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY and GSC_PROPERTY on the server. The README walks through it."
          }
          action={
            s.connected ? (
              <button type="button" className="btn-primary" onClick={() => sync.mutate()} disabled={sync.isPending}>
                <span>{sync.isPending ? "Syncing…" : "Sync now"}</span>
              </button>
            ) : undefined
          }
        />
      </div>
    );

  const tiles = [
    { label: "clicks", now: s.totals.clicks, before: s.previous.clicks, fmt: num },
    { label: "impressions", now: s.totals.impressions, before: s.previous.impressions, fmt: compact },
    { label: "click-through", now: s.totals.ctr, before: s.previous.ctr, fmt: (n: number) => pct(n) },
    { label: "average position", now: s.totals.position, before: s.previous.position, fmt: (n: number) => n.toFixed(1), inverse: true },
  ];

  return (
    <div className={`flex flex-col gap-5 ${q.isPlaceholderData ? "is-refreshing" : ""}`}>
      <div className="flex flex-wrap items-center gap-3">
        <Segmented label="Date range" value={range} options={RANGES} onChange={setRange} />
        <span className="meta">
          {s.window.from} → {s.window.to} · {s.connected ? `synced ${s.syncedAt ? ago(s.syncedAt) : "never"}` : "not connected — showing stored data"}
        </span>
        {s.connected && (
          <button type="button" className="btn ml-auto" onClick={() => sync.mutate()} disabled={sync.isPending}>
            <Icon name="refresh" size={15} />
            <span>{sync.isPending ? "Syncing…" : "Sync"}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="card flex flex-col gap-2 p-5">
            <p className="meta">{t.label}</p>
            <p className="display num text-[40px]">{t.fmt(t.now)}</p>
            <Delta now={t.now} before={t.before} inverse={t.inverse} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="card p-5">
          <SectionTitle title="Clicks per day" />
          <AreaChart days={s.series.map((r) => r.day)} values={s.series.map((r) => r.clicks)} label="Clicks" height={220} />
        </section>
        <section className="card p-5">
          <SectionTitle title="Average position" meta="lower is better · 1 is the top" />
          <AreaChart days={s.series.map((r) => r.day)} values={s.series.map((r) => r.position)} label="Average position" format={(n) => n.toFixed(0)} height={220} inverse />
        </section>
      </div>

      <section className="card p-5">
        <SectionTitle title="Tracked keywords" meta="set in SEO settings" />
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>keyword</th>
                <th className="text-right">position</th>
                <th className="text-right">change</th>
                <th className="text-right">clicks</th>
                <th className="text-right">impressions</th>
              </tr>
            </thead>
            <tbody>
              {s.keywords.map((k) => {
                const moved = k.position !== null && k.previousPosition !== null ? k.previousPosition - k.position : null;
                return (
                  <tr key={k.keyword}>
                    <td className="font-medium">{k.keyword}</td>
                    <td className="num text-right font-mono">{k.position === null ? <span className="text-faint">not ranking</span> : k.position.toFixed(1)}</td>
                    <td className="num text-right font-mono text-[12.5px]">
                      {moved === null || Math.abs(moved) < 0.1 ? (
                        <span className="text-mute">—</span>
                      ) : (
                        <span className={moved > 0 ? "text-fg" : "text-bad"}>
                          {moved > 0 ? "▲" : "▼"} {Math.abs(moved).toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td className="num text-right font-mono">{num(k.clicks)}</td>
                    <td className="num text-right font-mono text-mute">{num(k.impressions)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section className="card p-5 xl:col-span-8">
          <SectionTitle title="Top searches" meta="what people typed" />
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>query</th>
                  <th className="text-right">clicks</th>
                  <th className="text-right">impressions</th>
                  <th className="text-right">ctr</th>
                  <th className="text-right">position</th>
                </tr>
              </thead>
              <tbody>
                {s.queries.map((r) => (
                  <tr key={r.key}>
                    <td>{r.key}</td>
                    <td className="num text-right font-mono">{num(r.clicks)}</td>
                    <td className="num text-right font-mono text-mute">{num(r.impressions)}</td>
                    <td className="num text-right font-mono text-mute">{pct(r.ctr)}</td>
                    <td className="num text-right font-mono">{r.position.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="card p-5 xl:col-span-4">
          <SectionTitle title="Pages" />
          <ul className="flex flex-col">
            {s.pages.map((r) => (
              <li key={r.key} className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-b-0">
                <span className="truncate font-mono text-[12.5px]">{r.key.replace(/^https?:\/\//, "")}</span>
                <span className="num font-mono text-[12.5px]">{num(r.clicks)}</span>
              </li>
            ))}
          </ul>
          {!o.searchConsole.connected && <p className="meta mt-4">Stored rows only. Connect Search Console to keep them current.</p>}
        </section>
      </div>
    </div>
  );
}

function SeoSettings({ o }: { o: SeoOverview }) {
  const form = useSettingForm("seo", o.settings, "SEO settings");
  const { data: media } = useMedia();
  useUnsaved(form.dirty);
  const s = form.draft!;
  const host = s.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const og = media?.find((m) => m.id === s.ogImageId);

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
      <FormCard title="Search & sharing" description="These become the page title, meta description, canonical address, share card and structured data on the next publish." dirty={form.dirty} saving={form.saving} onSave={form.save} onReset={form.reset}>
        <TextField label="Site address" mono value={s.siteUrl} onChange={(v) => form.set({ siteUrl: v })} error={form.errors.siteUrl} help="The live address. Used for the canonical link, sitemap and the audit." />
        <TextField label="Title" value={s.title} onChange={(v) => form.set({ title: v })} error={form.errors.title} max={70} help={s.title.length > 60 ? "Over 60 characters: Google will likely cut the end." : "30–60 characters shows in full."} />
        <TextField label="Description" multiline rows={3} value={s.description} onChange={(v) => form.set({ description: v })} error={form.errors.description} max={170} help="70–160 characters. Say who you are, where, and what you build." />
        <ChipsInput label="Tracked keywords" value={s.keywords} onChange={(keywords) => form.set({ keywords })} max={15} help="Searches you want to rank for. Their positions show on the Search performance tab." />
        <MediaField label="Share image" value={s.ogImageId} onChange={(id) => form.set({ ogImageId: id })} error={form.errors.ogImageId} help="Cropped to 1200×630 automatically. Shown when the link is shared on WhatsApp, LinkedIn or X." />
        <TextField label="Share image alt text" value={s.ogImageAlt} onChange={(v) => form.set({ ogImageAlt: v })} error={form.errors.ogImageAlt} max={200} />
        <Switch label="Allow search engines" checked={s.robotsIndex} onChange={(robotsIndex) => form.set({ robotsIndex })} help="Off writes noindex and blocks crawlers in robots.txt — only for a site that should stay private." />
        <TextField label="Google verification code" mono value={s.googleVerification} onChange={(v) => form.set({ googleVerification: v })} error={form.errors.googleVerification} help="From Search Console → Settings → Ownership verification → HTML tag (the content value only)." />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Job title (structured data)" value={s.jobTitle} onChange={(v) => form.set({ jobTitle: v })} error={form.errors.jobTitle} max={60} />
          <TextField label="Studied at" value={s.alumniOf} onChange={(v) => form.set({ alumniOf: v })} error={form.errors.alumniOf} max={120} />
        </div>
        <ChipsInput label="Knows about" value={s.knowsAbout} onChange={(knowsAbout) => form.set({ knowsAbout })} max={30} help="Topics Google can connect to your name." />
      </FormCard>

      <aside className="flex flex-col gap-5 xl:sticky xl:top-20">
        <section className="card p-5">
          <p className="meta mb-3">google result preview</p>
          <div className="rounded-xl bg-white p-4 font-[Arial,sans-serif] text-[#202124]">
            <p className="flex items-center gap-2 text-[12px] text-[#4d5156]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f1f3f4] text-[11px] font-bold">{host.charAt(0).toUpperCase()}</span>
              <span>
                <span className="block text-[13px] text-[#202124]">{host}</span>
                https://{host}
              </span>
            </p>
            <p className="mt-1.5 line-clamp-1 text-[19px] leading-snug text-[#1a0dab]">{s.title || "Page title"}</p>
            <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-snug text-[#4d5156]">{s.description || "Description"}</p>
          </div>
        </section>
        <section className="card p-5">
          <p className="meta mb-3">share card preview</p>
          <div className="overflow-hidden rounded-xl border border-line">
            {og ? <img src={og.url.replace(/-\d+\./, `-${Math.max(...(og.widths ?? [480]))}.`)} alt="" className="aspect-[1200/630] w-full object-cover" /> : <div className="aspect-[1200/630] bg-raised" />}
            <div className="bg-raised px-4 py-3">
              <p className="meta">{host}</p>
              <p className="mt-0.5 line-clamp-1 text-[14px] font-semibold">{s.title}</p>
              <p className="line-clamp-1 text-[13px] text-mute">{s.description}</p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
