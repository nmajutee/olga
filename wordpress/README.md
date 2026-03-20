# WordPress CMS

This folder runs the editorial CMS side of the project.

## Start locally

```bash
cp .env.example .env
docker compose up -d
```

Then open `http://localhost:8080` and finish the WordPress installer.

## Required plugin

Install `WPGraphQL` from the WordPress admin plugins screen. Without it, the Next.js frontend has nothing to query.

Recommended additions depending on project scope:

- `Advanced Custom Fields`
- `WPGraphQL for ACF`
- `Yoast SEO` or `Rank Math` if you want SEO fields managed in WordPress

## Editorial workflow

- users log into WordPress admin to create posts or pages
- the public site does not use a WordPress theme for rendering
- Next.js consumes the content through GraphQL and renders the final UI