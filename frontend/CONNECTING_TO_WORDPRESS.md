# Connecting Cloudflare Frontend To WordPress

This project already fetches content from `WORDPRESS_GRAPHQL_ENDPOINT`. The main thing to get right is where that endpoint lives.

## Local development only

When you run both apps locally, use:

```text
NEXT_PUBLIC_WORDPRESS_URL=http://localhost:8080
WORDPRESS_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
```

That works because the Next.js app is also running on your machine.

If you are using Local for WordPress instead of Docker, replace `localhost:8080` with the Local site domain, for example:

```text
NEXT_PUBLIC_WORDPRESS_URL=http://olgaemma.local
WORDPRESS_GRAPHQL_ENDPOINT=http://olgaemma.local/graphql
```

If you open `/graphql` directly in a browser and see an error saying a GraphQL request must include `query` or `queryId`, that is normal. It means WPGraphQL is installed and waiting for an actual GraphQL request.

## Local app on Windows with frontend in Linux or WSL

If WordPress is running in the Local desktop app on Windows, but your Next.js app is running in Linux or WSL, the Local site domain may work in your browser and still fail inside the terminal.

Typical symptom:

- the browser opens `http://olgaemma.local/graphql`
- `curl http://olgaemma.local/graphql` fails inside the Linux workspace

That usually means the hostname exists in Windows hosts resolution, but not inside Linux or WSL.

The practical fix is to add the Local domain to your Linux hosts file:

```text
127.0.0.1 olgaemma.local
```

Then restart the Next.js dev server.

If that still does not work, run the frontend outside Linux or WSL in a normal Windows terminal so it uses the same host resolution as the Local app.

If the hosts file still does not work, use the Windows host gateway IP for the GraphQL endpoint and keep the Local hostname in the `Host` header.

Example:

```text
NEXT_PUBLIC_WORDPRESS_URL=http://olgaemma.local
WORDPRESS_GRAPHQL_ENDPOINT=http://172.29.96.1/graphql
WORDPRESS_HOST_HEADER=olgaemma.local
```

You can usually get the gateway IP with:

```bash
ip route | awk '/default/ {print $3; exit}'
```

This is the setup to use when WordPress is running in the Windows Local app and Next.js is running in Linux or WSL.

## Cloudflare deployment with local WordPress

When the frontend is deployed to Cloudflare, `localhost` stops working because Cloudflare cannot access services running on your laptop directly.

You need a public URL for WordPress.

## Fastest temporary option

Use a tunnel that exposes your local WordPress instance.

Example with Cloudflare Tunnel:

```bash
cloudflared tunnel --url http://localhost:8080
```

This gives you a public HTTPS URL like:

```text
https://random-name.trycloudflare.com
```

Then set your Cloudflare frontend environment variables to:

```text
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.example
NEXT_PUBLIC_WORDPRESS_URL=https://random-name.trycloudflare.com
WORDPRESS_GRAPHQL_ENDPOINT=https://random-name.trycloudflare.com/graphql
```

## Test the connection

The frontend includes a status route:

```text
/api/wordpress-status
```

Check it locally:

```bash
curl http://localhost:3000/api/wordpress-status
```

Check it after Cloudflare deploy:

```bash
curl https://your-frontend-domain.example/api/wordpress-status
```

Expected success response shape:

```json
{
  "ok": true,
  "configured": true,
  "endpoint": "https://random-name.trycloudflare.com/graphql",
  "siteTitle": "Your WordPress Site",
  "siteUrl": "https://random-name.trycloudflare.com"
}
```

## WordPress checklist

Before testing, make sure WordPress is actually ready:

1. Start Docker in `wordpress/`.
2. Finish the WordPress installer.
3. Install and activate `WPGraphQL`.
4. Create at least one published post.
5. Visit `/graphql` on the public WordPress URL and confirm it responds.

## Common failures

If `/api/wordpress-status` says the endpoint is not configured:

- your frontend environment variable is missing
- the variable was added locally but not in Cloudflare project settings

If it says HTTP 404 or GraphQL errors:

- `WPGraphQL` is not active
- the GraphQL path is wrong
- the tunnel is pointing somewhere other than WordPress

If it says connection failed or timed out:

- the tunnel is down
- your local machine is asleep or offline
- Cloudflare cannot reach your local WordPress process anymore

## Recommended practical workflow

For now:

1. Build and style the frontend locally against local WordPress.
2. Use a Cloudflare Tunnel only when you need the deployed frontend to talk to local WordPress.
3. Migrate WordPress to a hosted environment later.
4. Replace the WordPress environment variables in Cloudflare after migration.

That keeps the frontend architecture stable while you postpone CMS hosting decisions.