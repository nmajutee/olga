import { getDb } from "@/lib/db";
import { normalisePath } from "@/lib/redirects";

export type BrokenLink = {
  postId: string;
  postTitle: string;
  postSlug: string;
  href: string;
  reason: string;
};

export type LinkAudit = {
  checked: number;
  internal: number;
  broken: BrokenLink[];
};

/** Static routes the site ships. Anything else must resolve to content. */
const STATIC_PATHS = new Set([
  "",
  "/",
  "/about",
  "/services",
  "/case-studies",
  "/portfolio",
  "/blog",
  "/contact",
  "/privacy",
  "/accessibility",
]);

/**
 * Scans published article bodies for internal links that would 404.
 *
 * Only internal links are checked. Verifying external URLs would mean issuing
 * hundreds of outbound requests on a dashboard load, and a slow or
 * bot-blocking host would be reported as broken when it is fine.
 */
export async function auditInternalLinks(): Promise<LinkAudit> {
  try {
    const db = await getDb();

    const [posts, items, redirects] = await Promise.all([
      db
        .prepare("SELECT id, title, slug, content FROM posts WHERE status = 'published'")
        .all<{ id: string; title: string; slug: string; content: string }>(),
      db
        .prepare("SELECT collection, slug FROM content_items WHERE status = 'published'")
        .all<{ collection: string; slug: string }>(),
      db.prepare("SELECT source_path FROM redirects").all<{ source_path: string }>(),
    ]);

    const publishedSlugs = new Set((posts.results ?? []).map((p) => p.slug));
    const redirected = new Set((redirects.results ?? []).map((r) => r.source_path));
    const collectionPaths = new Set(
      (items.results ?? []).map((i) => `/${i.collection === "case-study" ? "case-studies" : i.collection}`),
    );

    const broken: BrokenLink[] = [];
    let internal = 0;

    for (const post of posts.results ?? []) {
      const hrefs = [...post.content.matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);

      for (const raw of hrefs) {
        if (!raw.startsWith("/")) continue; // external or anchor
        internal += 1;

        const path = normalisePath(raw);

        // A path with a redirect rule resolves, so it is not broken.
        if (redirected.has(path)) continue;
        if (STATIC_PATHS.has(path)) continue;
        if (collectionPaths.has(path)) continue;
        if (path.startsWith("/media/")) continue;

        const article = /^\/blog\/([^/]+)$/.exec(path);
        if (article) {
          if (publishedSlugs.has(article[1])) continue;
          broken.push({
            postId: post.id,
            postTitle: post.title,
            postSlug: post.slug,
            href: raw,
            reason: "No published article with that slug",
          });
          continue;
        }

        broken.push({
          postId: post.id,
          postTitle: post.title,
          postSlug: post.slug,
          href: raw,
          reason: "Path does not match any page",
        });
      }
    }

    return { checked: (posts.results ?? []).length, internal, broken };
  } catch (error) {
    console.error(`[link-audit] ${error instanceof Error ? error.message : "Unknown error."}`);
    return { checked: 0, internal: 0, broken: [] };
  }
}
