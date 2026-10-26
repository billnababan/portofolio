import { useId, type ReactNode } from "react";

// Label + control + help + error, wired with ids for screen readers.
export function Field({
  label,
  help,
  error,
  count,
  max,
  children,
  className = "",
}: {
  label: string;
  help?: ReactNode;
  error?: string;
  count?: number;
  max?: number;
  children: (props: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const describedBy = [help ? `${id}-help` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
  const over = max !== undefined && count !== undefined && count > max;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold">
          {label}
        </label>
        {max !== undefined && count !== undefined && (
          <span className={`meta num ${over ? "!text-bad" : ""}`} aria-live="polite">
            {count}/{max}
          </span>
        )}
      </div>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {help && !error && (
        <p id={`${id}-help`} className="text-[12.5px] leading-snug text-mute">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[12.5px] text-bad">
          {error}
        </p>
      )}
    </div>
  );
}

type TextProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: ReactNode;
  error?: string;
  max?: number;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  autoComplete?: string;
  mono?: boolean;
};

export function TextField({ label, value, onChange, help, error, max, placeholder, type = "text", multiline, rows = 3, className, autoComplete, mono }: TextProps) {
  return (
    <Field label={label} help={help} error={error} count={max ? value.length : undefined} max={max} className={className}>
      {(a) =>
        multiline ? (
          <textarea {...a} className="input" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input {...a} className={`input ${mono ? "font-mono text-[13px]" : ""}`} type={type} value={value} placeholder={placeholder} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
        )
      }
    </Field>
  );
}

export function Switch({ checked, onChange, label, help }: { checked: boolean; onChange: (v: boolean) => void; label: string; help?: ReactNode }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <label htmlFor={id} className="text-[13px] font-semibold">
          {label}
        </label>
        {help && <p className="mt-0.5 text-[12.5px] leading-snug text-mute">{help}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 ${checked ? "border-fg bg-fg" : "border-line-strong bg-bg"}`}
      >
        <span className={`absolute top-[3px] h-4 w-4 rounded-full transition-all duration-300 ease-out ${checked ? "left-[22px] bg-bg" : "left-[3px] bg-mute"}`} />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string; count?: number }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-line p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3.5 text-[13px] transition-colors ${value === o.value ? "bg-fg font-semibold text-bg" : "text-mute hover:text-fg"}`}
        >
          {o.label}
          {o.count !== undefined && <span className={`num font-mono text-[11px] ${value === o.value ? "text-bg/60" : "text-faint"}`}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
