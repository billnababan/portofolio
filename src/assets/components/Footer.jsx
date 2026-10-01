import { person, social } from "../../data/site";

export default function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <div className="container-page flex flex-col gap-4 text-[0.9375rem] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © <span className="num">{__BUILD_YEAR__}</span> {person.name}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {social.map((s) => (
            <li key={s.label}>
              <a href={s.href} className="hover:text-ink" target="_blank" rel="noopener noreferrer">
                {s.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
          <li>
            <a href={person.cv.href} className="hover:text-ink" download="CV_BillJeferson.pdf">
              CV (PDF)
            </a>
          </li>
          <li>
            <a href="#top" className="hover:text-ink">
              Back to top
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
