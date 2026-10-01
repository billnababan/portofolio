import { person, social } from "../../data/site";

export default function Footer() {
  return (
    <footer className="py-8">
      <div className="container-page flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="meta">
          © <span className="num">{__BUILD_YEAR__}</span> bill jeferson, built in {person.location.split(",")[0].toLowerCase()}
        </p>
        <ul className="meta flex flex-wrap gap-x-6 gap-y-2">
          {social.map((s) => (
            <li key={s.label}>
              <a href={s.href} className="transition-colors hover:text-accent" target="_blank" rel="noopener noreferrer">
                {s.label.toLowerCase()}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
          <li>
            <a href={person.cv.href} className="transition-colors hover:text-accent" download="CV_BillJeferson.pdf">
              cv (pdf)
            </a>
          </li>
          <li>
            <a href="#top" className="transition-colors hover:text-accent">
              back to top
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
