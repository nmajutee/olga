import { getDb, newId } from "@/lib/db";

export type Message = {
  id: string;
  name: string;
  email: string;
  company: string;
  inquiry: string;
  message: string;
  locale: string;
  pageUrl: string;
  emailed: boolean;
  readAt: string | null;
  createdAt: string;
};

type Row = {
  id: string;
  name: string;
  email: string;
  company: string;
  inquiry: string;
  message: string;
  locale: string;
  page_url: string;
  emailed: number;
  read_at: string | null;
  created_at: string;
};

const toMessage = (row: Row): Message => ({
  id: row.id,
  name: row.name,
  email: row.email,
  company: row.company,
  inquiry: row.inquiry,
  message: row.message,
  locale: row.locale,
  pageUrl: row.page_url,
  emailed: row.emailed === 1,
  readAt: row.read_at,
  createdAt: row.created_at,
});

export async function listMessages(limit = 100): Promise<Message[]> {
  try {
    const db = await getDb();
    const { results } = await db
      .prepare("SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT ?")
      .bind(limit)
      .all<Row>();
    return (results ?? []).map(toMessage);
  } catch (error) {
    console.error(`[messages] ${error instanceof Error ? error.message : "Unknown error."}`);
    return [];
  }
}

export async function countUnread(): Promise<number> {
  try {
    const db = await getDb();
    const row = await db
      .prepare("SELECT COUNT(*) AS count FROM contact_submissions WHERE read_at IS NULL")
      .first<{ count: number }>();
    return row?.count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Archives a submission. Called from the contact route so an enquiry survives
 * even when Resend is down — losing a client enquiry to a mail outage is worse
 * than storing it twice.
 */
export async function recordSubmission(input: {
  name: string;
  email: string;
  company: string;
  inquiry: string;
  message: string;
  locale: string;
  pageUrl: string;
  emailed: boolean;
}): Promise<void> {
  try {
    const db = await getDb();
    await db
      .prepare(
        `INSERT INTO contact_submissions
           (id, name, email, company, inquiry, message, locale, page_url, emailed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        newId("msg"),
        input.name,
        input.email,
        input.company,
        input.inquiry,
        input.message,
        input.locale,
        input.pageUrl,
        input.emailed ? 1 : 0,
      )
      .run();
  } catch (error) {
    // Never let archiving failure break the visitor's form submission.
    console.error(
      `[messages:record] ${error instanceof Error ? error.message : "Unknown error."}`,
    );
  }
}

export async function markRead(id: string, read: boolean): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE contact_submissions SET read_at = ? WHERE id = ?")
    .bind(read ? new Date().toISOString() : null, id)
    .run();
}

export async function deleteMessage(id: string): Promise<void> {
  const db = await getDb();
  await db.prepare("DELETE FROM contact_submissions WHERE id = ?").bind(id).run();
}
