import { useState } from "react";
import Picture from "./Picture";
import ImageDialog from "./ImageDialog";
import { ArrowUpRight, Expand } from "./Icons";
import { projects } from "../../data/projects";

export default function Projects() {
  const [open, setOpen] = useState(null);

  return (
    <section id="projects" aria-labelledby="projects-title" className="section">
      <div className="container-page">
        <h2 id="projects-title" className="section-title">
          Projects
        </h2>
        <p className="section-intro">
          Web applications I have built, with the stack each one uses and my role where it was a team project.
        </p>

        <ul className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id} data-reveal>
              <article aria-labelledby={`project-${p.id}`} className="flex h-full flex-col">
                <button
                  type="button"
                  onClick={() => setOpen(p)}
                  className="group relative block overflow-hidden rounded-lg border border-line bg-sunken text-left transition-colors hover:border-ink"
                >
                  <Picture
                    name={p.image}
                    alt={p.alt}
                    sizes="(min-width: 1152px) 540px, (min-width: 768px) 46vw, 100vw"
                    maxWidth={800}
                    className="block"
                    imgClassName="aspect-[16/10] h-auto w-full object-cover object-left-top"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm font-medium">
                    <Expand size={16} />
                    Enlarge<span className="sr-only"> screenshot of {p.title}</span>
                  </span>
                </button>

                <h3 id={`project-${p.id}`} className="mt-5 text-xl font-semibold tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-2 max-w-prose text-muted">{p.summary}</p>
                {p.role && (
                  <p className="mt-3 max-w-prose">
                    <span className="font-semibold">Role:</span> {p.role}
                  </p>
                )}

                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted" aria-label="Stack">
                  {p.stack.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>

                {(p.sourceUrl || p.liveUrl) && (
                  <p className="mt-auto flex flex-wrap gap-x-6 pt-5">
                    {p.liveUrl && (
                      <a href={p.liveUrl} className="link inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                        Live site<span className="sr-only">: {p.title} (opens in a new tab)</span>
                        <ArrowUpRight size={16} />
                      </a>
                    )}
                    {p.sourceUrl && (
                      <a href={p.sourceUrl} className="link inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                        Source on GitHub<span className="sr-only">: {p.title} (opens in a new tab)</span>
                        <ArrowUpRight size={16} />
                      </a>
                    )}
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
