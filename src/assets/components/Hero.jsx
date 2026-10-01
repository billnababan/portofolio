import Picture from "./Picture";
import { ArrowUpRight, Download } from "./Icons";
import { person, social } from "../../data/site";

const github = social.find((s) => s.label === "GitHub");
const linkedin = social.find((s) => s.label === "LinkedIn");

// Also used by scripts/prerender.mjs for the <link rel="preload"> of the photo.
export const heroImageSizes = "(min-width: 448px) 384px, calc(100vw - 4rem)";

// The profile, as a backend developer would hand it over: an API response.
// Every value is a fact already stated elsewhere on the page.
const response = [
  ["name", '"Bill Jeferson Nababan"'],
  ["based_in", '"Batam, Indonesia"'],
  ["focus", '"backend"'],
  ["stack", '["Node.js", "Express", "React"]'],
  ["databases", '["MySQL", "PostgreSQL"]'],
  ["certified", '["RHCSA", "BNSP JWP"]'],
];

// Literal class names so Tailwind generates them (no inline styles: CSP).
const lineDelays = [
  "[animation-delay:650ms]",
  "[animation-delay:760ms]",
  "[animation-delay:870ms]",
  "[animation-delay:980ms]",
  "[animation-delay:1090ms]",
  "[animation-delay:1200ms]",
  "[animation-delay:1310ms]",
  "[animation-delay:1420ms]",
];

export default function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="px-2 pt-[4.5rem] sm:px-4">
      <div className="relative overflow-hidden rounded-[2rem] bg-night text-snow">
        <div className="container-page grid grid-cols-1 gap-x-10 gap-y-20 pb-24 pt-14 md:pt-20 lg:grid-cols-12 lg:items-center lg:pb-28">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2.5 text-night-muted">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              Web developer in {person.location}
            </p>

            <h1 id="hero-title" className="mt-6">
              <span className="block text-display font-bold">
                Bill Jeferson
                <br />
                Nababan
              </span>
              <span className="mt-6 block text-[clamp(1.25rem,1.05rem_+_1vw,1.75rem)] font-medium leading-snug tracking-tight text-night-muted">
                Backend-focused full-stack web developer
              </span>
            </h1>

            {/* TODO(owner): confirm this positioning line; it restates what the About section already claims. */}
            <p className="mt-6 max-w-[36rem] text-lead text-snow/90">
              I build REST APIs with Node.js and Express, model data in MySQL and PostgreSQL, and write the React front end
              that uses them.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href="#projects" className="btn-primary group">
                View projects
                <ArrowUpRight size={18} className="nudge rotate-90" />
              </a>
              <a href={person.cv.href} download="CV_BillJeferson.pdf" className="btn-ghost-night group">
                <Download size={18} className="transition-transform duration-200 group-hover:translate-y-0.5" />
                Download CV <span className="font-normal text-night-muted">(PDF, {person.cv.size})</span>
              </a>
            </div>

            <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              <a href={github.href} className="link-night" rel="noopener noreferrer" target="_blank">
                GitHub<span className="sr-only"> profile (opens in a new tab)</span>
              </a>
              <a href={linkedin.href} className="link-night" rel="noopener noreferrer" target="_blank">
                LinkedIn<span className="sr-only"> profile (opens in a new tab)</span>
              </a>
              <a href={`mailto:${person.email}`} className="link-night">
                {person.email}
              </a>
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[24rem] lg:mr-0">
              <div className="relative">
                {/* Yellow slab behind the portrait: the page's one graphic motif (repeats on project hover). */}
                <div
                  className="hero-block absolute inset-0 -translate-x-3 translate-y-5 rotate-[-6deg] rounded-[1.75rem] bg-accent sm:-translate-x-6 sm:translate-y-6"
                  aria-hidden="true"
                />
                <Picture
                  name="profile"
                  alt="Portrait of Bill Jeferson Nababan"
                  sizes={heroImageSizes}
                  priority
                  className="relative block overflow-hidden rounded-[1.75rem] bg-night-2"
                  imgClassName="aspect-[4/5] h-auto w-full object-cover object-[50%_35%]"
                />
              </div>

              <figure className="hero-card relative mx-auto -mt-24 w-[92%] sm:absolute sm:-bottom-14 sm:-left-10 sm:mx-0 sm:mt-0 sm:w-[min(21rem,92%)] rounded-2xl border border-night-line bg-night-2 p-4 font-mono text-[12.5px] leading-relaxed shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]">
                <figcaption className="sr-only">Profile summary written as an API response</figcaption>
                <div className="flex items-center justify-between gap-3 border-b border-night-line pb-3">
                  <span className="truncate">
                    <span className="font-semibold text-accent">GET</span> /api/bill-jeferson
                  </span>
                  <span className="shrink-0 rounded-full bg-ok/15 px-2 py-0.5 text-ok">200 OK</span>
                </div>
                <pre className="mt-3 overflow-hidden whitespace-pre-wrap text-night-muted">
                  <span className={`json-line block ${lineDelays[0]}`}>{"{"}</span>
                  {response.map(([key, value], i) => (
                    <span key={key} className={`json-line block pl-4 ${lineDelays[i + 1]}`}>
                      <span className="text-snow">&quot;{key}&quot;</span>: <span className="text-accent">{value}</span>
                      {i < response.length - 1 ? "," : ""}
                    </span>
                  ))}
                  <span className={`json-line block ${lineDelays[response.length + 1]}`}>
                    {"}"}
                    <span className="caret ml-1 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-accent" aria-hidden="true" />
                  </span>
                </pre>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
