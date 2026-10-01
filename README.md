# billjeferson.vercel.app

Personal site of Bill Jeferson Nababan: a single page with projects, skills, background, certifications and a contact form.

Vite 5 + React 18 + Tailwind 3, prerendered to static HTML at build time and hydrated in the browser. Deployed on Vercel.

## Commands

```bash
npm ci
npm run dev            # dev server (client-rendered)
npm run build          # optimize images -> client build -> SSR build -> prerender into dist/index.html
npm run preview        # serve dist/ (unknown paths 404, like production)
npm run lint
npm run share-images   # regenerate public/og.png, apple-touch-icon.png, favicon-32.png
```

## Where things live

| What | Where |
|---|---|
| Page content (projects, certifications, contact, nav) | `src/data/*.js` |
| Tech stack + logos (single source) | `src/data/techStack.jsx` |
| Sections | `src/assets/components/*.jsx` |
| Colour tokens (light/dark) and base styles | `src/index.css`, `tailwind.config.js` |
| Original images (not shipped) | `assets-src/images/` |
| Generated responsive images | `public/img/` (from `scripts/optimize-images.mjs`) |
| Head tags, JSON-LD, theme script | `index.html` |
| Security + cache headers | `vercel.json` |
| Crawler / agent files | `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt` |

## Common changes

**Add or replace an image.** Put the original in `assets-src/images/`, add a line to the `jobs` list in `scripts/optimize-images.mjs`, run `npm run build`. Output files carry a content hash, so they can be cached forever.

**Edit the theme script in `index.html`.** The Content-Security-Policy allows it by SHA-256 hash. The build fails with the new hash if they drift; paste it into `script-src` in `vercel.json`.

**Change the sitemap date.** Update `<lastmod>` in `public/sitemap.xml` when the content changes.

## Notes

- The contact form posts to Web3Forms. The access key is public by design; restrict it to the production domain in the Web3Forms dashboard.
- Space Grotesk is served from `public/fonts/` under the SIL Open Font License (`public/fonts/OFL-SpaceGrotesk.txt`).
