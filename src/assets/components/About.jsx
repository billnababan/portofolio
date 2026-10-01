import { person } from "../../data/site";

// Built only from facts already on the site (education, stack, team roles, certifications).
export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="section">
      <div className="container-page grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="about-title" className="section-title">
            About
          </h2>
          <p className="mt-8 text-[clamp(1.5rem,1.2rem_+_1.2vw,2.125rem)] font-semibold leading-[1.15] tracking-tight">
            Most of my work is on the server, from the database table to the API response.
          </p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7" data-reveal>
          <div className="max-w-prose space-y-5 text-lead text-muted">
            <p>
              I&rsquo;m a web developer in {person.location}. I studied Informatics Engineering at Batam State Polytechnic
              (Politeknik Negeri Batam).
            </p>
            <p>
              I build REST APIs in Express on Node.js, design schemas and queries in MySQL and PostgreSQL, and use some
              MongoDB. I also build the React side, so I can take a feature all the way to the screen.
            </p>
            <p>
              On team projects I usually take the backend role, as on the project-collaboration system and the
              minutes-archiving site for the faculty listed above.
            </p>
          </div>

          <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            <div className="bg-surface p-5">
              <dt className="label">Education</dt>
              <dd className="mt-2 font-medium">Informatics Engineering, Batam State Polytechnic</dd>
            </div>
            <div className="bg-surface p-5">
              <dt className="label">Focus</dt>
              <dd className="mt-2 font-medium">Backend with Node.js, Express and SQL databases</dd>
            </div>
            <div className="bg-surface p-5">
              <dt className="label">Based in</dt>
              <dd className="mt-2 font-medium">{person.location}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
