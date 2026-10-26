import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { day as fmtDay } from "../../lib/format";

type Props = {
  days: string[];
  values: number[];
  previous?: number[]; // same length; drawn dashed as "previous period"
  label: string;
  format?: (n: number) => string;
  height?: number;
  inverse?: boolean; // y axis grows downward (search position: 1 is best)
};

// Rounded-up axis maximum with 4 even steps: 0, 25, 50, 75, 100.
const niceMax = (v: number) => {
  if (v <= 0) return 4;
  const step = 10 ** Math.floor(Math.log10(v / 4));
  const candidates = [1, 2, 2.5, 5, 10].map((m) => m * step * 4);
  return candidates.find((c) => c >= v) ?? v;
};

const PAD = { top: 12, right: 12, bottom: 26, left: 40 };

// One series over time: 2px line on a 6% fill, optional dashed previous period,
// recessive grid, crosshair + tooltip on hover and with the arrow keys.
export function AreaChart({ days, values, previous, label, format = (n) => String(Math.round(n)), height = 240, inverse = false }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => e && setWidth(Math.max(260, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { x, y, line, area, prevLine, ticks } = useMemo(() => {
    const all = [...values, ...(previous ?? [])];
    const max = niceMax(Math.max(...all, 0));
    const innerW = width - PAD.left - PAD.right;
    const innerH = height - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (values.length <= 1 ? innerW / 2 : (i / (values.length - 1)) * innerW);
    const y = (v: number) => (inverse ? PAD.top + (v / max) * innerH : PAD.top + innerH - (v / max) * innerH);
    const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    const line = `M${pts.join("L")}`;
    const base = inverse ? PAD.top : PAD.top + innerH;
    const area = `${line}L${x(values.length - 1).toFixed(1)},${base}L${x(0).toFixed(1)},${base}Z`;
    const prevLine = previous ? `M${previous.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("L")}` : null;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
    return { x, y, line, area, prevLine, ticks };
  }, [values, previous, width, height, inverse]);

  const pick = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const innerW = width - PAD.left - PAD.right;
    const i = Math.round(((px - PAD.left) / innerW) * (values.length - 1));
    setActive(Math.min(values.length - 1, Math.max(0, i)));
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") setActive((a) => Math.min(values.length - 1, (a ?? -1) + 1));
    if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? values.length) - 1));
    if (e.key === "Escape") setActive(null);
  };

  const labelIdx = values.length > 1 ? [0, Math.floor((values.length - 1) / 2), values.length - 1] : [0];
  const a = active;
  const tipLeft = a !== null ? Math.min(Math.max(x(a) - 80, 0), width - 170) : 0;

  return (
    <div ref={wrap} className="relative w-full">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`${label}, ${days.length} days. Use the arrow keys to read each day.`}
        tabIndex={0}
        onPointerMove={pick}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        className="block touch-pan-y outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fg"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="rgb(255 255 255 / 0.07)" strokeWidth={1} />
            <text x={PAD.left - 10} y={y(t) + 3.5} textAnchor="end" className="fill-mute font-mono text-[10.5px]">
              {format(t)}
            </text>
          </g>
        ))}
        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={height - 6} textAnchor={i === 0 ? "start" : i === values.length - 1 ? "end" : "middle"} className="fill-mute font-mono text-[10.5px]">
            {days[i] ? fmtDay(days[i]) : ""}
          </text>
        ))}
        {prevLine && <path d={prevLine} fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth={1.5} strokeDasharray="4 4" />}
        {!inverse && <path d={area} fill="rgb(242 242 239 / 0.06)" />}
        <path d={line} fill="none" stroke="rgb(242 242 239)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {a !== null && (
          <g>
            <line x1={x(a)} x2={x(a)} y1={PAD.top} y2={height - PAD.bottom} stroke="rgb(255 255 255 / 0.35)" strokeWidth={1} />
            <circle cx={x(a)} cy={y(values[a] ?? 0)} r={5} fill="rgb(242 242 239)" stroke="rgb(14 14 14)" strokeWidth={2} />
          </g>
        )}
      </svg>
      {a !== null && (
        <div className="pointer-events-none absolute top-0 z-10 w-[170px] rounded-lg border border-line-strong bg-bg/95 px-3 py-2 shadow-[0_12px_30px_-10px_rgb(0_0_0/0.9)]" style={{ left: tipLeft }}>
          <p className="meta">{days[a] ? fmtDay(days[a]) : ""}</p>
          <p className="mt-1 flex items-center gap-2 text-[14px]">
            <span className="h-0.5 w-3 bg-fg" aria-hidden="true" />
            <strong className="num font-semibold">{format(values[a] ?? 0)}</strong>
            <span className="text-mute">{label.toLowerCase()}</span>
          </p>
          {previous && (
            <p className="mt-0.5 flex items-center gap-2 text-[13px] text-mute">
              <span className="w-3 border-t border-dashed border-mute" aria-hidden="true" />
              <span className="num">{format(previous[a] ?? 0)}</span> previous
            </p>
          )}
        </div>
      )}
      {/* The same numbers for screen readers. */}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>{label}</th>
            {previous && <th>Previous period</th>}
          </tr>
        </thead>
        <tbody>
          {days.map((d, i) => (
            <tr key={d}>
              <td>{d}</td>
              <td>{values[i]}</td>
              {previous && <td>{previous[i]}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
