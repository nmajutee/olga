# Frontend

This is the public-facing Next.js application.

## Environment

Create `frontend/.env.local` from `.env.example`.

Required variables:

- `WORDPRESS_GRAPHQL_ENDPOINT`: GraphQL endpoint exposed by WordPress through WPGraphQL.
- `NEXT_PUBLIC_WORDPRESS_URL`: public WordPress URL, useful for linking or previews.
- `NEXT_PUBLIC_SITE_URL`: public URL of the Next.js app.

## Commands

```bash
npm install
npm run dev
npm run build
```

## Extend this

Typical next steps:

- add routes for WordPress pages and custom post types
- add ACF field rendering if the client needs structured landing pages
- add preview and webhook-based revalidation

## Connection guide

If the frontend is deployed to Cloudflare while WordPress still runs locally, follow [CONNECTING_TO_WORDPRESS.md](CONNECTING_TO_WORDPRESS.md) because Cloudflare cannot access `localhost` directly.