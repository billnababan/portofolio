import { techGroups } from "../../data/techStack";

export default function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="px-2 sm:px-4">
      <div className="rounded-[2rem] bg-night py-24 text-snow md:py-28">
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2 id="skills-title" className="section-title lg:col-span-5">
              Skills
            </h2>
            <p className="max-w-prose text-lead text-night-muted lg:col-span-7">
              Languages, frameworks and tools I use in the projects above, grouped by where they sit in an application.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-night-line sm:grid-cols-2 lg:grid-cols-5">
            {techGroups.map((group) => (
              <div key={group.label} className="bg-night p-6 lg:p-7" data-reveal>
                <h3 className="font-semibold text-accent">{group.label}</h3>
                <ul className="mt-5 space-y-3.5">
                  {group.items.map((item) => (
                    <li key={item.name} className="group flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-night-2 transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110">
                        {item.logo ?? <span className="h-1.5 w-4 rounded-full bg-night-muted/60" aria-hidden="true" />}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
