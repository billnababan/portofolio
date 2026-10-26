import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

type Toast = { id: number; text: string; tone: "ok" | "error" };
type Confirm = { title: string; body: ReactNode; action: string; danger?: boolean; resolve: (ok: boolean) => void };

const Ctx = createContext<{ toast: (text: string, tone?: Toast["tone"]) => void; confirm: (c: Omit<Confirm, "resolve">) => Promise<boolean> } | null>(null);

// Toasts (bottom-right, polite) and a promise-based confirm dialog.
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirm] = useState<Confirm | null>(null);
  const next = useRef(1);

  const toast = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = next.current++;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 7000 : 3500);
  }, []);

  const confirm = useCallback((c: Omit<Confirm, "resolve">) => new Promise<boolean>((resolve) => setConfirm({ ...c, resolve })), []);

  const close = (ok: boolean) => {
    confirmState?.resolve(ok);
    setConfirm(null);
  };

  return (
    <Ctx.Provider value={{ toast, confirm }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(380px,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`toast pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-[13.5px] shadow-[0_20px_50px_-15px_rgb(0_0_0/0.9)] ${t.tone === "error" ? "border-bad/40 bg-card text-bad" : "border-line-strong bg-fg text-bg"}`}>
            <Icon name={t.tone === "error" ? "alert" : "check"} size={16} className="mt-0.5 shrink-0" />
            <span>{t.text}</span>
          </div>
        ))}
      </div>
      <Modal open={confirmState !== null} onClose={() => close(false)} title={confirmState?.title ?? ""} size="sm">
        <div className="text-[14px] leading-relaxed text-mute">{confirmState?.body}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn" onClick={() => close(false)}>
            <span>Cancel</span>
          </button>
          <button type="button" className={confirmState?.danger ? "btn-danger" : "btn-primary"} onClick={() => close(true)} autoFocus>
            <span>{confirmState?.action}</span>
          </button>
        </div>
      </Modal>
    </Ctx.Provider>
  );
}

export const useFeedback = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFeedback outside FeedbackProvider");
  return ctx;
};
