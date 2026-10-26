import { useState } from "react";
import Picture from "./Picture";
import ImageDialog from "./ImageDialog";
import { ArrowUpRight, Expand } from "./Icons";
import site from "../../content/site.json";
import certifications from "../../content/certifications.json";

// In date order: the year column is real information, not decoration.
export default function Certifications() {
  const [open, setOpen] = useState(null);

  return (
    <section id="certifications" aria-labelledby="certifications-title" className="pb-28 md:pb-36">
      <div className="container-page">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 id="certifications-title" className="condensed text-display font-extrabold" data-reveal>
            {site.certifications.title}
            <span className="text-faint">.</span>
          </h2>
          <p className="meta max-w-[300px] leading-[1.7]">{site.certifications.note}</p>
        </div>

        <ol className="border-b border-line">
          {certifications.map((c) => (
            <li key={c.id} className="group border-t border-line" data-reveal>
              <article aria-labelledby={`cert-${c.id}`} className="grid grid-cols-1 items-center gap-x-7 gap-y-5 py-8 md:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,280px)]">
                <p>
                  <time className="outline-num condensed num block text-[clamp(4rem,7vw,6.5rem)] font-extrabold leading-[0.85]">{c.year}</time>
                  <span className="meta mt-2.5 block">{c.date.toLowerCase()}</span>
                </p>

                <div className="flex flex-col gap-2.5">
                  <h3 id={`cert-${c.id}`} className="text-[clamp(1.375rem,2.3vw,2rem)] font-semibold leading-[1.1] tracking-[-0.015em]">
                    {c.title}
                  </h3>
                  <p className="text-[15px] text-mute">{c.issuer}</p>
                  {c.link.href && (
                    <a
                      href={c.link.href}
                      className="meta ul inline-flex items-center gap-1 self-start text-fg"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track="source_click"
                      data-label={`cert:${c.id}`}
                    >
                      {c.link.label}
                      <span className="sr-only">: {c.title} (opens in a new tab)</span>
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(c)}
                  className="relative block overflow-hidden rounded-xl border border-line bg-fg transition-transform duration-700 ease-out hover:-rotate-2 hover:scale-[1.03]"
                >
                  <Picture
                    name={c.image}
                    alt={c.alt}
                    sizes="(min-width: 768px) 280px, 100vw"
                    maxWidth={800}
                    className="block"
                    imgClassName="aspect-[16/10] h-auto w-full object-contain p-3"
                  />
                  <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full bg-bg px-3 py-1.5 text-sm font-medium text-fg">
                    <Expand size={14} />
                    Enlarge<span className="sr-only"> certificate: {c.title}</span>
                  </span>
                </button>
              </article>
            </li>
          ))}
        </ol>
      </div>

      <ImageDialog item={open} onClose={() => setOpen(null)} />
    </section>
  );
}
