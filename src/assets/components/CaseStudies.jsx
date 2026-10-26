import { useState } from "react";
import Picture from "./Picture";
import ImageDialog from "./ImageDialog";
import { ArrowUpRight, Expand } from "./Icons";
import { trackEvent } from "../../track.js";
import site from "../../content/site.json";
import projects from "../../content/projects.json";

const cases = projects.filter((p) => p.featured);

function Flow({ stops }) {
  return (
    <ol aria-label="Stages a container goes through" className="flow grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4" data-reveal>
      {stops.map((stop, i) => (
        <li key={stop} className="relative flex flex-col gap-3 text-[15px] leading-snug">
          {/* connector to the next stop in the same row */}
          {(i + 1) % 4 !== 0 && i < stops.length - 1 && (
            <span aria-hidden="true" className={`absolute left-3 top-[5px] h-px w-full bg-line ${(i + 1) % 2 === 0 ? "max-sm:hidden" : ""}`} />
          )}
          <span aria-hidden="true" className="flow-dot relative h-[11px] w-[11px] rounded-full border border-fg bg-fg" />
          <span>{stop}</span>
        </li>
      ))}
    </ol>
  );
}

function Features({ items }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2" data-reveal>
      {items.map((f, i) => (
        <div key={f.title} className="flex flex-col gap-2 bg-bg p-5 transition-colors duration-300 hover:bg-card">
          <span className="meta">{String(i + 1).padStart(2, "0")}</span>
          <strong className="text-[19px] font-semibold tracking-[-0.01em]">{f.title}</strong>
          <span className="text-[15px] leading-normal text-mute">{f.text}</span>
        </div>
      ))}
    </div>
  );
}

function Case({ item, onOpen }) {
  return (
    <article aria-labelledby={`case-${item.id}`} className="grid grid-cols-1 gap-10 border-t border-line pb-20 pt-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16 lg:pb-24 lg:pt-[72px]">
      <div className="flex flex-col gap-5 self-start lg:sticky lg:top-24">
        <p className="meta">{item.kicker}</p>
        <h3 id={`case-${item.id}`} className="condensed text-case font-extrabold">
          {item.title}
        </h3>
        <p className="text-[19px] leading-snug">{item.summary}</p>
        <ul className="flex flex-wrap gap-2" aria-label="Stack">
          {item.stack.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
        {item.stats.length > 0 && (
          <dl className="mt-2 grid grid-cols-3 gap-x-5">
            {item.stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-2 border-t border-line py-5">
                <dt className="meta">{s.label}</dt>
                <dd className="condensed-x num text-[clamp(2.75rem,4vw,4rem)] font-extrabold leading-[0.85] tracking-[-0.03em]">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {item.note && <p className="meta mt-1 leading-[1.7]">{item.note}</p>}
        {(item.sourceUrl || item.liveUrl) && (
          <div className="flex flex-wrap gap-3 pt-2">
            {item.liveUrl && (
              <a href={item.liveUrl} className="btn-solid group" target="_blank" rel="noopener noreferrer" data-track="source_click" data-label={`${item.id}:live`}>
                <span>Live site</span>
                <ArrowUpRight size={16} className="nudge" />
              </a>
            )}
            {item.sourceUrl && (
              <a href={item.sourceUrl} className="btn group" target="_blank" rel="noopener noreferrer" data-track="source_click" data-label={`${item.id}:source`}>
                <span>Source</span>
                <span className="sr-only"> on GitHub (opens in a new tab)</span>
                <ArrowUpRight size={16} className="nudge" />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <button type="button" onClick={() => onOpen(item)} className="group relative block overflow-hidden rounded-2xl border border-line bg-card" data-reveal>
          <Picture
            name={item.image}
            alt={item.alt}
            sizes="(min-width: 1024px) 800px, 100vw"
            className="block"
            imgClassName="aspect-[16/10] h-auto w-full object-cover object-left-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-fg px-3 py-1.5 text-sm font-medium text-bg">
            <Expand size={14} />
            Full size<span className="sr-only">: {item.title} screenshot</span>
          </span>
        </button>

        <div className="mt-8">
          {item.steps.map((step) => (
            <div key={step.label} className="step grid grid-cols-1 gap-2 py-7 pl-7 sm:grid-cols-[minmax(0,160px)_minmax(0,1fr)] sm:gap-7" data-reveal>
              <p className="meta pt-1.5">{step.label}</p>
              <div className="flex flex-col gap-6">
                <p className="text-say">{step.text}</p>
                {step.flow.length > 0 && <Flow stops={step.flow} />}
                {step.features.length > 0 && <Features items={step.features} />}
                {step.facts.length > 0 && (
                  <ul>
                    {step.facts.map((f) => (
                      <li key={f} className="border-t border-line py-3.5 text-base leading-normal text-mute">
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function CaseStudies() {
  const [open, setOpen] = useState(null);

  const openCase = (item) => {
    trackEvent("project_open", item.id);
    setOpen(item);
  };

  return (
    <section id="work" aria-labelledby="work-title" className="pb-24 md:pb-32">
      <div className="container-page">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-6">
          <h2 id="work-title" className="condensed text-display font-extrabold" data-reveal>
            {site.work.title}
            <span className="text-faint">.</span>
          </h2>
          <p className="meta max-w-[300px] leading-[1.7]">{site.work.note}</p>
        </div>
        {cases.map((item) => (
          <Case key={item.id} item={item} onOpen={openCase} />
        ))}
      </div>
      <ImageDialog item={open} onClose={() => setOpen(null)} />
    </section>
  );
}
