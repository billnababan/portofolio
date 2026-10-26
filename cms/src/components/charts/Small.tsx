import { useState } from "react";
import { compact, date } from "../../lib/format";

// Tiny trend line under a KPI. Decorative: the KPI number and delta carry the information.
export function Sparkline({ values, height = 34 }: { values: number[]; height?: number }) {
  if (values.length < 2) return <div style={{ height }} />;
  const w = 120;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * w).toFixed(1)},${(height - 2 - (v / max) * (height - 4)).toFixed(1)}`);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="block h-[34px] w-full" aria-hidden="true">
      <path d={`M${pts.join("L")}`} fill="none" stroke="rgb(242 242 239 / 0.75)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

// Ranked list with a magnitude bar behind each row (one hue: it is a single measure).
export function BarList({ rows, valueLabel, empty = "No data in this range yet." }: { rows: { label: string; value: number; hint?: string }[]; valueLabel: string; empty?: string }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  if (rows.length === 0) return <p className="py-6 text-[13px] text-mute">{empty}</p>;
  return (
    <div>
      <div className="mb-1.5 flex justify-between px-2">
        <span className="meta">name</span>
        <span className="meta">{valueLabel}</span>
      </div>
      <ul className="flex flex-col gap-1">
        {rows.map((r) => (
          <li key={r.label} className="group relative flex min-h-[34px] items-center justify-between gap-4 overflow-hidden rounded-md px-2.5">
            <span className="absolute inset-y-0 left-0 rounded-md bg-fg/[0.08] transition-colors group-hover:bg-fg/[0.14]" style={{ width: `${(r.value / max) * 100}%` }} aria-hidden="true" />
            <span className="relative truncate text-[13.5px]">
              {r.label}
              {r.hint && <span className="meta ml-2">{r.hint}</span>}
            </span>
            <span className="num relative font-mono text-[12.5px]">{compact(r.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// SEO score over the last audits: one thin bar per audit, newest on the right.
export function ScoreHistory({ items }: { items: { score: number; createdAt: string }[] }) {
  const [active, setActive] = useState<number | null>(null);
  if (items.length === 0) return null;
  const a = active === null ? null : items[active];
  return (
    <div>
      <div className="flex h-[64px] items-end justify-end gap-[3px]" onPointerLeave={() => setActive(null)}>
        {items.map((it, i) => (
          <button
            key={i}
            type="button"
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            aria-label={`Score ${it.score} on ${date(it.createdAt)}`}
            className="group flex h-full max-w-[18px] flex-1 items-end"
          >
            <span className={`w-full rounded-t-[3px] transition-colors ${i === items.length - 1 ? "bg-fg" : "bg-fg/30 group-hover:bg-fg/60"}`} style={{ height: `${Math.max(4, it.score)}%` }} />
          </button>
        ))}
      </div>
      <p className="meta mt-2 h-4">{a ? `${a.score} · ${date(a.createdAt)}` : items.length === 1 ? "first audit — the trend builds from the nightly checks" : `last ${items.length} audits`}</p>
    </div>
  );
}
