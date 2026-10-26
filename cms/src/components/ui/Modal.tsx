import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

// Native <dialog>: focus trap, Esc and inert background come from the browser.
// "sheet" slides in from the right for longer editors.
export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  variant = "modal",
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "modal" | "sheet";
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const width = { sm: "max-w-[440px]", md: "max-w-[620px]", lg: "max-w-[860px]", xl: "max-w-[1120px]" }[size];
  const placement =
    variant === "sheet"
      ? `sheet m-0 ml-auto h-dvh max-h-none w-full ${width} rounded-none border-l`
      : `modal m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] ${width} rounded-2xl border`;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className={`${placement} flex-col overflow-hidden border-line bg-card p-0 text-fg open:flex`}
    >
      {open && (
        <>
          <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
            <h2 id="modal-title" className="text-[17px] font-semibold tracking-[-0.01em]">
              {title}
            </h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <Icon name="x" size={15} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
        </>
      )}
    </dialog>
  );
}
