import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Page-view beacon. Cookieless and identifier-free: it increments two daily
 * counters and stores nothing that could be tied to a person. Honours
 * Do Not Track, and always answers 204 so a tracking failure can never affect
 * the page the reader is on.
 */
export async function POST(request: Request) {
  const noContent = new Response(null, { status: 204 });

  if (request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1") {
    return noContent;
  }

  try {
    const body = (await request.json()) as { path?: string; referrer?: string };

    const rawPath = (body.path ?? "").trim();
    if (!rawPath.startsWith("/") || rawPath.length > 300) return noContent;

    // Strip the locale prefix so /en/blog/x and /fr/blog/x are one article.
    const path = rawPath.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";
    const day = new Date().toISOString().slice(0, 10);

    // Bare hostname only — query strings can carry personal data.
    let host = "direct";
    const referrer = (body.referrer ?? "").trim();
    if (referrer) {
      try {
        const url = new URL(referrer);
        const selfHost = new URL(request.url).host;
        host = url.host === selfHost ? "direct" : url.host.replace(/^www\./, "");
      } catch {
        host = "direct";
      }
    }

    const db = await getDb();

    // Resolve the article once, so the dashboard can rank posts by views
    // without pattern-matching paths at read time.
    let postId: string | null = null;
    const slugMatch = /^\/blog\/([^/]+)$/.exec(path);
    if (slugMatch) {
      const row = await db
        .prepare("SELECT id FROM posts WHERE slug = ?")
        .bind(decodeURIComponent(slugMatch[1]))
        .first<{ id: string }>();
      postId = row?.id ?? null;
    }

    await db.batch([
      db
        .prepare(
          `INSERT INTO page_views (day, path, post_id, views) VALUES (?, ?, ?, 1)
             ON CONFLICT(day, path) DO UPDATE SET
               views = views + 1,
               post_id = COALESCE(page_views.post_id, excluded.post_id)`,
        )
        .bind(day, path, postId),
      db
        .prepare(
          `INSERT INTO referrers (day, host, views) VALUES (?, ?, 1)
             ON CONFLICT(day, host) DO UPDATE SET views = views + 1`,
        )
        .bind(day, host),
    ]);
  } catch (error) {
    console.error(
      `[track] ${error instanceof Error ? error.message : "Unknown error."}`,
    );
  }

  return noContent;
}
