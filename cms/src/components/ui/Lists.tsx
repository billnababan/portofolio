import { useState, type ReactNode } from "react";
import { Icon } from "./Icon";

export const move = <T,>(items: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
};

export function MoveButtons({ index, length, onMove, label }: { index: number; length: number; onMove: (to: number) => void; label: string }) {
  return (
    <span className="flex shrink-0 gap-1">
      <button type="button" className="icon-btn h-8 w-8" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Move ${label} up`}>
        <Icon name="up" size={13} />
      </button>
      <button type="button" className="icon-btn h-8 w-8" disabled={index === length - 1} onClick={() => onMove(index + 1)} aria-label={`Move ${label} down`}>
        <Icon name="down" size={13} />
      </button>
    </span>
  );
}

// Tags typed one by one: Enter or comma adds, × removes. Used for stack, keywords, topics.
export function ChipsInput({ label, value, onChange, placeholder, help, error, max }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; help?: ReactNode; error?: string; max?: number }) {
  const [draft, setDraft] = useState("");
  // "react, express" pasted or typed with commas becomes two chips.
  const addFrom = (raw: string) => {
    const next = [...value];
    for (const part of raw.split(",").map((s) => s.trim())) {
      if (part && !next.includes(part) && (max === undefined || next.length < max)) next.push(part);
    }
    if (next.length !== value.length) onChange(next);
    setDraft("");
  };
  const add = () => addFrom(draft);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-semibold">{label}</span>
        {max !== undefined && <span className="meta num">{value.length}/{max}</span>}
      </div>
      <div className={`flex flex-wrap items-center gap-1.5 rounded-xl border bg-bg p-2 transition-colors focus-within:border-fg ${error ? "border-bad/70" : "border-line hover:border-line-strong"}`}>
        {value.map((v, i) => (
          <span key={v} className="chip normal-case">
            {v}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="-mr-1 rounded-full p-0.5 text-mute hover:text-fg" aria-label={`Remove ${v}`}>
              <Icon name="x" size={11} strokeWidth={2.4} />
            </button>
          </span>
        ))}
        <input
          aria-label={`Add to ${label}`}
          className="min-w-[140px] flex-1 bg-transparent px-1.5 py-1 text-[14px] placeholder:text-faint focus:outline-none"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => (e.target.value.includes(",") ? addFrom(e.target.value) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
            if (e.key === "Backspace" && draft === "" && value.length > 0) onChange(value.slice(0, -1));
          }}
          onBlur={add}
        />
      </div>
      {help && !error && <p className="text-[12.5px] text-mute">{help}</p>}
      {error && <p className="text-[12.5px] text-bad">{error}</p>}
    </div>
  );
}

// An ordered list of short or long texts, each with move and remove.
export function StringList({ label, value, onChange, addLabel, multiline, help, error, max, itemLabel = "item" }: { label: string; value: string[]; onChange: (v: string[]) => void; addLabel: string; multiline?: boolean; help?: ReactNode; error?: string; max?: number; itemLabel?: string }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 flex w-full items-baseline justify-between text-[13px] font-semibold">
        {label}
        {max !== undefined && <span className="meta num font-normal">{value.length}/{max}</span>}
      </legend>
      {value.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="meta num w-5 pt-3 text-right">{i + 1}</span>
          {multiline ? (
            <textarea aria-label={`${itemLabel} ${i + 1}`} className="input" rows={2} value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
          ) : (
            <input aria-label={`${itemLabel} ${i + 1}`} className="input" value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
          )}
          <span className="flex gap-1 pt-1">
            <MoveButtons index={i} length={value.length} onMove={(to) => onChange(move(value, i, to))} label={`${itemLabel} ${i + 1}`} />
            <button type="button" className="icon-btn h-8 w-8 hover:!border-bad hover:!text-bad" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${itemLabel} ${i + 1}`}>
              <Icon name="trash" size={13} />
            </button>
          </span>
        </div>
      ))}
      <button type="button" className="btn-ghost self-start" disabled={max !== undefined && value.length >= max} onClick={() => onChange([...value, ""])}>
        <Icon name="plus" size={14} />
        {addLabel}
      </button>
      {help && !error && <p className="text-[12.5px] text-mute">{help}</p>}
      {error && <p className="text-[12.5px] text-bad">{error}</p>}
    </fieldset>
  );
}
