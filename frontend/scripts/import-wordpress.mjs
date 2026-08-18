#!/usr/bin/env node
/**
 * One-off importer: WordPress REST API → D1 + R2.
 *
 * Run it from a machine that can reach the WordPress site (this is why it is a
 * local script rather than a route on the Worker — the old site is often behind
 * a host that Cloudflare's network cannot reach, or already offline).
 *
 *   node scripts/import-wordpress.mjs https://old-site.example
 *   node scripts/import-wordpress.mjs https://old-site.example --apply
 *
 * Without --apply it only writes db/import.sql and downloads media into
 * .import-media/, so you can inspect everything before it touches production.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const source = (process.argv[2] ?? process.env.WORDPRESS_API_URL ?? "").replace(/\/$/, "");
const apply = process.argv.includes("--apply");
const remote = process.argv.includes("--local") ? "--local" : "--remote";

if (!source) {
  console.error("Usage: node scripts/import-wordpress.mjs <wordpress-url> [--apply] [--local]");
  process.exit(1);
}

const MEDIA_DIR = ".import-media";
const SQL_FILE = "db/import.sql";
const AUTHOR_FALLBACK = "Olga Emma Elume";

const quote = (value) =>
  value === null || value === undefined ? "NULL" : `'${String(value).replaceAll("'", "''")}'`;

const id = (prefix) =>
  `${prefix}_${[...crypto.getRandomValues(new Uint8Array(16))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;

const slugify = (input) =>
  input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const stripHtml = (html) =>
  html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

async function fetchAll(resource) {
  const items = [];

  for (let page = 1; page <= 50; page += 1) {
    const url = `${source}/wp-json/wp/v2/${resource}?per_page=100&page=${page}&_embed=author`;
    const response = await fetch(url);

    if (response.status === 400) break; // WordPress returns 400 past the last page.
    if (!response.ok) {
      throw new Error(`${resource} page ${page}: HTTP ${response.status}`);
    }

    const batch = await response.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    items.push(...batch);
    if (batch.length < 100) break;
  }

  return items;
}

async function downloadMedia(items) {
  await mkdir(MEDIA_DIR, { recursive: true });

  const mapping = new Map(); // old absolute URL → { key, localPath, contentType, filename }

  for (const item of items) {
    const url = item.source_url;
    if (!url) continue;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  ! skipped ${url} (HTTP ${response.status})`);
      continue;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = path.basename(new URL(url).pathname);
    const date = new Date(item.date ?? Date.now());
    const key = `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${slugify(
      filename.replace(/\.[^.]+$/, ""),
    )}${path.extname(filename)}`;

    const localPath = path.join(MEDIA_DIR, key.replaceAll("/", "_"));
    await writeFile(localPath, buffer);

    mapping.set(url, {
      key,
      localPath,
      filename,
      contentType: item.mime_type ?? "application/octet-stream",
      size: buffer.length,
      alt: item.alt_text ?? "",
    });

    console.log(`  ↓ ${filename} → /media/${key}`);
  }

  return mapping;
}

/** Point every uploads URL in the body at the new /media path. */
function rewriteUrls(html, mapping) {
  let out = html;
  for (const [oldUrl, media] of mapping) {
    out = out.replaceAll(oldUrl, `/media/${media.key}`);
  }
  return out;
}

async function main() {
  console.log(`Reading ${source} …`);

  const [posts, mediaItems] = await Promise.all([fetchAll("posts"), fetchAll("media")]);
  console.log(`  ${posts.length} posts, ${mediaItems.length} media items`);

  console.log("Downloading media …");
  const mapping = await downloadMedia(mediaItems);
  const byId = new Map(mediaItems.map((item) => [item.id, item]));

  const statements = [];

  for (const [, media] of mapping) {
    statements.push(
      `INSERT OR IGNORE INTO media (id, r2_key, filename, content_type, size_bytes, alt_text) VALUES (${quote(
        id("med"),
      )}, ${quote(media.key)}, ${quote(media.filename)}, ${quote(media.contentType)}, ${media.size}, ${quote(
        media.alt,
      )});`,
    );
  }

  for (const post of posts) {
    const content = rewriteUrls(post.content?.rendered ?? "", mapping);
    const excerpt = stripHtml(post.excerpt?.rendered ?? "").slice(0, 300);
    const featured = byId.get(post.featured_media);
    const featuredEntry = featured ? mapping.get(featured.source_url) : null;
    const words = stripHtml(content).split(/\s+/).filter(Boolean).length;

    statements.push(
      `INSERT OR IGNORE INTO posts (
         id, slug, title, excerpt, content, status, author_name,
         cover_image_url, cover_image_alt, reading_minutes, published_at, created_at, updated_at
       ) VALUES (
         ${quote(id("post"))},
         ${quote(post.slug)},
         ${quote(stripHtml(post.title?.rendered ?? "Untitled"))},
         ${quote(excerpt)},
         ${quote(content)},
         ${quote(post.status === "publish" ? "published" : "draft")},
         ${quote(post._embedded?.author?.[0]?.name ?? AUTHOR_FALLBACK)},
         ${featuredEntry ? quote(`/media/${featuredEntry.key}`) : "NULL"},
         ${featuredEntry ? quote(featuredEntry.alt) : "NULL"},
         ${Math.max(1, Math.round(words / 225))},
         ${quote(post.date_gmt ? `${post.date_gmt}Z` : null)},
         ${quote(post.date_gmt ? `${post.date_gmt}Z` : null)},
         ${quote(post.modified_gmt ? `${post.modified_gmt}Z` : null)}
       );`,
    );
  }

  const sql = [
    "-- Generated by scripts/import-wordpress.mjs. Safe to re-run: rows are INSERT OR IGNORE.",
    `-- Source: ${source}`,
    `-- Generated: ${new Date().toISOString()}`,
    "",
    ...statements,
    "",
  ].join("\n");

  await writeFile(SQL_FILE, sql);
  console.log(`\nWrote ${SQL_FILE} (${posts.length} posts, ${mapping.size} files).`);

  const uploads = [...mapping.values()].map(
    (media) =>
      `npx wrangler r2 object put "olga-media/${media.key}" --file "${media.localPath}" --content-type "${media.contentType}" ${remote}`,
  );

  await writeFile(`${MEDIA_DIR}/upload.sh`, `#!/usr/bin/env bash\nset -e\n${uploads.join("\n")}\n`);

  if (!apply) {
    console.log("\nReview, then run:");
    console.log(`  npx wrangler d1 execute olga-db --file=${SQL_FILE} ${remote}`);
    console.log(`  bash ${MEDIA_DIR}/upload.sh`);
    return;
  }

  console.log("\nUploading media to R2 …");
  for (const [, media] of mapping) {
    const result = spawnSync(
      "npx",
      [
        "wrangler", "r2", "object", "put", `olga-media/${media.key}`,
        "--file", media.localPath,
        "--content-type", media.contentType,
        remote,
      ],
      { stdio: "inherit" },
    );
    if (result.status !== 0) throw new Error(`Upload failed for ${media.key}`);
  }

  console.log("\nApplying SQL to D1 …");
  const result = spawnSync(
    "npx",
    ["wrangler", "d1", "execute", "olga-db", `--file=${SQL_FILE}`, remote],
    { stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error("D1 import failed.");

  console.log("\nImport complete.");
}

main().catch((error) => {
  console.error(`\nImport failed: ${error.message}`);
  process.exit(1);
});
