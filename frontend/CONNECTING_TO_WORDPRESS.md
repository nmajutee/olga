# Connecting Cloudflare Frontend To WordPress

This project fetches content from the WordPress REST API through WORDPRESS_API_URL. The main thing to get right is where that origin lives.

## Local development only

When you run both apps locally, use:

```text
WORDPRESS_API_URL=http://localhost:8080
```

If you are using Local for WordPress instead of Docker, replace localhost:8080 with the Local site domain, for example:

```text
WORDPRESS_API_URL=http://olgaemma.local
```

If you open /wp-json/wp/v2/posts directly in a browser and see JSON, the REST API is available.

## Local app on Windows with frontend in Linux or WSL

If WordPress is running in the Local desktop app on Windows, but your Next.js app is running in Linux or WSL, the Local site domain may work in your browser and still fail inside the terminal.

Typical symptom:

- the browser opens http://olgaemma.local/wp-json/wp/v2/posts
- curl http://olgaemma.local/wp-json/wp/v2/posts fails inside the Linux workspace

The practical fix is to add the Local domain to your Linux hosts file:

```text
127.0.0.1 olgaemma.local
```

If that still does not work, run the frontend outside Linux or WSL in a normal Windows terminal so it uses the same host resolution as the Local app.

If the hosts file still does not work, use the Windows host gateway IP for the WordPress origin and keep the Local hostname in the Host header.

Example:

```text
WORDPRESS_API_URL=http://172.29.96.1
WORDPRESS_HOST_HEADER=olgaemma.local
```

You can usually get the gateway IP with:

```bash
ip route | awk '/default/ {print $3; exit}'
```

## Cloudflare deployment with local WordPress

When the frontend is deployed to Cloudflare, localhost stops working because Cloudflare cannot access services running on your laptop directly.

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
WORDPRESS_API_URL=https://random-name.trycloudflare.com
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
  "endpoint": "https://random-name.trycloudflare.com",
  "checkedUrl": "https://random-name.trycloudflare.com/wp-json/wp/v2/posts?per_page=1&_embed=author",
  "postsVisible": true,
  "samplePost": {
    "slug": "example-post"
  }
}
```

## WordPress checklist

Before testing, make sure WordPress is actually ready:

1. Start Docker in wordpress/.
2. Finish the WordPress installer.
3. Create at least one published post.
4. Visit /wp-json/wp/v2/posts on the public WordPress URL and confirm it responds.

## Common failures

If /api/wordpress-status says the endpoint is not configured:

- your frontend environment variable is missing
- the variable was added locally but not in Cloudflare project settings

If it says HTTP 404 or HTML instead of JSON:

- the REST path is wrong
- the tunnel is pointing somewhere other than WordPress
- the WordPress host is returning a browser challenge or blocker page

If it says connection failed or timed out:

- the tunnel is down
- your local machine is asleep or offline
- Cloudflare cannot reach your local WordPress process anymore
