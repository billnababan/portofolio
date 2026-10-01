import { person } from "../../data/site";

// Built only from facts already on the site (education, stack, team roles, certifications).
export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="section">
      <div className="container-page grid gap-x-8 gap-y-10 lg:grid-cols-12">
        <h2 id="about-title" className="section-title lg:col-span-4">
          About
        </h2>

        <div className="lg:col-span-8" data-reveal>
          <div className="max-w-prose space-y-5 text-lead">
            <p>
              I&rsquo;m a web developer in {person.location}. I studied Informatics Engineering at Batam State Polytechnic
              (Politeknik Negeri Batam).
            </p>
            <p>
              Most of my work is on the server: REST APIs in Express on Node.js, schemas and queries in MySQL and
              PostgreSQL, and some MongoDB. I also build the React side, so I can take a feature from the database table
              to the screen.
            </p>
            <p>
              On team projects I usually take the backend role, as on the project-collaboration system and the
              minutes-archiving site for the faculty listed above. I hold Red Hat&rsquo;s RHCSA certification and
              BNSP&rsquo;s Junior Web Programmer certification, and in 2024 I was a Web Technical Mentor in Infinite
              Learning&rsquo;s Independent Study Program on web development.
            </p>
          </div>

          <dl className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
            <div>
              <dt className="eyebrow">Education</dt>
              <dd className="mt-2">Informatics Engineering, Batam State Polytechnic</dd>
            </div>
            <div>
              <dt className="eyebrow">Focus</dt>
              <dd className="mt-2">Backend: Node.js, Express, SQL databases</dd>
            </div>
            <div>
              <dt className="eyebrow">Based in</dt>
              <dd className="mt-2">{person.location}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
