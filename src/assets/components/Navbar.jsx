import { useEffect, useRef, useState } from "react";
import DarkModeToggle from "./DarkModeToggle";
import { Close, Menu } from "./Icons";
import { person, sections } from "../../data/site";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(null);
  const menuRef = useRef(null);
  const progressRef = useRef(null);

  // Solid background after the page has scrolled, plus the reading-progress bar
  // (transform only, written once per frame through CSSOM).
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 8);
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
    // The hero (#top) is observed too, so scrolling back up clears the active link.
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

  const linkClass = (id) =>
    `inline-flex min-h-[40px] items-center rounded-full px-4 text-[0.9375rem] font-medium transition-colors ${
      active === id ? "bg-accent text-on-accent" : "text-muted hover:bg-sunken hover:text-ink"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors ${
        scrolled ? "border-line bg-paper/95 backdrop-blur-sm" : "border-transparent bg-paper"
      }`}
    >
      <span
        ref={progressRef}
        className="absolute inset-x-0 bottom-[-1px] h-0.5 origin-left scale-x-0 bg-accent"
        aria-hidden="true"
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-on-accent"
      >
        Skip to content
      </a>

      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a href="#top" className="inline-flex min-h-[44px] items-center gap-2.5 font-semibold tracking-tight">
          <img src="/images/K.svg" alt="" width="14" height="18" />
          {person.shortName}
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className={linkClass(s.id)} aria-current={active === s.id ? "true" : undefined}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <DarkModeToggle />
          <button
            type="button"
            onClick={openMenu}
            aria-haspopup="dialog"
            aria-controls="mobile-menu"
            className="inline-flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-sunken md:hidden"
          >
            <Menu />
            Menu
          </button>
        </div>
      </div>

      {/* Mobile menu: full-height native modal dialog (focus contained, Esc closes, focus returns to the button). */}
      <dialog
        ref={menuRef}
        id="mobile-menu"
        aria-label="Site menu"
        className="sheet m-0 ml-auto h-dvh max-h-none w-[min(100vw,22rem)] max-w-none border-l border-line bg-paper p-0 text-ink md:hidden"
      >
        <div className="flex h-16 items-center justify-end px-5">
          <button
            type="button"
            onClick={closeMenu}
            className="inline-flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-sunken"
          >
            <Close />
            Close
          </button>
        </div>
        <nav aria-label="Site sections">
          <ul className="px-5">
            {sections.map((s) => (
              <li key={s.id} className="border-b border-line">
                <a
                  href={`#${s.id}`}
                  onClick={closeMenu}
                  aria-current={active === s.id ? "true" : undefined}
                  className={`flex min-h-[60px] items-center text-2xl font-semibold tracking-tight transition-colors hover:text-muted ${active === s.id ? "underline decoration-accent decoration-4 underline-offset-8" : ""}`}
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
