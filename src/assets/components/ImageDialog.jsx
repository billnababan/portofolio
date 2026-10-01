import { useEffect, useRef } from "react";
import Picture from "./Picture";
import { Close } from "./Icons";

// Native modal <dialog>: the browser handles focus containment, Esc and the
// inert background. We open it when `item` is set, and on close return focus
// to the element that opened it. The full-size image is only requested on open.
export default function ImageDialog({ item, onClose }) {
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
      className="m-auto w-[min(100vw_-_2rem,72rem)] max-h-[calc(100dvh_-_2rem)] overflow-auto rounded-lg border border-line bg-surface p-0 text-ink"
    >
      {item && (
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-3">
            <h2 id="image-dialog-title" className="pt-2 text-base font-semibold">
              {item.title}
            </h2>
            <button
              type="button"
              onClick={() => ref.current.close()}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-sunken"
            >
              <Close />
              Close
            </button>
          </div>
          <Picture
            name={item.image}
            alt={item.alt}
            sizes="(min-width: 1200px) 1150px, 100vw"
            loading="eager"
            imgClassName="mx-auto h-auto max-h-[calc(100dvh_-_8rem)] w-auto max-w-full object-contain"
            className="block bg-sunken"
          />
        </div>
      )}
    </dialog>
  );
}
