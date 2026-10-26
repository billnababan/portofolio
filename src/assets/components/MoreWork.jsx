import { useEffect, useRef, useState } from "react";
import Picture from "./Picture";
import ImageDialog from "./ImageDialog";
import { ArrowUpRight } from "./Icons";
import { trackEvent } from "../../track.js";
import site from "../../content/site.json";
import projects from "../../content/projects.json";

const more = projects.filter((p) => !p.featured);
const firstNumber = projects.length - more.length + 1;

// Index of the smaller projects. On hover a white fill rises behind the row and,
// with a mouse, the screenshot follows the pointer. Clicking opens the project.
export default function MoreWork() {
  const [open, setOpen] = useState(null);
  const [hovered, setHovered] = useState(null);
  const previewRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview) return;
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

  if (more.length === 0) return null;

  const openProject = (p) => {
    trackEvent("project_open", p.id);
    setOpen(p);
  };

  return (
    <section aria-labelledby="more-title" className="pb-28 md:pb-36">
      <div className="container-page">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <h2 id="more-title" className="condensed text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[0.9] tracking-[-0.03em]" data-reveal>
            {site.work.moreTitle}
            <span className="text-faint">.</span>
          </h2>
          <p className="meta max-w-[300px] leading-[1.7]">{site.work.moreNote}</p>
        </div>

        <ul ref={listRef} onPointerLeave={() => setHovered(null)} className="border-b border-line">
          {more.map((p, i) => (
            <li key={p.id} data-reveal>
              <button
                type="button"
                onClick={() => openProject(p)}
                onPointerEnter={() => setHovered(p.id)}
                onFocus={() => setHovered(null)}
                className="row-fill group relative grid w-full grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-4 border-t border-line px-3 py-6 text-left text-fg sm:px-5 md:grid-cols-[72px_minmax(0,1.3fr)_minmax(0,1fr)_52px] md:gap-6 md:py-7"
              >
                <span className="meta relative transition-colors duration-500 group-hover:text-bg">{String(firstNumber + i).padStart(2, "0")}</span>
                <span className="relative">
                  <span className="block text-[clamp(1.25rem,2.2vw,2rem)] font-semibold leading-[1.05] tracking-[-0.02em] transition-[color,transform] duration-500 ease-out group-hover:translate-x-3.5 group-hover:text-bg">
                    {p.title}
                  </span>
                  {p.role && <span className="meta mt-2 block transition-colors duration-500 group-hover:text-bg">role: {p.role.toLowerCase()}</span>}
                </span>
                <span className="meta relative hidden leading-[1.6] transition-colors duration-500 group-hover:text-bg md:block">{p.stack.join(", ").toLowerCase()}</span>
                <span className="relative flex h-11 w-11 items-center justify-center justify-self-end rounded-full border border-current transition-[color,transform] duration-500 ease-out group-hover:rotate-45 group-hover:text-bg">
                  <ArrowUpRight size={16} />
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
        <div className="-translate-y-1/2 translate-x-8 -rotate-2 overflow-hidden rounded-2xl border border-line shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]">
          {more.map((p) => (
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
              <p className="max-w-prose text-lg leading-relaxed">{open.summary}</p>
              {open.role && (
                <p className="meta mt-3">
                  role: <span className="text-fg">{open.role}</span>
                </p>
              )}
            </div>
            <div className="md:col-span-5">
              <p className="meta">stack</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {open.stack.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                {open.sourceUrl && (
                  <a
                    href={open.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-solid group"
                    data-track="source_click"
                    data-label={`${open.id}:source`}
                  >
                    <span>Source on GitHub</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                    <ArrowUpRight size={16} className="nudge" />
                  </a>
                )}
                {open.liveUrl && (
                  <a href={open.liveUrl} target="_blank" rel="noopener noreferrer" className="btn group" data-track="source_click" data-label={`${open.id}:live`}>
                    <span>Live site</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                    <ArrowUpRight size={16} className="nudge" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </ImageDialog>
    </section>
  );
}
