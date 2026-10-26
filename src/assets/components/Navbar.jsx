import { useEffect, useRef, useState } from "react";
import { Close, Menu } from "./Icons";
import site from "../../content/site.json";

// Page order = nav order. Ids must match the <section id>s.
const sections = [
  { id: "story", label: "Story" },
  { id: "work", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [active, setActive] = useState(null);
  const menuRef = useRef(null);
  const progressRef = useRef(null);

  // Reading-progress line (transform only, written once per frame through CSSOM).
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Active section = the one crossing the middle of the viewport.
  useEffect(() => {
    const targets = ["top", ...sections.map((s) => s.id)].map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id === "top" ? null : entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  const openMenu = () => menuRef.current?.showModal();
  const closeMenu = () => menuRef.current?.close();

  const brand = (
    <>
      <span className="h-2 w-2 rounded-full bg-fg" aria-hidden="true" />
      <span className="lowercase">© {site.person.shortName}</span>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <span ref={progressRef} className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-fg" aria-hidden="true" />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:font-semibold focus:text-bg"
      >
        Skip to content
      </a>

      <div className="container-page flex h-14 items-center justify-between gap-4">
        <a href="#top" className="inline-flex min-h-[44px] items-center gap-2.5 text-[15px] font-bold">
          {brand}
          <span className="meta hidden sm:inline">/ {site.person.role.toLowerCase()}</span>
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "true" : undefined}
                  className={`ul inline-flex min-h-[44px] items-center transition-colors hover:text-fg ${active === s.id ? "text-fg" : "text-mute"}`}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={openMenu}
          aria-haspopup="dialog"
          aria-controls="mobile-menu"
          className="inline-flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-full px-3 text-sm md:hidden"
        >
          <Menu size={18} />
          menu
        </button>
      </div>

      {/* Mobile menu: full-screen native modal dialog (focus contained, Esc closes, focus returns to the button). */}
      <dialog ref={menuRef} id="mobile-menu" aria-label="Site menu" className="sheet m-0 h-dvh max-h-none w-screen max-w-none bg-bg p-0 text-fg md:hidden">
        <div className="container-page flex h-14 items-center justify-between border-b border-line">
          <span className="inline-flex items-center gap-2.5 text-[15px] font-bold">{brand}</span>
          <button type="button" onClick={closeMenu} className="inline-flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-full px-3 text-sm">
            <Close size={18} />
            close
          </button>
        </div>
        <nav aria-label="Site sections" className="container-page mt-10">
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={closeMenu}
                  aria-current={active === s.id ? "true" : undefined}
                  className={`condensed block py-1.5 text-[clamp(3rem,14vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] transition-colors hover:text-fg ${
                    active === s.id ? "text-fg" : "text-mute"
                  }`}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </header>
  );
}
