import Picture from "./Picture";
import { GitHubMark, InstagramMark, LinkedInMark, ArrowDown } from "./Icons";
import site from "../../content/site.json";

const { person, social, hero } = site;

// Also used by scripts/prerender.mjs for the <link rel="preload"> of the portrait.
export const heroImageSizes = "(min-width: 640px) 640px, 80vw";

const marks = { GitHub: GitHubMark, LinkedIn: LinkedInMark, Instagram: InstagramMark };

// One <span> per letter so CSS can raise them one after another (.letters > .ltr:nth-child).
function Letters({ text }) {
  return (
    <span className="mask letters" aria-hidden="true">
      {[...text].map((ch, i) => (
        <span key={i} className="ltr">
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

const nameClass =
  "condensed whitespace-nowrap px-[1.5vw] text-center text-[18.5vw] font-extrabold leading-[0.86] tracking-[-0.035em] [transform:translateY(-1.15em)] sm:text-name sm:[transform:translateY(-0.62em)]";

export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="hero-scope relative flex h-[calc(100svh-57px)] min-h-[600px] max-h-[1000px] flex-col justify-end overflow-hidden"
    >
      <div aria-hidden="true" className="hero-light pointer-events-none absolute -bottom-[10%] left-1/2 h-[95%] w-[min(1100px,90vw)] -translate-x-1/2" />

      {/* Portrait, between the solid name (behind) and the outlined name (in front). */}
      <div className="absolute bottom-0 left-1/2 z-[2] h-[72%] -translate-x-1/2 sm:h-[90%]">
        <div className="par-photo h-full">
          <Picture
            name={hero.image}
            alt={hero.imageAlt}
            sizes={heroImageSizes}
            priority
            className="photo-in block h-full"
            imgClassName="block h-full w-auto max-w-none grayscale contrast-[1.08]"
          />
        </div>
      </div>

      <div className="absolute inset-x-0 top-6 z-[4] sm:top-8">
        <div className="container-page flex items-start justify-between gap-6">
          <p className="meta rise-in leading-[1.7] [animation-delay:900ms]">
            based in {person.location.toLowerCase()}
            <br />
            {person.availability}
          </p>
          <p className="meta rise-in hidden text-right leading-[1.7] [animation-delay:1000ms] sm:block">
            {hero.taglineTop}
            <br />
            <span className="text-fg">{hero.taglineBottom}</span>
          </p>
        </div>
      </div>

      <ul className="rise-in absolute left-5 top-1/2 z-[4] hidden -translate-y-1/2 flex-col gap-2.5 [animation-delay:1200ms] sm:left-6 md:flex">
        {social.map((s) => {
          const Mark = marks[s.label];
          return (
            <li key={s.label}>
              <a
                href={s.href}
                className="round-icon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.label} (opens in a new tab)`}
                data-track="social_click"
                data-label={s.label}
              >
                {Mark ? <Mark /> : s.label.slice(0, 2)}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="par-name relative z-[1]">
        <h1 id="hero-title" className={nameClass}>
          <span className="sr-only">
            {person.shortName}, {person.role.toLowerCase()} in {person.location}
          </span>
          <Letters text={person.shortName} />
        </h1>
      </div>
      {/* Outline copy in front of the portrait: the name seems to pass through him. */}
      <div aria-hidden="true" className="par-name pointer-events-none absolute inset-x-0 bottom-0 z-[3]">
        <div className={`${nameClass} text-transparent opacity-55 [-webkit-text-stroke:1px_rgb(var(--fg))]`}>
          <Letters text={person.shortName} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-[4] sm:bottom-9">
        <div className="container-page flex items-end justify-between gap-6">
          <a
            href="#story"
            className="meta rise-in group hidden min-h-[44px] items-center gap-2.5 transition-colors [animation-delay:1300ms] hover:text-fg sm:inline-flex"
          >
            <ArrowDown size={14} className="transition-transform duration-300 group-hover:translate-y-0.5" />
            scroll for the story
          </a>
          <p className="w-full text-center text-[clamp(1.375rem,3.2vw,2.875rem)] font-medium leading-[1.02] tracking-[-0.02em] sm:w-auto sm:text-right">
            <span className="mask">
              <span className="ltr [animation-delay:800ms]">{person.role}</span>
            </span>
            <span className="mask">
              <span className="ltr text-mute [animation-delay:900ms]">{person.location}</span>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
