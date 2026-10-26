import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AreaChart } from "../components/charts/AreaChart";
import { BarList } from "../components/charts/Small";
import { Delta, ErrorBlock, PageHeader, SectionTitle, Spinner } from "../components/ui/Bits";
import { Segmented } from "../components/ui/Form";
import { useRange } from "../hooks/useRange";
import { api } from "../lib/api";
import { compact, num, pct } from "../lib/format";
import type { Kpi, Traffic } from "../lib/types";
import { ChartLegend, RANGES } from "./Dashboard";

const COUNTRY = new Intl.DisplayNames(["en"], { type: "region" });
const countryName = (code: string) => {
  try {
    return code.length === 2 ? (COUNTRY.of(code) ?? code) : code;
  } catch {
    return code;
  }
};

const EVENT_LABELS: Record<string, string> = {
  project_open: "Opened a project",
  cv_download: "Downloaded the CV",
  email_click: "Clicked the email",
  phone_click: "Clicked the phone number",
  social_click: "Opened a social profile",
  source_click: "Opened source / live link",
  contact_submit: "Sent the contact form",
};

function Stat({ label, kpi, format = compact }: { label: string; kpi: Kpi; format?: (n: number) => string }) {
  return (
    <div className="flex flex-col gap-1.5 border-line px-5 py-4 [&:not(:first-child)]:border-l max-sm:[&:nth-child(3)]:border-l-0">
      <p className="meta">{label}</p>
      <p className="display num text-[34px]">{format(kpi.value)}</p>
      <Delta now={kpi.value} before={kpi.previous} />
    </div>
  );
}

export function Analytics() {
  const [range, setRange] = useRange();
  const q = useQuery({ queryKey: ["analytics", range], queryFn: () => api.get<Traffic>(`/analytics?range=${range}`), placeholderData: keepPreviousData });

  return (
    <>
      <PageHeader
        eyebrow="cookieless · no personal data stored"
        title="Analytics"
        description="Counted from the site itself. Visitors are recognised for one day only, so the same person on two days counts twice — that is the price of not using cookies."
        actions={<Segmented label="Date range" value={range} options={RANGES} onChange={setRange} />}
      />
      {q.isPending && <Spinner />}
      {q.isError && <ErrorBlock error={q.error} retry={() => q.refetch()} />}
      {q.data && <Body t={q.data} refreshing={q.isPlaceholderData} />}
    </>
  );
}

function Body({ t, refreshing }: { t: Traffic; refreshing: boolean }) {
  const k = t.kpis;
  const visitors = Math.max(1, k.visitors.value);
  const perVisitor: Kpi = { value: k.pageviews.value / visitors, previous: k.pageviews.previous / Math.max(1, k.visitors.previous), series: [] };
  const conversion: Kpi = {
    value: (k.cvDownloads.value + k.messages.value) / visitors,
    previous: (k.cvDownloads.previous + k.messages.previous) / Math.max(1, k.visitors.previous),
    series: [],
  };

  return (
    <div className={`flex flex-col gap-5 ${refreshing ? "is-refreshing" : ""}`}>
      <section className="card overflow-hidden">
        <div className="grid grid-cols-2 border-b border-line sm:grid-cols-3 xl:grid-cols-6">
          <Stat label="visitors" kpi={k.visitors} />
          <Stat label="page views" kpi={k.pageviews} />
          <Stat label="views per visitor" kpi={perVisitor} format={(n) => n.toFixed(2)} />
          <Stat label="project opens" kpi={k.projectOpens} />
          <Stat label="cv downloads" kpi={k.cvDownloads} />
          <Stat label="reached out" kpi={conversion} format={(n) => pct(n)} />
        </div>
        <div className="p-5">
          <AreaChart days={t.days} values={k.visitors.series} previous={t.previousVisitors} label="Visitors" height={280} />
          <ChartLegend />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <SectionTitle title="Sources" meta="where the visit came from" />
          <BarList valueLabel="visitors" rows={t.sources.map((s) => ({ label: s.value, value: s.visitors }))} />
        </section>
        <section className="card p-5">
          <SectionTitle title="Campaigns" meta="?utm_source= in your links" />
          <BarList
            valueLabel="visitors"
            rows={t.campaigns.map((s) => ({ label: s.value, value: s.visitors }))}
            empty="No campaign links used. Add ?utm_source=linkedin-post to links you share to see them here."
          />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="card p-5">
          <SectionTitle title="Countries" />
          <BarList valueLabel="visitors" rows={t.countries.map((c) => ({ label: countryName(c.value), value: c.visitors }))} />
        </section>
        <section className="card p-5">
          <SectionTitle title="Devices" />
          <BarList valueLabel="visitors" rows={t.devices.map((d) => ({ label: d.value, value: d.visitors, hint: pct(d.visitors / visitors, 0) }))} />
        </section>
        <section className="card p-5">
          <SectionTitle title="Browsers" />
          <BarList valueLabel="visitors" rows={t.browsers.map((b) => ({ label: b.value, value: b.visitors }))} />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-1">
          <SectionTitle title="What visitors did" meta="events" />
          <table className="table">
            <thead>
              <tr>
                <th>action</th>
                <th className="text-right">times</th>
                <th className="text-right">people</th>
              </tr>
            </thead>
            <tbody>
              {t.events.totals.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-mute">
                    Nothing recorded in this range.
                  </td>
                </tr>
              )}
              {[...t.events.totals]
                .sort((a, b) => b.total - a.total)
                .map((e) => (
                  <tr key={e.name}>
                    <td>{EVENT_LABELS[e.name] ?? e.name}</td>
                    <td className="num text-right font-mono text-[12.5px]">{num(e.total)}</td>
                    <td className="num text-right font-mono text-[12.5px] text-mute">{num(e.visitors)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
        <section className="card p-5">
          <SectionTitle title="Projects opened" />
          <BarList valueLabel="opens" rows={t.events.projects.map((p) => ({ label: p.label, value: p.total }))} />
        </section>
        <section className="card p-5">
          <SectionTitle title="Links followed" meta="source, live, certificates, social" />
          <BarList valueLabel="clicks" rows={[...t.events.outbound, ...t.events.social].sort((a, b) => b.total - a.total).map((p) => ({ label: p.label, value: p.total }))} />
        </section>
      </div>
    </div>
  );
}
