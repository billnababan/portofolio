import { Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AreaChart } from "../components/charts/AreaChart";
import { BarList, ScoreHistory, Sparkline } from "../components/charts/Small";
import { Delta, ErrorBlock, LinkCard, PageHeader, SectionTitle, Spinner } from "../components/ui/Bits";
import { Segmented } from "../components/ui/Form";
import { Icon } from "../components/ui/Icon";
import { useAuth } from "../hooks/useAuth";
import { useRange } from "../hooks/useRange";
import { api } from "../lib/api";
import { ago, compact, num, pct } from "../lib/format";
import type { Dashboard as DashboardData, Kpi } from "../lib/types";

export const RANGES = [
  { value: "7d" as const, label: "7 days" },
  { value: "30d" as const, label: "30 days" },
  { value: "90d" as const, label: "90 days" },
];

const greeting = () => {
  const h = new Date().getHours();
  return h < 11 ? "good morning" : h < 15 ? "good afternoon" : h < 19 ? "good evening" : "good night";
};

function KpiTile({ label, kpi, to }: { label: string; kpi: Kpi; to: string }) {
  return (
    <Link to={to} className="card group flex flex-col gap-3 p-5 transition-colors hover:border-line-strong">
      <div className="flex items-center justify-between">
        <p className="meta">{label}</p>
        <Icon name="arrowUpRight" size={14} className="text-faint transition-colors group-hover:text-fg" />
      </div>
      <p className="display num text-[44px]">{compact(kpi.value)}</p>
      <div className="flex items-center justify-between gap-3">
        <Delta now={kpi.value} before={kpi.previous} />
        <span className="meta num">prev. {compact(kpi.previous)}</span>
      </div>
      <Sparkline values={kpi.series} />
    </Link>
  );
}

export function ChartLegend({ current = "this period" }: { current?: string }) {
  return (
    <div className="mt-3 flex gap-5" aria-hidden="true">
      <span className="meta flex items-center gap-2">
        <span className="h-0.5 w-4 bg-fg" />
        {current}
      </span>
      <span className="meta flex items-center gap-2">
        <span className="w-4 border-t border-dashed border-mute" />
        previous period
      </span>
    </div>
  );
}

const toneDot = { good: "bg-fg", bad: "bg-bad", neutral: "border border-mute" };

export function Dashboard() {
  const [range, setRange] = useRange();
  const { data: me } = useAuth();
  const q = useQuery({ queryKey: ["dashboard", range], queryFn: () => api.get<DashboardData>(`/dashboard?range=${range}`), placeholderData: keepPreviousData });

  const firstName = me?.user.name.split(" ")[0]?.toLowerCase() ?? "";

  return (
    <>
      <PageHeader
        eyebrow={`${greeting()}, ${firstName}`}
        title="Overview"
        actions={
          <>
            {q.data && (
              <span className="chip mr-1 normal-case" title="Visitors in the last 30 minutes">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  {q.data.traffic.live > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fg opacity-60" />}
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-fg" />
                </span>
                <span className="num">{q.data.traffic.live}</span> on the site now
              </span>
            )}
            <Segmented label="Date range" value={range} options={RANGES} onChange={setRange} />
          </>
        }
      />

      {q.isPending && <Spinner label="Loading the dashboard" />}
      {q.isError && <ErrorBlock error={q.error} retry={() => q.refetch()} />}
      {q.data && <DashboardBody d={q.data} refreshing={q.isPlaceholderData} />}
    </>
  );
}

function DashboardBody({ d, refreshing }: { d: DashboardData; refreshing: boolean }) {
  const t = d.traffic;
  const k = t.kpis;
  const totalVisitors = Math.max(1, k.visitors.value);

  return (
    <div className={`flex flex-col gap-5 ${refreshing ? "is-refreshing" : ""}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile label="visitors" kpi={k.visitors} to="/analytics" />
        <KpiTile label="project opens" kpi={k.projectOpens} to="/analytics" />
        <KpiTile label="cv downloads" kpi={k.cvDownloads} to="/analytics" />
        <KpiTile label="messages" kpi={k.messages} to="/inbox" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section className="card p-5 xl:col-span-8" aria-labelledby="traffic-title">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="traffic-title" className="text-[15px] font-semibold">
                Visitors per day
              </h2>
              <p className="meta mt-1">
                {num(k.visitors.value)} visitors · {num(k.pageviews.value)} page views
              </p>
            </div>
            <LinkCard to="/analytics">Full analytics</LinkCard>
          </div>
          <AreaChart days={t.days} values={k.visitors.series} previous={t.previousVisitors} label="Visitors" />
          <ChartLegend />
        </section>

        <section className="card flex flex-col p-5 xl:col-span-4" aria-labelledby="notes-title">
          <SectionTitle title="Notes" meta="from your numbers" />
          <h2 id="notes-title" className="sr-only">
            Notes
          </h2>
          {d.notes.length === 0 ? (
            <p className="text-[13.5px] text-mute">Nothing stands out in this range.</p>
          ) : (
            <ul className="flex flex-col">
              {d.notes.map((n) => (
                <li key={n.text} className="border-t border-line first:border-t-0">
                  <Link to={n.link} className="group flex items-start gap-3 py-3">
                    <span className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${toneDot[n.tone]}`} aria-hidden="true" />
                    <span className="flex-1 text-[13.5px] leading-snug">{n.text}</span>
                    <Icon name="chevronRight" size={14} className="mt-0.5 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="card p-5">
          <SectionTitle title="Where visitors come from" action={<LinkCard to="/analytics">All</LinkCard>} />
          <BarList valueLabel="visitors" rows={t.sources.map((s) => ({ label: s.value, value: s.visitors }))} />
        </section>
        <section className="card p-5">
          <SectionTitle title="Most opened projects" action={<LinkCard to="/content/projects">Projects</LinkCard>} />
          <BarList valueLabel="opens" rows={t.projects.map((p) => ({ label: p.label, value: p.total }))} empty="No project opened in this range." />
        </section>
        <section className="card p-5">
          <SectionTitle title="Devices" />
          <BarList valueLabel="visitors" rows={t.devices.map((dv) => ({ label: dv.value, value: dv.visitors, hint: pct(dv.visitors / totalVisitors, 0) }))} />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="card flex flex-col p-5">
          <SectionTitle title="SEO health" action={<LinkCard to="/seo">Details</LinkCard>} />
          {d.seo ? (
            <>
              <div className="flex items-end gap-3">
                <p className="display num text-[64px]">{d.seo.score}</p>
                <p className="meta pb-2">/ 100 · checked {ago(d.seo.createdAt)}</p>
              </div>
              <div className="mb-4 mt-3 flex gap-2">
                <span className={`chip ${d.seo.fails ? "border-bad/40 text-bad" : ""}`}>{d.seo.fails} failing</span>
                <span className="chip text-mute">{d.seo.warns} to improve</span>
              </div>
              <div className="mt-auto">
                <ScoreHistory items={d.seo.history} />
              </div>
            </>
          ) : (
            <p className="text-[13.5px] leading-relaxed text-mute">No audit yet. Run one on the SEO page — it takes a few seconds.</p>
          )}
        </section>

        <section className="card flex flex-col p-5">
          <SectionTitle title="Google search" meta={d.search.data ? "last 28 days" : undefined} action={<LinkCard to="/seo?tab=search">Queries</LinkCard>} />
          {d.search.data ? (
            <>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
                <div>
                  <dt className="meta">clicks</dt>
                  <dd className="display num mt-1 text-[36px]">{num(d.search.data.clicks)}</dd>
                  <Delta now={d.search.data.clicks} before={d.search.data.previous.clicks} />
                </div>
                <div>
                  <dt className="meta">impressions</dt>
                  <dd className="display num mt-1 text-[36px]">{compact(d.search.data.impressions)}</dd>
                  <Delta now={d.search.data.impressions} before={d.search.data.previous.impressions} />
                </div>
                <div>
                  <dt className="meta">average position</dt>
                  <dd className="display num mt-1 text-[36px]">{d.search.data.position.toFixed(1)}</dd>
                  <Delta now={d.search.data.position} before={d.search.data.previous.position} inverse />
                </div>
                <div>
                  <dt className="meta">click-through</dt>
                  <dd className="display num mt-1 text-[36px]">{pct(d.search.data.ctr)}</dd>
                  <Delta now={d.search.data.ctr} before={d.search.data.previous.ctr} />
                </div>
              </dl>
              {!d.search.connected && <p className="meta mt-auto pt-4">search console not connected — showing stored data</p>}
            </>
          ) : (
            <p className="text-[13.5px] leading-relaxed text-mute">Connect Google Search Console to see clicks, impressions and positions here. Setup is in the README.</p>
          )}
        </section>

        <section className="card flex flex-col p-5">
          <SectionTitle title="Inbox" meta={d.inbox.newCount ? `${d.inbox.newCount} new` : "all read"} action={<LinkCard to="/inbox">Open</LinkCard>} />
          {d.inbox.latest.length === 0 ? (
            <p className="text-[13.5px] text-mute">No messages yet.</p>
          ) : (
            <ul className="-mx-2 flex flex-col">
              {d.inbox.latest.slice(0, 4).map((m) => (
                <li key={m.id}>
                  <Link to={`/inbox/${m.id}`} className="flex flex-col gap-0.5 rounded-lg px-2 py-2.5 transition-colors hover:bg-raised">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`flex items-center gap-2 truncate text-[13.5px] ${m.status === "new" ? "font-semibold" : ""}`}>
                        {m.status === "new" && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-fg" aria-label="new" />}
                        {m.name}
                      </span>
                      <span className="meta shrink-0">{ago(m.createdAt)}</span>
                    </span>
                    <span className="line-clamp-1 text-[13px] text-mute">{m.excerpt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section className="card p-5 xl:col-span-8">
          <SectionTitle title="Recent activity" action={<LinkCard to="/activity">All activity</LinkCard>} />
          <ol className="flex flex-col">
            {d.activity.map((a) => (
              <li key={a.id} className="flex items-center gap-3 border-t border-line py-2.5 first:border-t-0">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${a.isContent ? "bg-fg" : "bg-faint"}`} aria-hidden="true" />
                <span className="flex-1 truncate text-[13.5px]">{a.summary}</span>
                <span className="meta hidden shrink-0 sm:inline">{a.user ?? "system"}</span>
                <span className="meta w-20 shrink-0 text-right">{ago(a.createdAt)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="card flex flex-col gap-4 p-5 xl:col-span-4">
          <SectionTitle title="On the site" action={<LinkCard to="/publish">Publish</LinkCard>} />
          <dl className="grid grid-cols-2 gap-3">
            {[
              ["projects shown", d.content.projects_shown],
              ["hidden drafts", d.content.projects_hidden],
              ["certifications", d.content.certifications],
              ["files in media", d.content.media],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-xl border border-line p-3">
                <dt className="meta">{label}</dt>
                <dd className="display num mt-1 text-[30px]">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[13.5px] leading-relaxed text-mute">
            {d.publish.pendingCount > 0 ? (
              <>
                <strong className="text-fg">{d.publish.pendingCount} change{d.publish.pendingCount > 1 ? "s" : ""}</strong> not live yet.
              </>
            ) : (
              "Everything you saved is live."
            )}{" "}
            {d.publish.lastPublishedAt && <>Last published {ago(d.publish.lastPublishedAt)}.</>}
          </p>
        </section>
      </div>
    </div>
  );
}
