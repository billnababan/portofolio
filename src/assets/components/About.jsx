import { Download } from "./Icons";
import { person } from "../../data/site";

// Built only from facts already on the site. The strike-through is literal:
// the previous version of this site introduced him as a "Frontend Developer".
export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="px-2 sm:px-4">
      <div className="relative overflow-hidden rounded-[2rem] bg-accent text-ink">
        {/* Large ring in the background: the hero's ring, scaled up. */}
        <span
          className="pointer-events-none absolute -bottom-[22rem] -right-[20rem] h-[44rem] w-[44rem] rounded-full border-[7rem] border-cream/40 md:-bottom-64 md:-right-56"
          aria-hidden="true"
        />

        <div className="container-page relative grid grid-cols-1 gap-x-10 gap-y-12 py-24 md:py-32 lg:grid-cols-12" data-reveal>
          <h2 id="about-title" className="text-mega font-bold uppercase lg:col-span-7">
            <span className="sr-only">About: backend developer (formerly introduced as frontend)</span>
            <span aria-hidden="true">
              <span className="strike">Frontend</span>
              <br />
              Backend
              <br />
              developer.
            </span>
          </h2>

          <div className="max-w-prose space-y-5 text-lead lg:col-span-5 lg:pt-4">
            <p className="text-[clamp(1.25rem,1.1rem_+_0.6vw,1.625rem)] font-semibold leading-snug tracking-tight">
              Most of my work is on the server, from the database table to the API response.
            </p>
            <p>
              I&rsquo;m a web developer in {person.location}. I studied Informatics Engineering at Batam State Polytechnic
              (Politeknik Negeri Batam).
            </p>
            <p>
              I build REST APIs in Express on Node.js, design schemas and queries in MySQL and PostgreSQL, and use some
              MongoDB. I also build the React side, so I can take a feature all the way to the screen. On team projects I
              usually take the backend role.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a href={person.cv.href} download="CV_BillJeferson.pdf" className="btn-ink group">
                <Download size={18} className="transition-transform duration-200 group-hover:translate-y-0.5" />
                Download CV
                <span className="font-normal text-cream/70">(PDF, {person.cv.size})</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
