import { Download } from "./Icons";
import site from "../../content/site.json";

const { person, story } = site;

// The roles he has introduced himself as, struck out one by one, then the current one.
export default function Story() {
  return (
    <section id="story" aria-labelledby="story-title" className="py-28 md:py-40">
      <div className="container-page">
        <p className="meta mb-9">the short version</p>
        <div className="grid grid-cols-1 items-end gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
          <h2 id="story-title" className="condensed-x text-mega font-black uppercase" data-reveal>
            <span className="sr-only">
              {story.struck.join(", then ")}, now {story.now}
            </span>
            <span aria-hidden="true">
              {story.struck.map((word, i) => (
                <span key={word}>
                  <span className={`strike ${i > 0 ? "strike-2" : ""}`}>{word}</span>
                  <br />
                </span>
              ))}
              <span className="lights-up">{story.now}</span>
            </span>
          </h2>

          <div className="flex flex-col gap-5 pb-2">
            <p className="text-lead font-semibold" data-reveal>
              {story.lede}
            </p>
            {story.paragraphs.map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-mute" data-reveal>
                {p}
              </p>
            ))}
            <div data-reveal>
              <a href={person.cv.href} download className="btn group mt-2" data-track="cv_download" data-label="story">
                <Download size={16} className="transition-transform duration-300 group-hover:translate-y-0.5" />
                <span>Download CV</span>
                <span className="meta">pdf, {person.cv.size.toLowerCase()}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
