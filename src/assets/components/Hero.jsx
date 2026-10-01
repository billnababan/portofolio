import { useEffect, useRef } from "react";
import Picture from "./Picture";
import { GitHubMark, InstagramMark, LinkedInMark } from "./Icons";
import { createGravity } from "../../gravity";
import { person, social } from "../../data/site";

// Also used by scripts/prerender.mjs for the <link rel="preload"> of the portrait.
export const heroImageSizes = "(min-width: 640px) min(82vh, 760px), 100vw";

const marks = { GitHub: GitHubMark, LinkedIn: LinkedInMark, Instagram: InstagramMark };

// Home positions and looks of the gravity bodies. Literal class names (no inline
// styles: CSP) so Tailwind generates them. The ring has a hole you can see through.
const bodies = [
  { place: "left-[66%] top-[40%] lg:left-[57%] lg:top-[60%] [animation-delay:150ms]", look: "h-24 w-24 sm:h-36 sm:w-36 bg-accent" },
  { place: "left-[84%] top-[31%] lg:left-[66%] lg:top-[50%] [animation-delay:350ms]", look: "h-7 w-7 sm:h-10 sm:w-10 bg-cream" },
  { place: "left-[82%] top-[52%] lg:left-[52%] lg:top-[76%] [animation-delay:250ms]", look: "h-16 w-16 sm:h-28 sm:w-28 border-[1rem] sm:border-[1.75rem] border-cream" },
  { place: "left-[52%] top-[48%] lg:left-[67%] lg:top-[69%] [animation-delay:450ms]", look: "h-4 w-4 sm:h-5 sm:w-5 bg-accent" },
  { place: "left-[46%] top-[36%] lg:left-[45%] lg:top-[64%] [animation-delay:550ms]", look: "h-3 w-3 sm:h-4 sm:w-4 bg-cream" },
];

export default function Hero() {
  const fieldRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const field = fieldRef.current;
    const els = [...field.querySelectorAll("[data-body]")];
    // Start once the CSS drop-in has finished, so measurements are of the resting layout.
    let stop = () => {};
    const timer = setTimeout(() => {
      stop = createGravity(field, els);
    }, 1200);
    return () => {
      clearTimeout(timer);
      stop();
    };
  }, []);

  return (
    <section id="top" aria-labelledby="hero-title" className="relative h-[100svh] min-h-[640px] overflow-hidden bg-coal">
      {/* Portrait: grayscale, faded into the page at the edges. */}
      <div className="absolute inset-x-0 bottom-0 top-14 flex justify-center">
        <Picture
          name="profile"
          alt="Portrait of Bill Jeferson Nababan"
          sizes={heroImageSizes}
          priority
          className="block aspect-square h-full max-h-[760px] max-w-none self-end"
          imgClassName="h-full w-full object-cover grayscale brightness-[0.5] contrast-[1.2] [mask-image:radial-gradient(closest-side,#000_38%,transparent_96%)]"
        />
      </div>

      {/* Gravity field: covers the hero so the pointer can reach the bodies from anywhere. */}
      <div ref={fieldRef} className="absolute inset-0 touch-pan-y" aria-hidden="true">
        {bodies.map((b, i) => (
          // outer: anchor + drop-in animation, middle: centring, inner: moved by gravity.js
          <div key={i} data-body className={`body-in absolute ${b.place}`}>
            <div className="-translate-x-1/2 -translate-y-1/2">
              <div data-move className={`rounded-full ${b.look}`} />
            </div>
          </div>
        ))}
      </div>

      <p className="rise-in pointer-events-none absolute right-5 top-[17%] text-right text-lg font-medium leading-snug text-accent [animation-delay:700ms] lg:right-[7%] lg:top-[44%] lg:text-xl">
        apis, databases
        <br />
        and the apps on top
      </p>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div className="container-page pb-5">
          <h1 id="hero-title" className="pointer-events-auto">
            <span className="block max-w-[11ch] text-display font-semibold">{person.name}</span>
            <span className="meta mt-4 block text-base">
              backend-focused full-stack web developer in {person.location.toLowerCase()}
            </span>
          </h1>

          <div className="pointer-events-auto mt-8 flex items-center justify-between gap-4 border-t border-line pt-4">
            <a href="#projects" className="meta transition-colors hover:text-text">
              © <span className="num">{__BUILD_YEAR__}</span> bill jeferson, scroll for the work
            </a>
            <ul className="flex items-center">
              {social.map((s) => {
                const Mark = marks[s.label];
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-raised hover:text-accent"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.label} (opens in a new tab)`}
                    >
                      <Mark />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
