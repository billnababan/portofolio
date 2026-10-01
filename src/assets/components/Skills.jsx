import { useEffect, useRef } from "react";
import { techGroups } from "../../data/techStack";

// Orbit diagram: one ring per layer of an application, with the data layer at the
// centre. Rings turn as the section scrolls past (scroll-linked, so it stops when
// you stop). The list beside it carries the same content for screen readers and
// small screens; the diagram itself is decorative.
const order = ["Data", "Backend", "Frontend", "Languages", "Tooling"];
const radii = [92, 150, 208, 266, 318];
const rings = order.map((label, i) => {
  const group = techGroups.find((g) => g.label === label);
  const step = 360 / group.items.length;
  return {
    label,
    r: radii[i],
    dir: i % 2 ? -1 : 1,
    offset: i * 23,
    nodes: group.items.map((item, k) => ({ ...item, angle: k * step })),
  };
});

const nodeTransform = (angle, r, spin) => `rotate(${angle}) translate(${r} 0) rotate(${-angle - spin})`;

export default function Skills() {
  const sectionRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    const ringEls = [...svgRef.current.querySelectorAll("[data-ring]")];
    let frame = 0;
    let inView = false;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height); // 0 → 1 while visible
      ringEls.forEach((el, i) => {
        const ring = rings[i];
        const spin = ring.offset + ring.dir * progress * 120;
        el.setAttribute("transform", `rotate(${spin.toFixed(2)})`);
        el.querySelectorAll("[data-node]").forEach((node, k) => {
          node.setAttribute("transform", nodeTransform(ring.nodes[k].angle, ring.r, spin));
        });
      });
    };
    const onScroll = () => {
      if (inView && !frame) frame = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      onScroll();
    });
    io.observe(section);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section id="skills" ref={sectionRef} aria-labelledby="skills-title" className="px-2 pt-2 sm:px-4 sm:pt-4">
      <div className="overflow-hidden rounded-[2rem] bg-cream text-ink">
        <div className="container-page grid grid-cols-1 items-center gap-x-10 gap-y-14 py-24 md:py-32 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="skills-title" className="text-display font-semibold">
              Skills
            </h2>
            <p className="mt-5 max-w-[40ch] text-lead text-ink-muted">
              Arranged like the apps I build: data at the centre, the backend around it, the interface on the outside.
            </p>

            <dl className="mt-10 rounded-3xl bg-ink p-6 text-cream sm:p-8" data-reveal>
              {order.map((label) => {
                const group = techGroups.find((g) => g.label === label);
                return (
                  <div key={label} className="grid grid-cols-[6.5rem_1fr] gap-3 border-b border-white/10 py-3 first:pt-0 last:border-0 last:pb-0">
                    <dt className="font-semibold text-accent">{label.toLowerCase()}</dt>
                    <dd>{group.items.map((i) => i.name).join(", ")}</dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="lg:col-span-7">
            <svg
              ref={svgRef}
              viewBox="-350 -350 700 700"
              className="mx-auto h-auto w-full max-w-[40rem] overflow-visible"
              aria-hidden="true"
              focusable="false"
            >
              {rings.map((ring) => (
                <circle key={ring.label} r={ring.r} fill="none" stroke="#22282C" strokeOpacity="0.22" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
              ))}

              {rings.map((ring) => (
                <g key={ring.label} data-ring transform={`rotate(${ring.offset})`}>
                  {ring.nodes.map((node) => (
                    <g key={node.name} data-node transform={nodeTransform(node.angle, ring.r, ring.offset)}>
                      <circle r="21" fill="#FBFBFB" stroke="#22282C" strokeOpacity="0.12" />
                      {node.logo ? (
                        <g transform="translate(-11 -11) scale(1.1)">{node.logo}</g>
                      ) : (
                        <circle r="5" fill="#22282C" />
                      )}
                      <text y="38" textAnchor="middle" fontSize="13" fontWeight="500" fill="#22282C">
                        {node.name}
                      </text>
                    </g>
                  ))}
                </g>
              ))}

              <circle r="44" fill="#F8B21A" />
              <text y="6" textAnchor="middle" fontSize="17" fontWeight="600" fill="#22282C">
                bill.
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
