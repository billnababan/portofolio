// One entrance per element: opacity + 8px, once, only for [data-reveal]
// elements that start below the fold. Anything already on screen is never
// hidden, and nothing is hidden at all without JS or with reduced motion.
export function setupReveal() {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );

  for (const el of document.querySelectorAll("[data-reveal]")) {
    if (el.getBoundingClientRect().top < window.innerHeight) continue;
    el.classList.add("reveal");
    observer.observe(el);
  }
}
