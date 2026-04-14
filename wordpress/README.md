# WordPress CMS

This folder runs the editorial CMS side of the project.

## Start locally

```bash
cp .env.example .env
docker compose up -d
```

Then open http://localhost:8080 and finish the WordPress installer.

Set HEADLESS_FRONTEND_URL in wordpress/.env to the public frontend base URL that WordPress should open for posts and pages. For local development this should usually stay at http://localhost:3000.

## Plugins

No extra plugin is required for the current REST-based frontend integration.

Recommended additions depending on project scope:

- Advanced Custom Fields
- Yoast SEO or Rank Math if you want SEO fields managed in WordPress

## Editorial workflow

- users log into WordPress admin to create posts or pages
- the public site does not use a WordPress theme for rendering
- the mu-plugin redirects public WordPress URLs to the frontend defined by HEADLESS_FRONTEND_URL
- Next.js consumes the content through the WordPress REST API and renders the final UI
