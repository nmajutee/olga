import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * D1 handle for the current request.
 *
 * Throws rather than returning null: every caller needs the database, and a
 * clear error at the call site beats a cascade of "cannot read property of
 * undefined" further down.
 */
export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  const db = env.DB;

  if (!db) {
    throw new Error(
      "D1 binding `DB` is missing. Add it to wrangler.jsonc and run `wrangler d1 create olga-db`.",
    );
  }

  return db;
}

/** R2 bucket holding uploaded media. */
export async function getMediaBucket(): Promise<R2Bucket> {
  const { env } = await getCloudflareContext({ async: true });
  const bucket = env.MEDIA;

  if (!bucket) {
    throw new Error(
      "R2 binding `MEDIA` is missing. Add it to wrangler.jsonc and run `wrangler r2 bucket create olga-media`.",
    );
  }

  return bucket;
}

/** Worker environment, including secrets. */
export async function getEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}

/** URL-safe random id, used for every primary key in the schema. */
export function newId(prefix = ""): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return prefix ? `${prefix}_${hex}` : hex;
}

/** Slugify a title into a URL segment. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
