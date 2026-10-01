import { useEffect, useRef } from "react";
import Picture from "./Picture";
import { Close } from "./Icons";

// Native modal <dialog>: the browser handles focus containment, Esc and the
// inert background. We open it when `item` is set, and on close return focus
// to the element that opened it. The full-size image is only requested on open.
// `children` (optional) renders below the image, e.g. project details.
export default function ImageDialog({ item, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!item || !dialog) return;
    const opener = document.activeElement;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [item]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // click on the backdrop (outside the panel) closes
        if (e.target === ref.current) ref.current.close();
      }}
      aria-labelledby="image-dialog-title"
      className="m-auto w-[min(100vw_-_1.5rem,72rem)] max-h-[calc(100dvh_-_1.5rem)] overflow-auto rounded-3xl border border-line bg-raised p-0 text-text"
    >
      {item && (
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-5 md:px-8">
            <h2 id="image-dialog-title" className="pt-1.5 text-[clamp(1.375rem,1.1rem_+_1vw,2rem)] font-semibold leading-tight tracking-tight">
              {item.title}
            </h2>
            <button
              type="button"
              onClick={() => ref.current.close()}
              className="inline-flex h-11 min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-full border border-line px-3 text-sm font-medium transition-colors hover:border-text"
            >
              <Close size={16} />
              Close
            </button>
          </div>
          <Picture
            name={item.image}
            alt={item.alt}
            sizes="(min-width: 1200px) 1150px, 100vw"
            loading="eager"
            imgClassName="mx-auto h-auto max-h-[calc(100dvh_-_12rem)] w-auto max-w-full object-contain"
            className="mx-4 block overflow-hidden rounded-2xl bg-coal md:mx-6"
          />
          {children ?? <div className="h-6" />}
        </div>
      )}
    </dialog>
  );
}
