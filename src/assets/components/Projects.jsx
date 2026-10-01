import { useState } from "react";
import Picture from "./Picture";
import ImageDialog from "./ImageDialog";
import { ArrowUpRight, Expand } from "./Icons";
import { projects } from "../../data/projects";

function Screenshot({ project, onOpen, sizes }) {
  const host = project.sourceUrl ? project.sourceUrl.replace(/^https:\/\//, "") : "private repository";

  return (
    // Hover/focus: the frame lifts off the same yellow slab used behind the hero photo,
    // and the screenshot pans to show more of the app.
    <div className="rounded-2xl bg-accent">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface transition-transform duration-300 ease-out hover:-translate-x-2 hover:-translate-y-2 focus-within:-translate-x-2 focus-within:-translate-y-2">
        <div className="flex items-center gap-3 border-b border-line px-4 py-2.5" aria-hidden="true">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong/50" />
          </span>
          <span className="min-w-0 truncate rounded-full bg-sunken px-3 py-1 font-mono text-xs text-muted">{host}</span>
        </div>
        <button type="button" onClick={() => onOpen(project)} className="shot group relative block w-full text-left">
          <Picture
            name={project.image}
            alt={project.alt}
            sizes={sizes}
            maxWidth={800}
            className="block bg-sunken"
            imgClassName="aspect-[16/10] h-auto w-full object-cover"
          />
          <span className="absolute bottom-3 right-3 inline-flex translate-y-1 items-center gap-1.5 rounded-full bg-night px-3 py-1.5 text-sm font-medium text-snow opacity-90 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <Expand size={15} />
            Enlarge<span className="sr-only"> screenshot of {project.title}</span>
          </span>
        </button>
      </div>
    </div>
  );
}

function Details({ project, featured }) {
  return (
    <>
      {project.role && (
        <p className="mb-4 flex items-start gap-2.5 text-[0.9375rem]">
          <span className="shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-sm font-semibold text-on-accent">Role</span>
          <span className="pt-0.5">{project.role}</span>
        </p>
      )}
      <h3
        id={`project-${project.id}`}
        className={`font-bold tracking-tight ${featured ? "text-[clamp(1.75rem,1.4rem_+_1.4vw,2.5rem)] leading-[1.05]" : "text-2xl leading-tight"}`}
      >
        {project.title}
      </h3>
      <p className={`mt-3 max-w-prose text-muted ${featured ? "text-lead" : ""}`}>{project.summary}</p>

      <ul className="mt-5 flex flex-wrap gap-2" aria-label="Stack">
        {project.stack.map((t) => (
          <li key={t} className="rounded-full border border-line px-3 py-1 text-sm">
            {t}
          </li>
        ))}
      </ul>

      {(project.sourceUrl || project.liveUrl) && (
        <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {project.liveUrl && (
            <a href={project.liveUrl} className="link group inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
              Live site<span className="sr-only">: {project.title} (opens in a new tab)</span>
              <ArrowUpRight size={16} className="nudge" />
            </a>
          )}
          {project.sourceUrl && (
            <a href={project.sourceUrl} className="link group inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
              Source on GitHub<span className="sr-only">: {project.title} (opens in a new tab)</span>
              <ArrowUpRight size={16} className="nudge" />
            </a>
          )}
        </p>
      )}
    </>
  );
}

export default function Projects() {
  const [open, setOpen] = useState(null);
  const [featured, ...rest] = projects;

  return (
    <section id="projects" aria-labelledby="projects-title" className="section">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="projects-title" className="section-title lg:col-span-5">
            Projects
          </h2>
          <p className="max-w-prose text-lead text-muted lg:col-span-7">
            Web applications I have built, with the stack each one uses and my role where it was a team project. Hover a
            screenshot to scroll through it, or open it full size.
          </p>
        </div>

        <article aria-labelledby={`project-${featured.id}`} className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center" data-reveal>
          <div className="lg:col-span-7">
            <Screenshot project={featured} onOpen={setOpen} sizes="(min-width: 1152px) 640px, (min-width: 1024px) 56vw, 100vw" />
          </div>
          <div className="lg:col-span-5">
            <Details project={featured} featured />
          </div>
        </article>

        <ul className="mt-24 grid grid-cols-1 gap-x-10 gap-y-20 md:grid-cols-2">
          {rest.map((p, i) => {
            // With an odd count the last project would sit alone in its row:
            // give it the wide layout instead, mirrored from the featured one.
            const wide = rest.length % 2 === 1 && i === rest.length - 1;
            return wide ? (
              <li key={p.id} className="md:col-span-2" data-reveal>
                <article aria-labelledby={`project-${p.id}`} className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
                  <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1">
                    <Screenshot project={p} onOpen={setOpen} sizes="(min-width: 1152px) 640px, (min-width: 1024px) 56vw, 100vw" />
                  </div>
                  <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1">
                    <Details project={p} featured />
                  </div>
                </article>
              </li>
            ) : (
              <li key={p.id} data-reveal>
                <article aria-labelledby={`project-${p.id}`}>
                  <Screenshot project={p} onOpen={setOpen} sizes="(min-width: 1152px) 528px, (min-width: 768px) 46vw, 100vw" />
                  <div className="mt-8">
                    <Details project={p} />
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>

      <ImageDialog item={open} onClose={() => setOpen(null)} />
    </section>
  );
}
