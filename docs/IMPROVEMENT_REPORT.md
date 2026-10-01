# Performance, SEO, accessibility and UI/UX: report

Branch `perf-seo-ux`, 1 Oct 2026.

## How it was measured

- Lighthouse 13.5 (CLI, headless Chromium), simulated throttling, **3 runs per form factor, median reported**.
- Before and after served by the **same local static server**: gzip on, and it applies `vercel.json` headers/rewrites. Before = commit `2cb785a`, After = this branch.
- Before had a Google Fonts request that this sandbox could not reach; the console error it caused is part of the "before" Best Practices score.
- **Production has not been measured yet.** Run PageSpeed Insights on the live URL after deploying (see Manual steps).

## Before / after

| | Before, mobile | After, mobile | Before, desktop | After, desktop |
|---|---|---|---|---|
| Performance | 87 | **100** | 99 | **100** |
| Accessibility | 90 | **100** | 90 | **100** |
| Best Practices | 96 | **100** | 96 | **100** |
| SEO | 75 | **100** | 75 | **100** |
| Agentic Browsing | 1/4 | **3/3** applicable | 1/4 | **3/3** applicable |
| FCP | 2.37 s | 1.26 s | 0.56 s | 0.36 s |
| LCP | 2.57 s | 1.56 s | 0.81 s | 0.38 s |
| TBT | 233 ms | 7 ms | 29 ms | 0 ms |
| CLS | 0.006 | 0 | 0.001 | 0 |
| Speed Index | 4.60 s | 1.26 s | 0.84 s | 0.36 s |
| Page weight (Lighthouse) | 4,084 KB | 116 KB | 4,084 KB | 149 KB |

| | Before | After |
|---|---|---|
| JS (gzip) | 195.1 KB | 58.0 KB |
| CSS (gzip) | 10.1 KB | 5.0 KB |
| Images if every one is viewed | 3,881 KB (originals) | 186 KB (800w AVIF) |
| Largest single image file | 1,050 KB | 198 KB (certificate, full size, only on open) |
| Dependencies (runtime + dev) | 30 + 12 | 2 + 12 |
| Installed packages (node_modules top level) | 373 | 292 |

Agentic Browsing after: `agent-accessibility-tree` pass, `llms-txt` pass, `cumulative-layout-shift` pass. `ard-schema` and the three WebMCP audits are "not applicable" (no `ai-catalog.json`, WebMCP not enabled in the test browser). Before, `ard-schema` *failed* because the catch-all rewrite answered `/.well-known/ai-catalog.json` with the HTML page.

Other checks (after):

- axe-core (WCAG 2.0/2.1/2.2 A+AA + best practice), light and dark, 375 and 1280 px: **0 violations**.
- html-validate (recommended): 0 errors once four purely stylistic rules are off (`attr-case`, `doctype-style`, `void-style`, `attribute-boolean-style`; React writes `srcSet`/`<img/>`, which is valid HTML).
- JSON-LD parses; `Person` + `WebSite`. Check it in the Rich Results Test after deploying.
- `robots.txt`, `sitemap.xml`, `llms.txt`: 200 with text/plain or application/xml. Unknown paths: 404.
- Keyboard: skip link → `<main>`; dialogs open with focus on Close, Esc closes, focus returns to the opener, page scroll locked; mobile menu the same. 320 px wide: no horizontal scroll.
- Contact form (Web3Forms request mocked): empty submit focuses the first invalid field with an inline error tied by `aria-describedby`; invalid email message; success shown in `role="status"`; payload includes `botcheck`.
- No console errors under the CSP; prerendered HTML contains no `style=""` attributes (the build checks this).
- A fresh clone builds byte-identical output with zero images regenerated.

## Changelog

### Phase A: purge (`eb2a9ee`, `af3645c`)
- Removed 16 packages that were never imported, `gh-pages`, the `homepage` field and the deploy scripts.
- Deleted `NetworkAnimation`, `MarqueeAnimation`, the duplicated `data/SkillsSection.jsx`, the second `CustomCursor`, and the `"use client"` directives.
- `dist/` was committed despite being in `.gitignore`. It is no longer tracked.
- ESLint: `react/prop-types` off (no runtime prop-types). The baseline lint already failed with 37 errors.

### Phases B, D and E (`0a65f57`)
These shipped as one commit because the redesign replaced every component the performance and accessibility work touched. Splitting them would have meant writing throwaway intermediate versions.

**Prerender instead of an inline-hero fallback.** `react-dom/server` runs at build time (`vite build --ssr` → `scripts/prerender.mjs`) and `main.jsx` hydrates. There are no new dependencies, it is about 40 lines, and every section is real HTML for crawlers. Nothing reads `window` or `localStorage` during render, so hydration is clean.

**Hero/LCP.** The photo is never animated. It is served as AVIF/WebP/JPEG at 320/640/800 with `width`/`height`, `fetchpriority="high"` and a matching `<link rel=preload imagesrcset>` that the build injects. On mobile it shows at 112 px, so the h1 text paints first.

**Images.** `scripts/optimize-images.mjs` (sharp, devDependency, build-time only, nothing shipped) runs on `prebuild`. It writes hashed AVIF/WebP files and a size manifest. File names carry the source hash, which is why `/img/*` can be `immutable`. Cards load at most 800w; the 1200w file is requested only when a dialog opens. The missing `/placeholder.svg` fallback is gone.

**Fonts.** The Google Fonts `@import` chain is replaced by one self-hosted 22 KB variable woff2 (latin, 300–700), preloaded. There is a metric-matched `Space Grotesk Fallback` (size-adjust 107.92%, ascent 91.18%, descent 27.06%), computed from the font files. The real 600 weight now exists, so there are no faux weights.

**JS.** No `React.lazy`. The whole app is 58 KB gzip, under the 100 KB budget, and hydrating lazy boundaries over prerendered HTML would add complexity for no measurable gain. Build target is `es2020`, with no modulepreload polyfill.

**Motion.** The only motion is one entrance (opacity + 8 px, 300 ms, once) for elements that start below the fold. It is applied after hydration and skipped under `prefers-reduced-motion`. Hovers change colour/underline/border only. There are no infinite animations, blur orbs, custom cursor or `will-change`.

**Theme.** An inline `<head>` script sets `.dark` before first paint, using the existing `dark-mode` localStorage key, so returning visitors keep their choice. The toggle only syncs with it.

**vercel.json.**
- Security headers: CSP (script by hash, `style-src 'self'`, `connect-src` Web3Forms), HSTS, nosniff, Referrer-Policy, Permissions-Policy, COOP, X-Frame-Options.
- One-year immutable cache for `/assets`, `/img`, `/fonts`.
- `must-revalidate` for `/`.
- The catch-all rewrite is gone: there are no client routes. It turned every missing URL into a 200 HTML page, which is a soft 404 and is what failed `ard-schema`.
- `vite preview` uses `appType: 'mpa'` to behave the same way.

**Accessibility.**
- Landmarks, skip link, one `h1`, one `h2` per section and `h3` per item, unique ids (fixes `#home`/`header`, `skill`/`skills` and the duplicate `contact`).
- Real `<a href="#…">` navigation with `aria-current`.
- A native `<dialog>` for screenshots, certificates and the mobile menu.
- Labelled form fields with `autocomplete` and inline errors.
- Focus-visible ring, 44 px targets, `aria-hidden` on decorative SVGs, no emoji.

**Design.**
- The owner's own tokens from `tailwind.config.js`: ink `#22282C`, single accent `#F8B21A` (fills, underlines and focus ring only on light, never small text) and paper `#FBFBFB`, with a dark theme derived from the ink colour.
- Contrast on paper: ink 14.4:1 and muted 6.7:1 (light); ink 15.6:1, muted 8.0:1 and accent 9.7:1 (dark).
- One family, a fluid type scale, left-aligned editorial layout.
- Order is Projects before Skills and About, because reviewers look at work first.
- Skill bars and percentages, the "2+ / 20+ / 3+ / 10+ / 5+" stats, the typing animation and the pill badges are gone.

**Copy.** Rebuilt only from facts already on the site and on the certificates themselves. Unknowns are `TODO(owner)` in code and render nothing on the page.

### Phase C: SEO and agents (`77f07ee`, plus the head tags in `index.html` from the previous commit)
- Title of 59 characters and a meta description of 146.
- Canonical, robots and theme-color tags, plus the existing Google verification tag.
- Fixed SVG favicon plus PNG and apple-touch icons made from `K.svg`.
- Open Graph and Twitter tags. `og.png` is composed from `FotoProfil.jpeg` and Space Grotesk only.
- JSON-LD `Person` + `WebSite`, with `sameAs` for GitHub, LinkedIn and Instagram, `alumniOf` Batam State Polytechnic, and `knowsAbout` from the stack on the page.
- `robots.txt`, `sitemap.xml`, and `llms.txt` with real links (sections, CV, repos, profiles).
- The contact form carries WebMCP `toolname`/`tooldescription` annotations.

## Needs owner input

1. **Positioning line.** The hero says "Backend-focused full-stack web developer" and "I build REST APIs with Node.js and Express, model data in MySQL and PostgreSQL, and write the React front end that uses them." Confirm it, or rewrite it in `Hero.jsx`.
2. **Project outcomes and roles.** Problem/impact lines are missing everywhere. Roles are missing for KPP Reminders, TaskFlow, Trufflehog and Depot. The fields are in `src/data/projects.js`.
3. **Live URLs.** None of the projects had a live URL separate from its repo, so only "Source on GitHub" is shown. Add `liveUrl` where a deployment exists.
4. **TaskFlow and "Web-based project collaboration" look like one system** (the …Client and …Server repos). Consider merging them into one card.
5. **Depot in/out management** has no public repo (the old link went to the repositories tab). Its screenshot shows real container numbers, a customer name and site photos from what looks like your employer's system. Confirm it can be public.
6. **Phone number** is still public in Contact. Remove `phone` in `src/data/site.js` if you want it hidden.
7. **Years of experience / project count.** The old "2+ yrs", "20+ projects" and similar claims were removed. Add them back only with numbers you can stand behind and that match the page.

## Manual steps

1. Web3Forms dashboard: restrict the access key to `billjeferson.vercel.app`.
2. Deploy, then run PageSpeed Insights on the live URL (mobile and desktop) and compare with the table above.
3. Google Search Console: submit `https://billjeferson.vercel.app/sitemap.xml`, and check the page in the Rich Results Test.
4. Consider a custom domain. A `*.vercel.app` subdomain carries little SEO weight and can't be HSTS-preloaded. If you add one, update the canonical, OG URLs, JSON-LD, sitemap, robots.txt and llms.txt.
5. Vercel preview deployments: the CSP blocks the Vercel toolbar (vercel.live) there. Production is unaffected.

## Targets not reached

- **Mobile FCP ≤ 1.2 s → measured 1.26 s** (Speed Index is also 1.26 s against a 2.0 s target, so that one passes). The remaining cost is the one render-blocking 5 KB stylesheet at simulated slow-4G round-trip times. Inlining all the CSS was tested: FCP went to 1.23 s and LCP got worse (1.65 s). It would also have required `style-src 'unsafe-inline'`, so it was not kept.
- **Agentic Browsing "all applicable audits pass"** is met. The WebMCP audits could not be exercised because the test Chromium does not expose WebMCP.
