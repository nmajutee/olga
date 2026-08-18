# olgaemma.com

A Next.js site and its own editorial back office, running entirely on Cloudflare
Workers. There is no separate CMS to host, patch, or pay for — content lives in
D1, uploads live in R2, and the dashboard is part of the same deployment.

```
frontend/
  app/[locale]/…      public site (en, fr)
  app/admin/…         The Desk — dashboard, sign-in required
  app/api/admin/…     media upload, AI drafting (SSE)
  app/media/[...key]  public read path for R2 objects
  db/schema.sql       D1 schema
  lib/                data access, auth, sanitiser, SEO analysis
  scripts/            WordPress importer
```

## Architecture

| Concern | Where it lives |
| --- | --- |
| Pages, API, dashboard | One Worker (`@opennextjs/cloudflare`) |
| Articles, settings, users, sessions | Cloudflare D1 (`DB`) |
| Images and PDFs | Cloudflare R2 (`MEDIA`), served at `/media/*` |
| Article drafting | Claude (`claude-opus-5`) via `ANTHROPIC_API_KEY` |
| Contact email | Resend via `RESEND_API_KEY` |

Sessions are random tokens in an `HttpOnly` cookie; D1 stores only their
SHA-256, so a database dump cannot be replayed as a login. Passwords are
PBKDF2-SHA256 at 210,000 iterations.

> **Workers Paid is required.** One password hash costs ~55ms of CPU, well past
> the free tier's 10ms per-request limit. Everything else fits comfortably.

## First-time setup

```bash
cd frontend
npm install

npx wrangler d1 create olga-db          # paste the id into wrangler.jsonc
npx wrangler r2 bucket create olga-media

npm run db:schema                        # create tables
npm run db:seed                          # default settings

npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put RESEND_API_KEY

npm run deploy
```

Then open `https://your-domain/admin`. The first visit shows a one-time setup
screen that creates the admin account and closes itself afterwards.

## Local development

```bash
cd frontend
npm run db:schema:local
npm run db:seed:local
npm run dev
```

The dashboard is at `http://localhost:3000/admin`, backed by a local SQLite
copy of D1 under `.wrangler/`.

## Importing the old WordPress content

Run this from a machine that can reach the old site — the importer is local
precisely because the old host is often unreachable from Cloudflare's network.

```bash
cd frontend
npm run import:wordpress -- https://old-site.example          # dry run
npm run import:wordpress -- https://old-site.example --apply  # write to D1 + R2
```

The dry run writes `db/import.sql` and downloads media into `.import-media/` so
you can read both before anything touches production. Posts are inserted with
`INSERT OR IGNORE` keyed on slug, so re-running is safe. Body URLs pointing at
`wp-content/uploads` are rewritten to `/media/…`.

## The dashboard

- **Overview** — counts, recently edited, and published articles scoring under 70.
- **Articles** — full CRUD. The editor is TipTap, storing sanitised HTML; the
  right-hand rail scores the piece live against 15 weighted SEO checks and shows
  a real search-result preview.
- **Commission a draft** — a brief (topic, focus keyword, audience, voice,
  length, language) goes to Claude, which returns a structured draft: title,
  slug, meta title, meta description, excerpt, tags, and article HTML. It
  streams so the request survives the wait. **Every draft needs fact-checking
  before publishing.**
- **Media** — upload, describe (alt text), copy path, delete.
- **Settings** — site identity, SEO defaults, contact and social links, house
  voice for drafting, analytics snippet, password change.

## Content safety

Everything written to `posts.content` passes through `lib/sanitize-html.ts`, an
allowlist sanitiser: unknown tags are dropped, `<script>`/`<iframe>` are dropped
with their contents, event handlers and `style` are stripped, and `href`/`src`
must match a safe-scheme pattern. It is idempotent, so repeated edits do not
compound entity escaping.

## Deploying

`git push origin main` runs `.github/workflows/deploy.yml`. It needs two repo
secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Schema changes are
not automatic — run `npm run db:schema` yourself when `db/schema.sql` changes.
