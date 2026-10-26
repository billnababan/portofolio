// Analytics for the CMS dashboard. No cookies and nothing stored in the browser:
// the server turns IP + user agent into a visitor hash that changes every day.
// /api/* is rewritten to the CMS server by vercel.json, so this stays same-origin.
const ENDPOINT = "/api/track";

const off = () => navigator.doNotTrack === "1";

function send(payload) {
  if (off()) return;
  navigator.sendBeacon(ENDPOINT, new Blob([JSON.stringify(payload)], { type: "application/json" }));
}

export function trackEvent(name, label) {
  send({ type: "event", name, label: String(label || "").slice(0, 120), path: location.pathname });
}

// One page view per load, plus every click on an element with data-track="<event name>".
export function setupTracking() {
  send({
    type: "pageview",
    path: location.pathname,
    referrer: document.referrer,
    utmSource: new URLSearchParams(location.search).get("utm_source") || "",
  });

  const onClick = (e) => {
    const el = e.target.closest("[data-track]");
    if (el) trackEvent(el.dataset.track, el.dataset.label);
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
