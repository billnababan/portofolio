import { useEffect, useRef, useState } from "react";
import { Close, Menu } from "./Icons";
import { sections } from "../../data/site";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(null);
  const menuRef = useRef(null);
  const progressRef = useRef(null);

  // Background after the page has scrolled, plus the reading-progress line
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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${scrolled ? "bg-coal/85 backdrop-blur-md" : "bg-transparent"}`}
    >
      <span ref={progressRef} className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent" aria-hidden="true" />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>

      <div className="container-page flex h-14 items-center justify-between gap-4">
        <a href="#top" className="inline-flex min-h-[44px] items-center text-lg font-semibold tracking-tight">
          bill jeferson<span className="text-accent">.</span>
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "true" : undefined}
                  className={`relative inline-flex min-h-[44px] items-center px-3 text-sm transition-colors hover:text-text ${
                    active === s.id ? "text-text" : "text-muted"
                  }`}
                >
                  {active === s.id && (
                    <span className="absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent" aria-hidden="true" />
                  )}
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
      <dialog
        ref={menuRef}
        id="mobile-menu"
        aria-label="Site menu"
        className="sheet m-0 h-dvh max-h-none w-screen max-w-none bg-coal p-0 text-text md:hidden"
      >
        <div className="container-page flex h-14 items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">
            bill jeferson<span className="text-accent">.</span>
          </span>
          <button
            type="button"
            onClick={closeMenu}
            className="inline-flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-full px-3 text-sm"
          >
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
                  className={`block py-2 text-[clamp(2.5rem,10vw,3.5rem)] font-semibold leading-tight tracking-tight transition-colors hover:text-accent ${
                    active === s.id ? "text-accent" : ""
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
