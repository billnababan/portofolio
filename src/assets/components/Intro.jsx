// The one-paragraph answer to "what does he do", set large and light.
export default function Intro() {
  return (
    <section aria-label="Introduction" className="py-28 md:py-40">
      <div className="container-page">
        <p className="mx-auto max-w-[30ch] text-center text-statement font-light" data-reveal>
          I build web applications from the database up: REST APIs in Node.js and Express, data in MySQL and PostgreSQL,
          and the React front end that people actually click.
        </p>
      </div>
    </section>
  );
}
