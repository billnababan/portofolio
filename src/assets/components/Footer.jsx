import site from "../../content/site.json";

const { person, social } = site;

export default function Footer() {
  return (
    <footer className="overflow-hidden px-0 pb-7 pt-14">
      <div className="container-page">
        <p aria-hidden="true" className="foot-name condensed-x cursor-default whitespace-nowrap text-[clamp(4.5rem,17.5vw,16.875rem)] font-black lowercase leading-[0.82] tracking-[-0.02em]">
          {person.shortName}.
        </p>
        <div className="meta mt-8 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <span className="num">{__BUILD_YEAR__}</span> {person.shortName.toLowerCase()}, built in {person.location.split(",")[0].toLowerCase()}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {social.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="ul text-fg" target="_blank" rel="noopener noreferrer" data-track="social_click" data-label={s.label}>
                  {s.label.toLowerCase()}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
            <li>
              <a href={person.cv.href} className="ul text-fg" download data-track="cv_download" data-label="footer">
                cv (pdf)
              </a>
            </li>
            <li>
              <a href="#top" className="ul text-fg">
                back to top ↑
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
