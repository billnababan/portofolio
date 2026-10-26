import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { change } from "../../lib/format";
import { Icon, type IconName } from "./Icon";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="min-w-0">
        {eyebrow && <p className="meta mb-3">{eyebrow}</p>}
        <h1 className="display text-[clamp(2.5rem,4.2vw,3.75rem)]">
          {title}
          <span className="text-faint">.</span>
        </h1>
        {description && <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-mute">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ title, meta, action }: { title: string; meta?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>
      <div className="flex items-baseline gap-3">
        {meta && <span className="meta">{meta}</span>}
        {action}
      </div>
    </div>
  );
}

// ▲ 12% / ▼ 4% against the previous period. Direction is spelled out for screen readers.
// `inverse` for metrics where lower is better (search position).
export function Delta({ now, before, inverse = false }: { now: number; before: number; inverse?: boolean }) {
  const c = change(now, before);
  if (c === null) return <span className="meta">no earlier data</span>;
  const up = c > 0;
  const good = inverse ? !up : up;
  const flat = Math.abs(c) < 0.005;
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[11.5px] ${flat ? "text-mute" : good ? "text-fg" : "text-bad"}`}>
      {!flat && <Icon name={up ? "up" : "down"} size={11} strokeWidth={2.4} />}
      <span className="num">{flat ? "no change" : `${Math.abs(c * 100).toFixed(0)}%`}</span>
      <span className="sr-only">{flat ? "" : up ? "up" : "down"} on the previous period</span>
    </span>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: IconName; title: string; body: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-mute">
        <Icon name={icon} size={18} />
      </span>
      <p className="text-[15px] font-semibold">{title}</p>
      <p className="max-w-[44ch] text-[13.5px] leading-relaxed text-mute">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function StatusPill({ status }: { status: "draft" | "published" }) {
  return status === "published" ? (
    <span className="chip border-line-strong">
      <span className="h-1.5 w-1.5 rounded-full bg-fg" aria-hidden="true" />
      shown
    </span>
  ) : (
    <span className="chip text-mute">
      <span className="h-1.5 w-1.5 rounded-full border border-mute" aria-hidden="true" />
      hidden
    </span>
  );
}

export function LinkCard({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="ul inline-flex items-center gap-1 text-[13px] text-mute hover:text-fg">
      {children}
      <Icon name="arrowUpRight" size={13} />
    </Link>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-16 text-mute">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-fg" aria-hidden="true" />
      <span className="meta">{label.toLowerCase()}…</span>
    </div>
  );
}

export function ErrorBlock({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div role="alert" className="card flex flex-wrap items-center justify-between gap-4 border-bad/30 p-5 text-bad">
      <span className="flex items-center gap-2">
        <Icon name="alert" />
        {error instanceof Error ? error.message : "Something went wrong."}
      </span>
      {retry && (
        <button type="button" className="btn" onClick={retry}>
          <span>Try again</span>
        </button>
      )}
    </div>
  );
}
