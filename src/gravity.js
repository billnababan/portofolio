// Cursor gravity for the hero circles.
//
// Each body is pulled back to its home position by a spring, pulled toward the
// pointer when it comes close (like a small gravity well), and pushed apart from
// the other bodies so they never overlap. A click or tap kicks them away.
//
// The loop only runs while something is moving: it starts on pointer activity and
// stops once every body is back at rest, so an idle page costs nothing.
// The outer element of each body owns the CSS drop-in animation; this script only
// moves the inner [data-move] element, so the two never fight over `transform`.

const SPRING = 0.018; // pull back home
const DAMPING = 0.88; // velocity kept per frame
const RANGE = 420; // px: how far the pointer's pull reaches
const PULL = 2.4; // strength of the pull at close range
const KICK = 22; // click impulse
const GAP = 8; // px kept between bodies

export function createGravity(container, elements) {
  const bodies = elements.map((el) => ({
    el,
    inner: el.querySelector("[data-move]"),
    r: 0,
    hx: 0,
    hy: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  }));
  const pointer = { x: 0, y: 0, active: false };
  let frame = 0;
  let visible = true;

  const measure = () => {
    for (const b of bodies) {
      // The body is centred on its anchor point (see Hero.jsx), so the anchor is its centre.
      b.r = b.el.offsetWidth / 2;
      b.hx = b.el.offsetLeft;
      b.hy = b.el.offsetTop;
    }
  };

  const step = () => {
    frame = 0;
    let moving = false;

    for (const b of bodies) {
      let fx = -SPRING * b.x;
      let fy = -SPRING * b.y;

      if (pointer.active) {
        const dx = pointer.x - (b.hx + b.x);
        const dy = pointer.y - (b.hy + b.y);
        const d = Math.hypot(dx, dy) || 1;
        if (d < RANGE) {
          const closest = b.r + 20;
          // Pull toward the pointer, easing off near it so bodies orbit instead of sitting on it.
          const f = d > closest ? PULL * (1 - d / RANGE) : -0.8;
          const mass = Math.max(1, b.r / 24);
          fx += (dx / d) * (f / mass);
          fy += (dy / d) * (f / mass);
        }
      }

      b.vx = (b.vx + fx) * DAMPING;
      b.vy = (b.vy + fy) * DAMPING;
    }

    // Keep bodies apart; exchange a little momentum on contact.
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const c = bodies[j];
        const dx = c.hx + c.x + c.vx - (a.hx + a.x + a.vx);
        const dy = c.hy + c.y + c.vy - (a.hy + a.y + a.vy);
        const d = Math.hypot(dx, dy) || 1;
        const overlap = a.r + c.r + GAP - d;
        if (overlap > 0) {
          const nx = dx / d;
          const ny = dy / d;
          const ma = a.r;
          const mc = c.r;
          const total = ma + mc;
          a.vx -= nx * overlap * (mc / total) * 0.5;
          a.vy -= ny * overlap * (mc / total) * 0.5;
          c.vx += nx * overlap * (ma / total) * 0.5;
          c.vy += ny * overlap * (ma / total) * 0.5;
        }
      }
    }

    for (const b of bodies) {
      b.x += b.vx;
      b.y += b.vy;
      if (Math.abs(b.vx) + Math.abs(b.vy) > 0.03 || Math.abs(b.x) + Math.abs(b.y) > 0.3) moving = true;
      b.inner.style.transform = `translate3d(${b.x.toFixed(2)}px, ${b.y.toFixed(2)}px, 0)`;
    }

    if ((moving || pointer.active) && visible) frame = requestAnimationFrame(step);
  };

  const wake = () => {
    if (!frame && visible) frame = requestAnimationFrame(step);
  };

  const local = (e) => {
    const rect = container.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  };

  const onMove = (e) => {
    local(e);
    pointer.active = true;
    wake();
  };

  const onLeave = () => {
    pointer.active = false;
    wake();
  };

  const onDown = (e) => {
    local(e);
    for (const b of bodies) {
      const dx = b.hx + b.x - pointer.x;
      const dy = b.hy + b.y - pointer.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < RANGE) {
        const f = (KICK * (1 - d / RANGE)) / Math.max(1, b.r / 30);
        b.vx += (dx / d) * f;
        b.vy += (dy / d) * f;
      }
    }
    wake();
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
  });

  // Measure once the drop-in animation has placed the bodies.
  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(container);
  io.observe(container);
  container.addEventListener("pointermove", onMove, { passive: true });
  container.addEventListener("pointerleave", onLeave, { passive: true });
  container.addEventListener("pointerdown", onDown, { passive: true });

  return () => {
    cancelAnimationFrame(frame);
    ro.disconnect();
    io.disconnect();
    container.removeEventListener("pointermove", onMove);
    container.removeEventListener("pointerleave", onLeave);
    container.removeEventListener("pointerdown", onDown);
  };
}
