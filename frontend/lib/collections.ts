import { getDb, newId, slugify } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize-html";

/**
 * Portfolio pieces, services, case studies and testimonials share a shape:
 * a title, a summary, an optional body and image, and an order. Rather than
 * four near-identical tables, screens and editors, they live in one table and
 * differ only by the field list declared here.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "image"
  | "url"
  | "number"
  | "list";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  placeholder?: string;
  /** Half-width in the editor grid. */
  half?: boolean;
};

export type CollectionDef = {
  slug: string;
  label: string;
  plural: string;
  description: string;
  /** Fields stored in the `extra` JSON column. */
  extra: FieldDef[];
  /** Which core columns this collection actually uses. */
  uses: { summary: boolean; body: boolean; image: boolean };
  summaryLabel: string;
  emptyHint: string;
  /** Where this collection appears on the public site, without a locale. */
  publicPath: string | null;
};

export const COLLECTIONS: Record<string, CollectionDef> = {
  portfolio: {
    slug: "portfolio",
    publicPath: "/portfolio",
    label: "Portfolio piece",
    plural: "Portfolio",
    description: "Work samples shown in the portfolio grid, newest ordering first.",
    uses: { summary: true, body: false, image: true },
    summaryLabel: "Caption",
    emptyHint: "Add the work you want people to see first.",
    extra: [
      { key: "category", label: "Category", type: "text", half: true, placeholder: "Digital rights" },
      { key: "year", label: "Year", type: "text", half: true, placeholder: "2025" },
      { key: "location", label: "Location", type: "text", half: true, placeholder: "Yaoundé, Cameroon" },
      { key: "link", label: "External link", type: "url", half: true, placeholder: "https://" },
    ],
  },
  service: {
    slug: "service",
    publicPath: "/services",
    label: "Service",
    plural: "Services",
    description: "What you offer. Shown on the services page in this order.",
    uses: { summary: true, body: true, image: false },
    summaryLabel: "One-line description",
    emptyHint: "Describe the work you take on.",
    extra: [
      { key: "price_from", label: "Starting from", type: "text", half: true, placeholder: "On request" },
      { key: "duration", label: "Typical duration", type: "text", half: true, placeholder: "4–6 weeks" },
      { key: "deliverables", label: "Deliverables", type: "list", hint: "One per line." },
      { key: "tools", label: "Tools", type: "list", hint: "One per line." },
    ],
  },
  "case-study": {
    slug: "case-study",
    publicPath: "/case-studies",
    label: "Case study",
    plural: "Case studies",
    description: "Longer proof pieces with a client, an approach and an outcome.",
    uses: { summary: true, body: true, image: true },
    summaryLabel: "Standfirst",
    emptyHint: "Turn your strongest project into a case study.",
    extra: [
      { key: "client", label: "Client or partner", type: "text", half: true },
      { key: "year", label: "Year", type: "text", half: true, placeholder: "2025" },
      { key: "role", label: "Your role", type: "text", half: true, placeholder: "Communications lead" },
      { key: "outcome", label: "Headline outcome", type: "text", hint: "One sentence. This is what people remember." },
      { key: "metrics", label: "Metrics", type: "list", hint: "One per line, e.g. `12,000 people reached`." },
    ],
  },
  testimonial: {
    slug: "testimonial",
    publicPath: null,
    label: "Testimonial",
    plural: "Testimonials",
    description: "Quotes from people you have worked with.",
    uses: { summary: true, body: false, image: true },
    summaryLabel: "Quote",
    emptyHint: "Add a quote from someone you have worked with.",
    extra: [
      { key: "role", label: "Their role", type: "text", half: true, placeholder: "Programme Director" },
      { key: "organisation", label: "Organisation", type: "text", half: true },
    ],
  },
};

export const COLLECTION_LIST = Object.values(COLLECTIONS);

/**
 * Splits a `list` field into entries. Handles CRLF (Windows browsers) as well
 * as LF, and tolerates a literal backslash-n sequence, which is what arrives
 * when a value has been round-tripped through an over-escaped import.
 */
export function splitLines(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .replace(/\\n/g, "\n")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getCollection(slug: string): CollectionDef | null {
  return COLLECTIONS[slug] ?? null;
}

export type ContentItem = {
  id: string;
  collection: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  imageUrl: string | null;
  imageAlt: string;
  extra: Record<string, string>;
  sortOrder: number;
  status: "draft" | "published";
  updatedAt: string;
};

type Row = {
  id: string;
  collection: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  image_url: string | null;
  image_alt: string;
  extra: string;
  sort_order: number;
  status: "draft" | "published";
  updated_at: string;
};

function toItem(row: Row): ContentItem {
  let extra: Record<string, string> = {};
  try {
    const parsed: unknown = JSON.parse(row.extra || "{}");
    if (parsed && typeof parsed === "object") extra = parsed as Record<string, string>;
  } catch {
    // A malformed blob should not take the whole page down.
    extra = {};
  }

  return {
    id: row.id,
    collection: row.collection,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    extra,
    sortOrder: row.sort_order,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export async function listItems(
  collection: string,
  options: { publishedOnly?: boolean } = {},
): Promise<ContentItem[]> {
  try {
    const db = await getDb();
    const where = options.publishedOnly
      ? "collection = ? AND status = 'published'"
      : "collection = ?";

    const { results } = await db
      .prepare(
        `SELECT * FROM content_items WHERE ${where} ORDER BY sort_order ASC, created_at DESC`,
      )
      .bind(collection)
      .all<Row>();

    return (results ?? []).map(toItem);
  } catch (error) {
    console.error(
      `[collections:${collection}] ${error instanceof Error ? error.message : "Unknown error."}`,
    );
    return [];
  }
}

export async function countItems(collection: string): Promise<number> {
  try {
    const db = await getDb();
    const row = await db
      .prepare("SELECT COUNT(*) AS count FROM content_items WHERE collection = ?")
      .bind(collection)
      .first<{ count: number }>();
    return row?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function getItem(id: string): Promise<ContentItem | null> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT * FROM content_items WHERE id = ?")
    .bind(id)
    .first<Row>();
  return row ? toItem(row) : null;
}

export type ContentInput = {
  collection: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  extra: Record<string, string>;
  status: "draft" | "published";
};

async function uniqueSlug(
  collection: string,
  desired: string,
  excludeId?: string,
): Promise<string> {
  const db = await getDb();
  const base = slugify(desired) || "item";
  let candidate = base;
  let suffix = 2;

  for (;;) {
    const row = await db
      .prepare("SELECT id FROM content_items WHERE collection = ? AND slug = ?")
      .bind(collection, candidate)
      .first<{ id: string }>();

    if (!row || row.id === excludeId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function saveItem(input: ContentInput, id?: string): Promise<string> {
  const db = await getDb();
  const slug = await uniqueSlug(input.collection, input.slug || input.title, id);
  const body = sanitizeHtml(input.body);
  const extra = JSON.stringify(input.extra);

  if (id) {
    await db
      .prepare(
        `UPDATE content_items SET
           slug = ?, title = ?, summary = ?, body = ?, image_url = ?, image_alt = ?,
           extra = ?, status = ?, updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(
        slug, input.title, input.summary, body,
        input.imageUrl || null, input.imageAlt, extra, input.status, id,
      )
      .run();

    return id;
  }

  const newItemId = newId("itm");
  const next = await db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM content_items WHERE collection = ?")
    .bind(input.collection)
    .first<{ next: number }>();

  await db
    .prepare(
      `INSERT INTO content_items
         (id, collection, slug, title, summary, body, image_url, image_alt, extra, sort_order, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      newItemId, input.collection, slug, input.title, input.summary, body,
      input.imageUrl || null, input.imageAlt, extra, next?.next ?? 0, input.status,
    )
    .run();

  return newItemId;
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDb();
  await db.prepare("DELETE FROM content_items WHERE id = ?").bind(id).run();
}

/** Persists a drag-reordered list in one batch. */
export async function reorderItems(ids: string[]): Promise<void> {
  if (!ids.length) return;

  const db = await getDb();
  await db.batch(
    ids.map((itemId, index) =>
      db
        .prepare("UPDATE content_items SET sort_order = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(index, itemId),
    ),
  );
}
