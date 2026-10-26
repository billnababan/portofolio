import site from "../../content/site.json";

// Decorative band of the stack. The list is rendered twice so the loop is seamless;
// the second copy is hidden from assistive tech.
export default function Marquee() {
  const words = site.marquee;
  const copy = (hidden) =>
    words.map((w, i) => (
      <li key={`${hidden}-${i}`} aria-hidden={hidden || undefined} className="condensed inline-flex items-center gap-8 whitespace-nowrap pr-8 text-[30px] font-bold tracking-[-0.01em]">
        {w}
        <span aria-hidden="true" className="font-light text-faint">
          /
        </span>
      </li>
    ));

  return (
    <div className="overflow-hidden border-y border-line py-5 text-mute">
      <ul className="marquee-track" aria-label="Stack">
        {copy(false)}
        {copy(true)}
      </ul>
    </div>
  );
}
