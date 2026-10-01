import { useState } from "react";
import Picture from "./Picture";
import ImageDialog from "./ImageDialog";
import { ArrowUpRight, Expand } from "./Icons";
import { certifications } from "../../data/certifications";

export default function Certifications() {
  const [open, setOpen] = useState(null);

  return (
    <section id="certifications" aria-labelledby="certifications-title" className="section bg-sunken">
      <div className="container-page">
        <h2 id="certifications-title" className="section-title">
          Certifications
        </h2>

        <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((c) => (
            <li key={c.id} data-reveal>
              <article aria-labelledby={`cert-${c.id}`} className="flex h-full flex-col">
                <button
                  type="button"
                  onClick={() => setOpen(c)}
                  className="relative block overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-ink"
                >
                  <Picture
                    name={c.image}
                    alt={c.alt}
                    sizes="(min-width: 1024px) 352px, (min-width: 640px) 46vw, 100vw"
                    maxWidth={800}
                    className="block"
                    imgClassName="aspect-[4/3] h-auto w-full object-contain p-3"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm font-medium">
                    <Expand size={16} />
                    Enlarge<span className="sr-only"> certificate: {c.title}</span>
                  </span>
                </button>

                <h3 id={`cert-${c.id}`} className="mt-5 text-lg font-semibold leading-snug tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-1 text-muted">
                  {c.issuer} · <span className="num">{c.year}</span>
                </p>
                {c.link && (
                  <p className="mt-auto pt-4">
                    <a href={c.link.href} className="link inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                      {c.link.label}
                      <span className="sr-only">: {c.title} (opens in a new tab)</span>
                      <ArrowUpRight size={16} />
                    </a>
                  </p>
                )}
              </article>
            </li>
          ))}
        </ul>
      </div>

      <ImageDialog item={open} onClose={() => setOpen(null)} />
    </section>
  );
}
