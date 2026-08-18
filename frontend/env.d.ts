/**
 * Secrets are set with `wrangler secret put`, so they never appear in
 * wrangler.jsonc and `wrangler types` cannot see them. Declare them here —
 * TypeScript merges this into the generated `Cloudflare.Env`.
 */
declare namespace Cloudflare {
  interface Env {
    ANTHROPIC_API_KEY?: string;
    RESEND_API_KEY?: string;
    RESEND_FROM_EMAIL?: string;
    RESEND_TO_EMAIL?: string;
  }
}
