# Frontend

This is the public-facing Next.js application.

## Environment

Create frontend/.env.local from .env.example.

Required variables:

- NEXT_PUBLIC_SITE_URL: public URL of the Next.js app.
- WORDPRESS_API_URL: public WordPress base URL exposing /wp-json/wp/v2/*.
- RESEND_API_KEY: API key used to send contact form submissions.
- RESEND_FROM_EMAIL: verified sender address in Resend.

Optional variables:

- RESEND_TO_EMAIL: destination inbox for contact form submissions. Defaults to contact@olgaemma.com.

## Contact form

- The website contact form validates input locally and sends submissions through Resend.
- If sending fails or Resend is not configured yet, the UI still shows the direct fallback email address.

## Cloudflare production secrets

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM_EMAIL
npx wrangler secret put RESEND_TO_EMAIL
```

## Commands

```bash
npm install
npm run dev
npm run build
```

## Connection guide

If the frontend is deployed to Cloudflare while WordPress still runs locally, follow [CONNECTING_TO_WORDPRESS.md](CONNECTING_TO_WORDPRESS.md) because Cloudflare cannot access localhost directly.
