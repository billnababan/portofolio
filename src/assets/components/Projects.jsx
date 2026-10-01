import { useEffect, useRef, useState } from "react";
import Picture from "./Picture";
import ImageDialog from "./ImageDialog";
import { ArrowUpRight } from "./Icons";
import { projects } from "../../data/projects";

// Index of projects. On devices with a mouse, a screenshot follows the pointer
// while a row is hovered; clicking a row opens the project with its screenshot.
export default function Projects() {
  const [open, setOpen] = useState(null);
  const [hovered, setHovered] = useState(null);
  const previewRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Ease the preview toward the pointer; the loop stops once it has caught up.
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let frame = 0;
    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      preview.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    list.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      list.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section id="projects" aria-labelledby="projects-title" className="pb-28 md:pb-40">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
          <h2 id="projects-title" className="text-display font-semibold">
            Selected work
          </h2>
          <p className="meta max-w-[34ch]">
            {projects.length} web applications, with the stack and my role. Open one to see it full size.
          </p>
        </div>

        <ul ref={listRef} onPointerLeave={() => setHovered(null)}>
          {projects.map((p) => (
            <li key={p.id} className="border-b border-line" data-reveal>
              <button
                type="button"
                onClick={() => setOpen(p)}
                onPointerEnter={() => setHovered(p.id)}
                onFocus={() => setHovered(null)}
                className="group grid w-full grid-cols-1 items-center gap-x-8 gap-y-4 py-8 text-left md:grid-cols-12 md:py-10"
              >
                {/* Inline screenshot on touch / small screens, where there is no hover preview */}
                <Picture
                  name={p.image}
                  alt=""
                  sizes="100vw"
                  maxWidth={800}
                  className="block overflow-hidden rounded-xl md:hidden"
                  imgClassName="aspect-[16/10] h-auto w-full object-cover object-left-top"
                />
                <span className="md:col-span-7">
                  <span className="block text-[clamp(1.75rem,1.2rem_+_2.2vw,3.25rem)] font-semibold leading-[1.02] tracking-tight transition-[color,transform] duration-300 group-hover:translate-x-3 group-hover:text-accent">
                    {p.title}
                  </span>
                  {p.role && <span className="meta mt-3 block">role: {p.role.toLowerCase()}</span>}
                </span>
                <span className="meta md:col-span-4">{p.stack.join(", ").toLowerCase()}</span>
                <span className="hidden justify-self-end md:col-span-1 md:flex">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-ink">
                    <ArrowUpRight size={20} className="nudge" />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Pointer-following preview (decorative; the dialog carries the real image + alt text). */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className={`cursor-preview pointer-events-none fixed left-0 top-0 z-30 hidden md:block ${hovered ? "opacity-100 [scale:1]" : "opacity-0 [scale:0.85]"}`}
      >
        <div className="-translate-y-1/2 translate-x-8 overflow-hidden rounded-2xl border border-line shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)]">
          {projects.map((p) => (
            <Picture
              key={p.id}
              name={p.image}
              alt=""
              sizes="420px"
              maxWidth={480}
              className={hovered === p.id ? "block" : "hidden"}
              imgClassName="aspect-[16/10] h-auto w-[26rem] object-cover object-left-top"
            />
          ))}
        </div>
      </div>

      <ImageDialog item={open} onClose={() => setOpen(null)}>
        {open && (
          <div className="grid gap-6 p-6 md:grid-cols-12 md:p-8">
            <div className="md:col-span-7">
              <p className="max-w-prose text-lead">{open.summary}</p>
              {open.role && (
                <p className="meta mt-3">
                  role: <span className="text-text">{open.role}</span>
                </p>
              )}
            </div>
            <div className="md:col-span-5">
              <p className="meta">stack</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {open.stack.map((t) => (
                  <li key={t} className="rounded-full border border-line px-3 py-1 text-sm">
                    {t}
                  </li>
                ))}
              </ul>
              {open.sourceUrl && (
                <a href={open.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn-accent group mt-6">
                  Source on GitHub
                  <span className="sr-only"> (opens in a new tab)</span>
                  <ArrowUpRight size={18} className="nudge" />
                </a>
              )}
              {open.liveUrl && (
                <a href={open.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-line group ml-3 mt-6">
                  Live site
                  <span className="sr-only"> (opens in a new tab)</span>
                  <ArrowUpRight size={18} className="nudge" />
                </a>
              )}
            </div>
          </div>
        )}
      </ImageDialog>
    </section>
  );
}
