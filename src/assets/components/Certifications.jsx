import { useState } from "react";
import Picture from "./Picture";
import ImageDialog from "./ImageDialog";
import { ArrowUpRight, Expand } from "./Icons";
import { certifications } from "../../data/certifications";

export default function Certifications() {
  const [open, setOpen] = useState(null);

  return (
    <section id="certifications" aria-labelledby="certifications-title" className="px-2 sm:px-4">
      <div className="rounded-[2rem] bg-sunken py-24 md:py-28">
      <div className="container-page grid grid-cols-1 gap-x-10 gap-y-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 id="certifications-title" className="section-title">
              Certifications
            </h2>
            <p className="section-intro">
              In the order I earned them. Open a certificate to read it, or check it at the issuer.
            </p>
          </div>
        </div>

        <div className="relative lg:col-span-8" data-reveal>
          {/* Timeline rail: draws downward when the list scrolls into view. */}
          <span className="rail absolute bottom-6 left-[7px] top-3 w-0.5 rounded-full bg-accent" aria-hidden="true" />

          <ol className="space-y-12">
            {certifications.map((c) => (
              <li key={c.id} className="relative pl-10">
                <span
                  className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-sunken bg-accent ring-2 ring-accent"
                  aria-hidden="true"
                />
                <p className="font-semibold">
                  <time>{c.date}</time>
                </p>

                <article
                  aria-labelledby={`cert-${c.id}`}
                  className="mt-4 grid gap-5 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-[13rem_1fr] sm:p-5"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(c)}
                    className="group relative block overflow-hidden rounded-xl border border-line bg-sunken"
                  >
                    <Picture
                      name={c.image}
                      alt={c.alt}
                      sizes="(min-width: 640px) 208px, 100vw"
                      maxWidth={800}
                      className="block"
                      imgClassName="aspect-[4/3] h-auto w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-night px-2.5 py-1 text-xs font-medium text-snow">
                      <Expand size={13} />
                      Enlarge<span className="sr-only"> certificate: {c.title}</span>
                    </span>
                  </button>

                  <div className="flex flex-col">
                    <h3 id={`cert-${c.id}`} className="text-xl font-bold leading-snug tracking-tight">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-muted">{c.issuer}</p>
                    {c.link && (
                      <p className="mt-auto pt-4">
                        <a href={c.link.href} className="link group inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                          {c.link.label}
                          <span className="sr-only">: {c.title} (opens in a new tab)</span>
                          <ArrowUpRight size={16} className="nudge" />
                        </a>
                      </p>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
      </div>

      <ImageDialog item={open} onClose={() => setOpen(null)} />
    </section>
  );
}
