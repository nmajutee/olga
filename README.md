# Headless WordPress + Next.js Starter

This workspace is split into two parts:

- `wordpress/`: a local WordPress instance your client can use through the normal dashboard.
- `frontend/`: a Next.js app that fetches content from WordPress through WPGraphQL.

The goal is simple: editors stay in WordPress, the public site runs on Next.js.

## Architecture

1. Content editors write posts, pages, and media in WordPress.
2. WordPress exposes structured content through the WPGraphQL plugin.
3. The Next.js app fetches that content server-side and renders the frontend.

## Quick start

### 1. Start WordPress

```bash
cd wordpress
cp .env.example .env
docker compose up -d
```

Open `http://localhost:8080` and complete the WordPress install.

Then install these plugins from the WordPress dashboard:

- `WPGraphQL`
- `WPGraphQL for ACF` if you plan to model custom fields with ACF

Your GraphQL endpoint will be:

```text
http://localhost:8080/graphql
```

### 2. Start the Next.js frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Content flow

- Homepage pulls the latest posts from WordPress.
- `/blog` renders a blog archive.
- `/blog/[slug]` renders individual posts from WordPress content.

## Production direction

For deployment, keep WordPress on a managed host or VPS for editorial workflows and deploy the Next.js app separately on a frontend host such as Vercel. Set `NEXT_PUBLIC_WORDPRESS_URL` and `WORDPRESS_GRAPHQL_ENDPOINT` to the production WordPress instance.

## Cloudflare frontend + local WordPress

If you deploy the frontend to Cloudflare now, the frontend cannot reach `http://localhost:8080/graphql` on your laptop. `localhost` only exists on your machine, not inside Cloudflare.

For this temporary phase, expose your local WordPress with a public tunnel and point the frontend at that public URL.

### Recommended temporary flow

1. Start WordPress locally.
2. Install and activate `WPGraphQL`.
3. Expose local WordPress through a public hostname.
4. Set Cloudflare environment variables to that public hostname.
5. Verify the connection through `/api/wordpress-status` on the deployed frontend.

### Example using Cloudflare Tunnel

Install `cloudflared`, then run:

```bash
cloudflared tunnel --url http://localhost:8080
```

That gives you a temporary public URL similar to:

```text
https://random-name.trycloudflare.com
```

Use these values in your Cloudflare frontend environment:

```text
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.example
NEXT_PUBLIC_WORDPRESS_URL=https://random-name.trycloudflare.com
WORDPRESS_GRAPHQL_ENDPOINT=https://random-name.trycloudflare.com/graphql
```

After deployment, open:

```text
https://your-frontend-domain.example/api/wordpress-status
```

If the connection works, the endpoint returns JSON with `ok: true`.

### Important note about uploads and admin

Your customer should continue using the normal WordPress admin on the tunneled URL for now. Later, when you migrate WordPress to a real host, replace the two WordPress environment variables in Cloudflare with the permanent domain.

### Migration later

When WordPress moves off local development, you only need to update:

- `NEXT_PUBLIC_WORDPRESS_URL`
- `WORDPRESS_GRAPHQL_ENDPOINT`

The Next.js frontend code can stay the same.
