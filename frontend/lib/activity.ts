import { getDb, newId } from "@/lib/db";

export type ActivityEntry = {
  id: string;
  userName: string;
  action: string;
  subject: string;
  targetHref: string | null;
  createdAt: string;
};

/** Fire-and-forget: an audit line must never fail the operation it describes. */
export async function logActivity(input: {
  userId: string;
  userName: string;
  action: string;
  subject: string;
  targetHref?: string;
}): Promise<void> {
  try {
    const db = await getDb();
    await db
      .prepare(
        `INSERT INTO activity (id, user_id, user_name, action, subject, target_href)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        newId("act"),
        input.userId,
        input.userName,
        input.action,
        input.subject,
        input.targetHref ?? null,
      )
      .run();
  } catch (error) {
    console.error(`[activity] ${error instanceof Error ? error.message : "Unknown error."}`);
  }
}

export async function listActivity(limit = 8): Promise<ActivityEntry[]> {
  try {
    const db = await getDb();
    const { results } = await db
      .prepare(
        `SELECT id, user_name, action, subject, target_href, created_at
           FROM activity ORDER BY created_at DESC LIMIT ?`,
      )
      .bind(limit)
      .all<{
        id: string;
        user_name: string;
        action: string;
        subject: string;
        target_href: string | null;
        created_at: string;
      }>();

    return (results ?? []).map((row) => ({
      id: row.id,
      userName: row.user_name,
      action: row.action,
      subject: row.subject,
      targetHref: row.target_href,
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}

/** "2 hours ago" — used across the dashboard's feeds. */
export function relativeTime(iso: string): string {
  const then = new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.round((Date.now() - then) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(then);
}
