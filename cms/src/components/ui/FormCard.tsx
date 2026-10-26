import type { ReactNode } from "react";

// A titled form section with its own Save. Save/Discard light up only when something changed.
export function FormCard({ id, title, description, children, dirty, saving, onSave, onReset }: { id?: string; title: string; description?: ReactNode; children: ReactNode; dirty: boolean; saving: boolean; onSave: () => void; onReset: () => void }) {
  return (
    <section id={id} className="card scroll-mt-20" aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="border-b border-line px-6 py-5">
        <h2 id={id ? `${id}-title` : undefined} className="text-[16px] font-semibold tracking-[-0.01em]">
          {title}
        </h2>
        {description && <p className="mt-1 max-w-[70ch] text-[13.5px] leading-relaxed text-mute">{description}</p>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <div className="flex flex-col gap-5 px-6 py-6">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-3.5">
          {dirty && <span className="meta mr-auto">unsaved changes</span>}
          <button type="button" className="btn-ghost" onClick={onReset} disabled={!dirty || saving}>
            Discard
          </button>
          <button type="submit" className="btn-primary" disabled={!dirty || saving}>
            <span>{saving ? "Saving…" : "Save"}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
