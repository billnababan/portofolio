import { useState } from "react";
import Picture from "./Picture";
import ImageDialog from "./ImageDialog";
import { ArrowUpRight, Expand } from "./Icons";
import { certifications } from "../../data/certifications";

// In date order: the year column is real information, not decoration.
export default function Certifications() {
  const [open, setOpen] = useState(null);

  return (
    <section id="certifications" aria-labelledby="certifications-title" className="py-28 md:py-40">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
          <h2 id="certifications-title" className="text-display font-semibold">
            Certifications
          </h2>
          <p className="meta max-w-[34ch]">In the order I earned them. Open one to read it, or check it at the issuer.</p>
        </div>

        <ol>
          {certifications.map((c) => (
            <li key={c.id} className="border-b border-line" data-reveal>
              <article aria-labelledby={`cert-${c.id}`} className="grid grid-cols-1 items-center gap-x-8 gap-y-5 py-8 md:grid-cols-12 md:py-10">
                <p className="text-accent md:col-span-2">
                  <time className="num block text-[clamp(2rem,1.5rem_+_1.5vw,3rem)] font-semibold leading-none tracking-tight">{c.year}</time>
                  <span className="meta mt-2 block">{c.date.toLowerCase()}</span>
                </p>

                <div className="md:col-span-6">
                  <h3 id={`cert-${c.id}`} className="text-[clamp(1.375rem,1.15rem_+_0.9vw,2rem)] font-semibold leading-tight tracking-tight">
                    {c.title}
                  </h3>
                  <p className="meta mt-2">{c.issuer}</p>
                  {c.link && (
                    <a href={c.link.href} className="link group mt-4 inline-flex items-center gap-1 font-medium" target="_blank" rel="noopener noreferrer">
                      {c.link.label}
                      <span className="sr-only">: {c.title} (opens in a new tab)</span>
                      <ArrowUpRight size={16} className="nudge" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(c)}
                  className="group relative block overflow-hidden rounded-2xl bg-cream md:col-span-4"
                >
                  <Picture
                    name={c.image}
                    alt={c.alt}
                    sizes="(min-width: 768px) 360px, 100vw"
                    maxWidth={800}
                    className="block"
                    imgClassName="aspect-[16/10] h-auto w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-cream">
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
