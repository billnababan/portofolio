import Picture from "./Picture";
import { Download } from "./Icons";
import { person, social } from "../../data/site";

const github = social.find((s) => s.label === "GitHub");
const linkedin = social.find((s) => s.label === "LinkedIn");

// Above the fold: no entrance animation, nothing hidden before JS runs.
export default function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="pb-20 pt-28 md:pb-28 md:pt-36">
      <div className="container-page grid items-center gap-x-8 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1">
          <Picture
            name="profile"
            alt="Portrait of Bill Jeferson Nababan"
            sizes="(min-width: 1024px) 352px, 112px"
            priority
            className="block w-28 overflow-hidden rounded-lg border border-line bg-sunken lg:w-full lg:max-w-[22rem]"
            imgClassName="aspect-square h-auto w-full object-cover"
          />
        </div>

        <div className="lg:col-span-7 lg:row-start-1">
          <p className="eyebrow">{person.location}</p>
          <h1 id="hero-title" className="mt-4">
            <span className="block text-display font-bold">{person.name}</span>
            <span className="mt-3 block text-[clamp(1.25rem,1.05rem_+_1vw,1.75rem)] font-medium leading-snug tracking-tight text-muted">
              Backend-focused full-stack web developer
            </span>
          </h1>
          {/* TODO(owner): confirm this positioning line; it restates what the About section already claims. */}
          <p className="mt-6 max-w-prose text-lead">
            I build REST APIs with Node.js and Express, model data in MySQL and PostgreSQL, and write the React front end
            that uses them.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" className="btn-primary">
              View projects
            </a>
            <a href={person.cv.href} download="CV_BillJeferson.pdf" className="btn-secondary">
              <Download />
              Download CV <span className="font-normal text-muted">(PDF, {person.cv.size})</span>
            </a>
          </div>

          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
            <a href={github.href} className="link" rel="noopener noreferrer" target="_blank">
              GitHub<span className="sr-only"> profile (opens in a new tab)</span>
            </a>
            <a href={linkedin.href} className="link" rel="noopener noreferrer" target="_blank">
              LinkedIn<span className="sr-only"> profile (opens in a new tab)</span>
            </a>
            <a href={`mailto:${person.email}`} className="link">
              {person.email}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
