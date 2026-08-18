import { getDb } from "@/lib/db";
import { countUnread } from "@/lib/messages";
import { COLLECTION_LIST } from "@/lib/collections";

export type NavCounts = {
  posts: number;
  drafts: number;
  media: number;
  unreadMessages: number;
  collections: number;
};

/** Counts for the sidebar badges. One round trip, never fatal. */
export async function getNavCounts(): Promise<NavCounts> {
  try {
    const db = await getDb();
    const [posts, drafts, media, collections] = await db.batch<{ count: number }>([
      db.prepare("SELECT COUNT(*) AS count FROM posts"),
      db.prepare("SELECT COUNT(*) AS count FROM posts WHERE status = 'draft'"),
      db.prepare("SELECT COUNT(*) AS count FROM media"),
      db.prepare("SELECT COUNT(*) AS count FROM content_items"),
    ]);

    return {
      posts: posts.results?.[0]?.count ?? 0,
      drafts: drafts.results?.[0]?.count ?? 0,
      media: media.results?.[0]?.count ?? 0,
      collections: collections.results?.[0]?.count ?? 0,
      unreadMessages: await countUnread(),
    };
  } catch {
    return { posts: 0, drafts: 0, media: 0, unreadMessages: 0, collections: 0 };
  }
}

export type DashboardData = {
  totals: {
    posts: number;
    published: number;
    drafts: number;
    media: number;
    messages: number;
    unread: number;
    words: number;
  };
  /** Same window, previous period — powers the "vs last month" deltas. */
  previous: { published: number; media: number; messages: number };
  activity: Array<{ label: string; value: number; caption: string }>;
  seo: { good: number; warn: number; bad: number; healthPct: number };
  recentPosts: Array<{
    id: string;
    title: string;
    slug: string;
    status: "draft" | "published";
    seoScore: number;
    readingMinutes: number;
    updatedAt: string;
  }>;
  needsAttention: Array<{ id: string; title: string; seoScore: number; reason: string }>;
  collectionCounts: Array<{ slug: string; plural: string; count: number }>;
};

const EMPTY: DashboardData = {
  totals: { posts: 0, published: 0, drafts: 0, media: 0, messages: 0, unread: 0, words: 0 },
  previous: { published: 0, media: 0, messages: 0 },
  activity: [],
  seo: { good: 0, warn: 0, bad: 0, healthPct: 0 },
  recentPosts: [],
  needsAttention: [],
  collectionCounts: [],
};

/** Six-month buckets for the activity chart, oldest first. */
function monthBuckets(): Array<{ label: string; caption: string; start: string; end: string }> {
  const buckets = [];
  const now = new Date();

  for (let back = 5; back >= 0; back -= 1) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back + 1, 1));

    buckets.push({
      label: new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(start),
      caption: new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(start),
      start: start.toISOString(),
      end: end.toISOString(),
    });
  }

  return buckets;
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const db = await getDb();
    const buckets = monthBuckets();
    const thisMonthStart = buckets[buckets.length - 1].start;
    const lastMonthStart = buckets[buckets.length - 2]?.start ?? thisMonthStart;

    const [totals, seo, recent, attention, previous, ...activityRows] = await db.batch<Record<string, number | string>>([
      db.prepare(
        `SELECT
           COUNT(*)                                                   AS posts,
           SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END)      AS published,
           SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END)          AS drafts,
           COALESCE(SUM(reading_minutes), 0) * 225                    AS words,
           (SELECT COUNT(*) FROM media)                               AS media,
           (SELECT COUNT(*) FROM contact_submissions)                 AS messages,
           (SELECT COUNT(*) FROM contact_submissions WHERE read_at IS NULL) AS unread
         FROM posts`,
      ),
      db.prepare(
        `SELECT
           SUM(CASE WHEN seo_score >= 70 THEN 1 ELSE 0 END) AS good,
           SUM(CASE WHEN seo_score >= 45 AND seo_score < 70 THEN 1 ELSE 0 END) AS warn,
           SUM(CASE WHEN seo_score < 45 THEN 1 ELSE 0 END)  AS bad
         FROM posts WHERE status = 'published'`,
      ),
      db.prepare(
        `SELECT id, title, slug, status, seo_score, reading_minutes, updated_at
           FROM posts ORDER BY updated_at DESC LIMIT 5`,
      ),
      db.prepare(
        `SELECT id, title, seo_score FROM posts
          WHERE status = 'published' AND seo_score < 70
          ORDER BY seo_score ASC LIMIT 4`,
      ),
      db.prepare(
        `SELECT
           (SELECT COUNT(*) FROM posts WHERE status = 'published' AND published_at >= ? AND published_at < ?) AS published,
           (SELECT COUNT(*) FROM media WHERE created_at >= ? AND created_at < ?) AS media,
           (SELECT COUNT(*) FROM contact_submissions WHERE created_at >= ? AND created_at < ?) AS messages`,
      ).bind(lastMonthStart, thisMonthStart, lastMonthStart, thisMonthStart, lastMonthStart, thisMonthStart),
      ...buckets.map((bucket) =>
        db
          .prepare(
            `SELECT COUNT(*) AS value FROM posts
              WHERE status = 'published' AND published_at >= ? AND published_at < ?`,
          )
          .bind(bucket.start, bucket.end),
      ),
    ]);

    const t = totals.results?.[0] ?? {};
    const s = seo.results?.[0] ?? {};
    const p = previous.results?.[0] ?? {};

    const num = (value: unknown) => Number(value ?? 0) || 0;

    const good = num(s.good);
    const warn = num(s.warn);
    const bad = num(s.bad);
    const scored = good + warn + bad;

    const collectionCounts = await Promise.all(
      COLLECTION_LIST.map(async (definition) => {
        const row = await db
          .prepare("SELECT COUNT(*) AS count FROM content_items WHERE collection = ?")
          .bind(definition.slug)
          .first<{ count: number }>();
        return { slug: definition.slug, plural: definition.plural, count: row?.count ?? 0 };
      }),
    );

    return {
      totals: {
        posts: num(t.posts),
        published: num(t.published),
        drafts: num(t.drafts),
        media: num(t.media),
        messages: num(t.messages),
        unread: num(t.unread),
        words: num(t.words),
      },
      previous: {
        published: num(p.published),
        media: num(p.media),
        messages: num(p.messages),
      },
      activity: buckets.map((bucket, index) => ({
        label: bucket.label,
        caption: bucket.caption,
        value: num(activityRows[index]?.results?.[0]?.value),
      })),
      seo: {
        good,
        warn,
        bad,
        healthPct: scored ? Math.round((good / scored) * 100) : 0,
      },
      recentPosts: (recent.results ?? []).map((row) => ({
        id: String(row.id),
        title: String(row.title || "Untitled"),
        slug: String(row.slug),
        status: row.status === "published" ? "published" : "draft",
        seoScore: num(row.seo_score),
        readingMinutes: num(row.reading_minutes),
        updatedAt: String(row.updated_at),
      })),
      needsAttention: (attention.results ?? []).map((row) => ({
        id: String(row.id),
        title: String(row.title || "Untitled"),
        seoScore: num(row.seo_score),
        reason:
          num(row.seo_score) < 45
            ? "Missing the basics"
            : "A few checks short",
      })),
      collectionCounts,
    };
  } catch (error) {
    console.error(
      `[dashboard] ${error instanceof Error ? error.message : "Unknown error."}`,
    );
    return EMPTY;
  }
}

/** Percentage change, guarding the divide-by-zero that every dashboard forgets. */
export function delta(current: number, previous: number): { pct: number; tone: "up" | "down" | "flat" } {
  if (previous === 0) {
    return current === 0 ? { pct: 0, tone: "flat" } : { pct: 100, tone: "up" };
  }

  const pct = Math.round(((current - previous) / previous) * 100);
  return { pct: Math.abs(pct), tone: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}
