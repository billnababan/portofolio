# billjeferson.vercel.app + CMS

Three parts in one repo:

| Folder | What | Runs on |
|---|---|---|
| `/` | The portfolio. Vite 5 + React 18 + Tailwind 3, prerendered to static HTML. | Vercel |
| `server/` | CMS API. Express 5 + TypeScript + MySQL 8 (raw SQL, no ORM). Also serves the dashboard and uploaded media. | Your VPS (Docker or PM2) |
| `cms/` | The dashboard. React 18 + TypeScript + TanStack Query. | Built into `cms/dist`, served by `server/` |

How content gets live:

```
CMS (edit, save) ──► MySQL
     │ Publish
     ▼
Vercel deploy hook ──► npm run content:pull  (GET /api/public/content → src/content/*.json, public/img, CV, og.jpg)
                   └─► npm run build         (prerender: SEO head, JSON-LD, robots.txt, sitemap.xml)
```

The site never calls the CMS while rendering, so it stays static and fast even if the VPS is down. Only two
things go to the server at runtime, both through the Vercel rewrites in `vercel.json`: page-view tracking
(`/api/track`) and the contact form (`/api/contact`).

## Local development

Needs Node 20+ and MySQL 8.

```bash
# 1. Database
mysql -u root -p -e "CREATE DATABASE portfolio; CREATE USER 'portfolio'@'localhost' IDENTIFIED BY 'change-me'; GRANT ALL ON portfolio.* TO 'portfolio'@'localhost';"

# 2. Server
cd server
cp .env.example .env          # fill DB_PASSWORD and SEED_OWNER_PASSWORD
npm ci
npm run db:migrate
npm run db:seed               # imports today's site content + images, creates the owner
npm run db:seed:demo          # optional: 120 days of made-up traffic, messages and search data (refuses in production)
npm run dev                   # http://localhost:4000/api

# 3. Dashboard (second terminal)
cd cms && npm ci && npm run dev   # http://localhost:5180, proxies /api and /media to :4000

# 4. Site (third terminal)
npm ci
CMS_API_URL=http://localhost:4000 npm run content:pull
npm run dev
```

Tests (need a `portfolio_test` database the same user can use): `cd server && npm test`.

## Deploying the CMS

### Option A: Docker

```bash
cp server/.env.example server/.env    # NODE_ENV=production, real passwords, DB_ROOT_PASSWORD=...
docker compose --env-file server/.env up -d --build
```

The container runs migrations on every start. Seed once, from a checkout of this repo that can reach the
database (e.g. `ssh -L 3306:127.0.0.1:3306 vps`): `cd server && npm run db:seed`.

### Option B: aaPanel / PM2

```bash
git clone … && cd porto
(cd cms && npm ci && npm run build)
cd server && npm ci && npm run build
cp .env.example .env   # NODE_ENV=production, CMS_DIST=../cms/dist
npm run db:migrate:prod
npm run db:seed        # once
pm2 start dist/index.js --name portfolio-cms && pm2 save
```

Then add a site in aaPanel for e.g. `cms.your-domain.com` with SSL, as a reverse proxy to
`http://127.0.0.1:4000`. Keep `TRUST_PROXY=1` so rate limits and analytics see the real visitor IP.
Back up the database and the `storage/` folder (uploaded media).

## Connecting the site to the CMS

1. **`vercel.json`**: replace `cms.your-domain.com` in the two rewrites with your CMS domain.
2. **Vercel → Settings → Environment Variables**: `CMS_API_URL=https://cms.your-domain.com`.
3. **Vercel → Settings → Build**: build command `npm run content:pull && npm run build`.
4. **Vercel → Settings → Git → Deploy Hooks**: create one for `main`, put the URL in `VERCEL_DEPLOY_HOOK_URL`
   on the server, restart. The Publish button now works.

## Optional integrations

**Google Search Console** (search clicks, positions, tracked keywords):
1. Google Cloud console → new project → enable *Google Search Console API*.
2. IAM → Service accounts → create one → Keys → add JSON key.
3. Search Console → Settings → Users and permissions → add the service account email (Restricted is enough).
4. Server `.env`: `GSC_CLIENT_EMAIL`, `GSC_PRIVATE_KEY` (the `private_key` value, `\n` kept as is),
   `GSC_PROPERTY` (`sc-domain:example.com` or `https://billjeferson.vercel.app/`). Restart.
   Data syncs every night at 03:00 WIB, or press *Sync* on the SEO page.

**Email on new messages**: `SMTP_URL` (e.g. `smtps://you%40gmail.com:app-password@smtp.gmail.com:465`) and `NOTIFY_EMAIL`.

## Background jobs (Asia/Jakarta)

| When | Job |
|---|---|
| 02:30 | SEO audit of `SITE_URL` (also ~4 min after every publish) |
| 03:00 | Search Console sync (if configured) |
| 04:00 | Delete expired sessions, old analytics salts, page views and events older than 400 days |

## Where things live

| What | Where |
|---|---|
| Database schema | `server/src/db/migrations/*.sql` (add a new numbered file; never edit an applied one) |
| SQL for each feature | `server/src/modules/<feature>/<feature>.queries.ts` |
| Validation | zod schemas in each `*.controller.ts`; errors come back as `422 {error, fields}` |
| SEO checks | `server/src/modules/seo/seo.audit.ts` |
| Dashboard pages | `cms/src/pages/*.tsx` |
| Site sections | `src/assets/components/*.jsx` |
| Site content snapshot (generated, committed) | `src/content/*.json`, `src/data/images.json` |

## Security notes

- Sessions are random tokens in an httpOnly, SameSite=Lax cookie; only their SHA-256 is stored.
- Every CMS write needs the `X-CMS: 1` header (blocks cross-site form posts).
- Analytics are cookieless: visitor = hash of a salt that rotates daily + IP + user agent; IPs are never stored.
- Never commit `server/.env`. Rotate any credentials that were ever in a zip or a commit.
