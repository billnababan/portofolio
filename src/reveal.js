// Scroll reveal for [data-reveal] elements that start below the fold:
// fade + rise once, staggered between siblings. Anything already on screen
// is never hidden, and nothing is hidden at all without JS or with reduced motion.
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
    { rootMargin: "0px 0px -12% 0px" },
  );

  for (const el of document.querySelectorAll("[data-reveal]")) {
    if (el.getBoundingClientRect().top < window.innerHeight) continue;
    const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
    const index = siblings.indexOf(el);
    // Stagger siblings in the same row; set through CSSOM (allowed by the CSP).
    el.style.transitionDelay = `${Math.min(index % 3, 2) * 110}ms`;
    el.classList.add("reveal");
    observer.observe(el);
  }
}
