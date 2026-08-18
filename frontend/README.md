# Frontend

The Next.js app: public site, dashboard, and API, deployed as one Cloudflare
Worker. Setup and architecture live in the [root README](../README.md); this
file covers day-to-day work in this directory.

## Environment

Copy `.env.example` to `.env.local` for local development.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the app. |
| `ANTHROPIC_API_KEY` | Article drafting. Without it the commissioning brief returns a clear error and everything else still works. |
| `RESEND_API_KEY` | Sends contact-form submissions. |
| `RESEND_FROM_EMAIL` | Verified sender address in Resend. |
| `RESEND_TO_EMAIL` | Destination inbox. Defaults to `contact@olgaemma.com`. |

Content, media, and settings are not environment variables — they live in D1
and R2, bound as `DB` and `MEDIA` in `wrangler.jsonc`.

## Commands

```bash
npm run dev               # local dev against a local D1 copy
npm run typecheck         # tsc --noEmit
npm run lint
npm run build             # next build
npm run preview           # build for Workers and serve locally
npm run deploy            # build and deploy to Cloudflare

npm run db:schema         # apply db/schema.sql to remote D1
npm run db:seed           # apply default settings
npm run db:schema:local   # same, against the local D1 copy
npm run db:seed:local

npm run import:wordpress -- <url> [--apply]
```

`cloudflare-env.d.ts` is generated, not committed. After editing
`wrangler.jsonc`, regenerate it:

```bash
npx wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts
```

Secrets are declared separately in `env.d.ts`, because `wrangler types` cannot
see values set with `wrangler secret put`.

## Contact form

The form validates locally and sends through Resend. If sending fails or Resend
is not configured, the UI still shows the direct fallback email address.

## Cloudflare production secrets

```bash
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM_EMAIL
npx wrangler secret put RESEND_TO_EMAIL
```
