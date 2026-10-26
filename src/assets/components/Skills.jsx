import { useState } from "react";
import { Plus } from "./Icons";
import site from "../../content/site.json";
import layers from "../../content/skills.json";

// Skills in the order a request travels: data, API, interface, then what's underneath.
// An accordion: one layer open at a time, the first open by default.
export default function Skills() {
  const [open, setOpen] = useState(0);

  return (
    <section id="skills" aria-labelledby="skills-title" className="pb-28 md:pb-36">
      <div className="container-page">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 id="skills-title" className="condensed text-display font-extrabold" data-reveal>
            {site.skills.title}
            <span className="text-faint">.</span>
          </h2>
          <p className="meta max-w-[320px] leading-[1.7]">{site.skills.note}</p>
        </div>

        <div className="border-b border-line">
          {layers.map((layer, i) => {
            const isOpen = open === i;
            const panelId = `layer-${i}`;
            return (
              <div key={layer.title} className={isOpen ? "is-open" : ""} data-reveal>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="group grid w-full grid-cols-[minmax(0,72px)_minmax(0,1fr)_44px] items-center gap-4 border-t border-line py-6 text-left sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)_52px] sm:gap-6"
                  >
                    <span className="outline-num condensed num text-[clamp(4rem,8vw,7.5rem)] font-light leading-[0.8]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex flex-col gap-1.5">
                      <span className="text-[clamp(1.625rem,3vw,2.75rem)] font-semibold leading-none tracking-[-0.02em]">{layer.title}</span>
                      <span className="meta">{layer.sub}</span>
                    </span>
                    <span
                      className={`flex h-11 w-11 items-center justify-center justify-self-end rounded-full border border-line transition-transform duration-500 ease-out ${isOpen ? "rotate-45" : ""}`}
                    >
                      <Plus size={16} />
                    </span>
                  </button>
                </h3>
                <div id={panelId} className={`accordion ${isOpen ? "is-open" : ""}`} inert={isOpen ? undefined : ""}>
                  <div>
                    <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5 pb-8">
                      {layer.items.map((it) => (
                        <li key={it.name} className="flex items-center justify-between rounded-xl border border-line bg-card px-[18px] py-4">
                          <span className="text-[17px] font-semibold">{it.name}</span>
                          <span className="meta">{it.tag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
