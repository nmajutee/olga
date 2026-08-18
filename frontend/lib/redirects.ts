import { getDb, newId } from "@/lib/db";

export type Redirect = {
  id: string;
  sourcePath: string;
  targetPath: string;
  statusCode: number;
  createdAt: string;
};

type Row = {
  id: string;
  source_path: string;
  target_path: string;
  status_code: number;
  created_at: string;
};

const toRedirect = (row: Row): Redirect => ({
  id: row.id,
  sourcePath: row.source_path,
  targetPath: row.target_path,
  statusCode: row.status_code,
  createdAt: row.created_at,
});

/** Paths are stored without a locale prefix, so one rule covers every language. */
export function normalisePath(path: string): string {
  const withoutQuery = path.split(/[?#]/)[0];
  const withoutLocale = withoutQuery.replace(/^\/(en|fr)(?=\/|$)/, "");
  const trimmed = withoutLocale.replace(/\/+$/, "");
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export async function listRedirects(): Promise<Redirect[]> {
  try {
    const db = await getDb();
    const { results } = await db
      .prepare("SELECT * FROM redirects ORDER BY created_at DESC LIMIT 500")
      .all<Row>();
    return (results ?? []).map(toRedirect);
  } catch (error) {
    console.error(`[redirects] ${error instanceof Error ? error.message : "Unknown error."}`);
    return [];
  }
}

/**
 * Resolves a path, following chains up to a small depth.
 *
 * Chains happen naturally: rename a slug twice and the first old URL points at
 * the second old URL. Following them means the original link still lands in
 * one hop rather than dying at an intermediate 404.
 */
export async function resolveRedirect(
  path: string,
): Promise<{ target: string; status: number } | null> {
  try {
    const db = await getDb();
    let current = normalisePath(path);
    const seen = new Set<string>([current]);
    let status = 301;
    let found = false;

    for (let hop = 0; hop < 5; hop += 1) {
      const row = await db
        .prepare("SELECT target_path, status_code FROM redirects WHERE source_path = ?")
        .bind(current)
        .first<{ target_path: string; status_code: number }>();

      if (!row) break;

      const next = normalisePath(row.target_path);
      // A loop is a configuration error; stop rather than bounce the visitor.
      if (seen.has(next)) break;

      seen.add(next);
      current = next;
      status = row.status_code;
      found = true;
    }

    return found ? { target: current, status } : null;
  } catch (error) {
    console.error(`[redirects] ${error instanceof Error ? error.message : "Unknown error."}`);
    return null;
  }
}

export async function saveRedirect(input: {
  sourcePath: string;
  targetPath: string;
  statusCode?: number;
}): Promise<void> {
  const source = normalisePath(input.sourcePath);
  const target = normalisePath(input.targetPath);

  // A redirect to itself is a loop with extra steps.
  if (!source || source === "/" || source === target) return;

  const db = await getDb();
  await db
    .prepare(
      `INSERT INTO redirects (id, source_path, target_path, status_code)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(source_path) DO UPDATE SET
         target_path = excluded.target_path,
         status_code = excluded.status_code`,
    )
    .bind(newId("rdr"), source, target, input.statusCode ?? 301)
    .run();

  // Anything that previously pointed at the old location should now point at
  // the new one, so chains stay one hop deep.
  await db
    .prepare("UPDATE redirects SET target_path = ? WHERE target_path = ? AND source_path != ?")
    .bind(target, source, source)
    .run();
}

export async function deleteRedirect(id: string): Promise<void> {
  const db = await getDb();
  await db.prepare("DELETE FROM redirects WHERE id = ?").bind(id).run();
}
