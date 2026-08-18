import { getDb } from "@/lib/db";

export type TrafficPoint = { day: string; label: string; views: number };

export type Analytics = {
  /** Whether any view has ever been recorded. Drives the "no data yet" state. */
  hasData: boolean;
  views30: number;
  viewsPrev30: number;
  viewsToday: number;
  daily: TrafficPoint[];
  topPosts: Array<{ id: string | null; title: string; path: string; views: number; seoScore: number }>;
  topReferrers: Array<{ host: string; views: number }>;
};

const EMPTY: Analytics = {
  hasData: false,
  views30: 0,
  viewsPrev30: 0,
  viewsToday: 0,
  daily: [],
  topPosts: [],
  topReferrers: [],
};

const dayKey = (offset: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
};

/**
 * Everything the dashboard's performance panel needs, in one batch.
 *
 * Days with no traffic are filled in as zero rather than omitted — a line that
 * skips its empty days misrepresents the shape of the trend.
 */
export async function getAnalytics(): Promise<Analytics> {
  try {
    const db = await getDb();
    const from30 = dayKey(29);
    const from60 = dayKey(59);
    const today = dayKey(0);

    const [totals, dailyRows, postRows, referrerRows] = await db.batch<Record<string, unknown>>([
      db
        .prepare(
          `SELECT
             COALESCE(SUM(CASE WHEN day >= ? THEN views END), 0)                      AS views30,
             COALESCE(SUM(CASE WHEN day >= ? AND day < ? THEN views END), 0)          AS viewsPrev30,
             COALESCE(SUM(CASE WHEN day = ? THEN views END), 0)                       AS viewsToday,
             COALESCE(SUM(views), 0)                                                  AS viewsAll
           FROM page_views`,
        )
        .bind(from30, from60, from30, today),
      db
        .prepare(
          `SELECT day, SUM(views) AS views FROM page_views
            WHERE day >= ? GROUP BY day ORDER BY day ASC`,
        )
        .bind(from30),
      db
        .prepare(
          `SELECT v.post_id AS id, v.path AS path, SUM(v.views) AS views,
                  COALESCE(p.title, v.path) AS title,
                  COALESCE(p.seo_score, 0)  AS seo_score
             FROM page_views v
             LEFT JOIN posts p ON p.id = v.post_id
            WHERE v.day >= ?
            GROUP BY v.path
            ORDER BY views DESC
            LIMIT 5`,
        )
        .bind(from30),
      db
        .prepare(
          `SELECT host, SUM(views) AS views FROM referrers
            WHERE day >= ? GROUP BY host ORDER BY views DESC LIMIT 5`,
        )
        .bind(from30),
    ]);

    const num = (value: unknown) => Number(value ?? 0) || 0;
    const t = totals.results?.[0] ?? {};

    const byDay = new Map(
      (dailyRows.results ?? []).map((row) => [String(row.day), num(row.views)]),
    );

    const daily: TrafficPoint[] = Array.from({ length: 30 }, (_, index) => {
      const day = dayKey(29 - index);
      const date = new Date(`${day}T00:00:00Z`);
      return {
        day,
        label: new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        }).format(date),
        views: byDay.get(day) ?? 0,
      };
    });

    return {
      hasData: num(t.viewsAll) > 0,
      views30: num(t.views30),
      viewsPrev30: num(t.viewsPrev30),
      viewsToday: num(t.viewsToday),
      daily,
      topPosts: (postRows.results ?? []).map((row) => ({
        id: row.id ? String(row.id) : null,
        title: String(row.title),
        path: String(row.path),
        views: num(row.views),
        seoScore: num(row.seo_score),
      })),
      topReferrers: (referrerRows.results ?? []).map((row) => ({
        host: String(row.host),
        views: num(row.views),
      })),
    };
  } catch (error) {
    console.error(
      `[analytics] ${error instanceof Error ? error.message : "Unknown error."}`,
    );
    return EMPTY;
  }
}
