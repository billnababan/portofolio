import { techGroups } from "../../data/techStack";

export default function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="section bg-sunken">
      <div className="container-page grid gap-x-8 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="skills-title" className="section-title">
            Skills
          </h2>
          <p className="section-intro">Languages, frameworks and tools I use in the projects above.</p>
        </div>

        <dl className="divide-y divide-line border-y border-line lg:col-span-8" data-reveal>
          {techGroups.map((group) => (
            <div key={group.label} className="grid gap-3 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt className="pt-1.5 font-semibold">{group.label}</dt>
              <dd>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item.name} className="chip group">
                      {item.logo && (
                        <span className="grayscale transition group-hover:grayscale-0">{item.logo}</span>
                      )}
                      {item.name}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
