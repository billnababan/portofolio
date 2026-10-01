import { person, social } from "../../data/site";

export default function Footer() {
  return (
    <footer className="py-10">
      <div className="container-page flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-3 text-muted">
          <img src="/images/K.svg" alt="" width="14" height="18" />
          <span>
            © <span className="num">{__BUILD_YEAR__}</span> {person.name}
          </span>
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-muted">
          {social.map((s) => (
            <li key={s.label}>
              <a href={s.href} className="transition-colors hover:text-ink" target="_blank" rel="noopener noreferrer">
                {s.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
          <li>
            <a href={person.cv.href} className="transition-colors hover:text-ink" download="CV_BillJeferson.pdf">
              CV (PDF)
            </a>
          </li>
          <li>
            <a href="#top" className="transition-colors hover:text-ink">
              Back to top
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
