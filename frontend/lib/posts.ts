import { getDb, newId, slugify } from "@/lib/db";
import { saveRedirect } from "@/lib/redirects";

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  authorName: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  readingMinutes: number;
};

export type Post = PostSummary & {
  authorId: string | null;
  content: string;
  status: "draft" | "published";
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  seoScore: number;
  updatedAt: string;
  tags: string[];
};

export type PostsResult = {
  posts: PostSummary[];
  error: string | null;
};

type PostRow = {
  id: string;
  slug: string;
  author_id: string | null;
  title: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
  author_name: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  noindex: number;
  seo_score: number;
  reading_minutes: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const SUMMARY_COLUMNS = `id, slug, title, excerpt, author_name, cover_image_url,
  cover_image_alt, reading_minutes, published_at, created_at`;

function toSummary(row: Partial<PostRow> & { id: string; slug: string }): PostSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title ?? "",
    excerpt: row.excerpt ?? "",
    date: row.published_at ?? row.created_at ?? "",
    authorName: row.author_name ?? "Olga Emma Elume",
    coverImageUrl: row.cover_image_url ?? null,
    coverImageAlt: row.cover_image_alt ?? null,
    readingMinutes: row.reading_minutes ?? 0,
  };
}

function toPost(row: PostRow, tags: string[]): Post {
  return {
    ...toSummary(row),
    authorId: row.author_id ?? null,
    content: row.content,
    status: row.status,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    focusKeyword: row.focus_keyword,
    canonicalUrl: row.canonical_url,
    noindex: row.noindex === 1,
    seoScore: row.seo_score,
    updatedAt: row.updated_at,
    tags,
  };
}

function logError(scope: string, message: string) {
  console.error(`[posts:${scope}] ${message}`);
}

// ── Public reads (published only) ───────────────────────────────────────────

export async function getPostsResult(limit = 6): Promise<PostsResult> {
  try {
    const db = await getDb();
    const { results } = await db
      .prepare(
        `SELECT ${SUMMARY_COLUMNS} FROM posts
          WHERE status = 'published'
          ORDER BY COALESCE(published_at, created_at) DESC
          LIMIT ?`,
      )
      .bind(limit)
      .all<PostRow>();

    return { posts: (results ?? []).map(toSummary), error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error.";
    logError("posts", message);
    return { posts: [], error: message };
  }
}

export async function getPosts(limit = 6): Promise<PostSummary[]> {
  const { posts } = await getPostsResult(limit);
  return posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const db = await getDb();
    const row = await db
      .prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published'")
      .bind(slug)
      .first<PostRow>();

    if (!row) return null;
    return toPost(row, await getTagsForPost(row.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error.";
    logError("post-by-slug", message);
    return null;
  }
}

/** Slug + last-modified pairs for the sitemap. */
export async function getPublishedSlugs(): Promise<
  Array<{ slug: string; updatedAt: string }>
> {
  try {
    const db = await getDb();
    const { results } = await db
      .prepare(
        `SELECT slug, updated_at FROM posts
          WHERE status = 'published' AND noindex = 0
          ORDER BY COALESCE(published_at, created_at) DESC`,
      )
      .all<{ slug: string; updated_at: string }>();

    return (results ?? []).map((row) => ({
      slug: row.slug,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    logError("slugs", error instanceof Error ? error.message : "Unknown error.");
    return [];
  }
}

// ── Admin reads (all statuses) ──────────────────────────────────────────────

export async function listAllPosts(): Promise<
  Array<PostSummary & { status: "draft" | "published"; seoScore: number; updatedAt: string }>
> {
  const db = await getDb();
  const { results } = await db
    .prepare(
      `SELECT ${SUMMARY_COLUMNS}, status, seo_score, updated_at FROM posts
        ORDER BY updated_at DESC`,
    )
    .all<PostRow>();

  return (results ?? []).map((row) => ({
    ...toSummary(row),
    status: row.status,
    seoScore: row.seo_score,
    updatedAt: row.updated_at,
  }));
}

export async function getPostById(id: string): Promise<Post | null> {
  const db = await getDb();
  const row = await db.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first<PostRow>();
  if (!row) return null;
  return toPost(row, await getTagsForPost(row.id));
}

async function getTagsForPost(postId: string): Promise<string[]> {
  const db = await getDb();
  const { results } = await db
    .prepare(
      `SELECT t.name FROM tags t
         JOIN post_tags pt ON pt.tag_id = t.id
        WHERE pt.post_id = ?
        ORDER BY t.name`,
    )
    .bind(postId)
    .all<{ name: string }>();

  return (results ?? []).map((row) => row.name);
}

// ── Writes ──────────────────────────────────────────────────────────────────

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
  authorName: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  seoScore: number;
  tags: string[];
};

/** ~225 wpm on the text content, floored at one minute. */
export function estimateReadingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}

/** Appends `-2`, `-3`, … until the slug is free. */
export async function ensureUniqueSlug(
  desired: string,
  excludePostId?: string,
): Promise<string> {
  const db = await getDb();
  const base = slugify(desired) || "post";
  let candidate = base;
  let suffix = 2;

  for (;;) {
    const row = await db
      .prepare("SELECT id FROM posts WHERE slug = ?")
      .bind(candidate)
      .first<{ id: string }>();

    if (!row || row.id === excludePostId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function syncTags(postId: string, tagNames: string[]): Promise<void> {
  const db = await getDb();
  await db.prepare("DELETE FROM post_tags WHERE post_id = ?").bind(postId).run();

  for (const name of tagNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;

    const slug = slugify(trimmed);
    if (!slug) continue;

    await db
      .prepare("INSERT OR IGNORE INTO tags (id, slug, name) VALUES (?, ?, ?)")
      .bind(newId("tag"), slug, trimmed)
      .run();

    const tag = await db
      .prepare("SELECT id FROM tags WHERE slug = ?")
      .bind(slug)
      .first<{ id: string }>();

    if (tag) {
      await db
        .prepare("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)")
        .bind(postId, tag.id)
        .run();
    }
  }
}

export async function createPost(
  input: PostInput,
  authorId: string,
): Promise<string> {
  const db = await getDb();
  const id = newId("post");
  const slug = await ensureUniqueSlug(input.slug || input.title);

  await db
    .prepare(
      `INSERT INTO posts (
         id, slug, title, excerpt, content, status, author_id, author_name,
         cover_image_url, cover_image_alt, meta_title, meta_description,
         focus_keyword, canonical_url, noindex, seo_score,
         reading_minutes, published_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      slug,
      input.title,
      input.excerpt,
      input.content,
      input.status,
      authorId,
      input.authorName,
      input.coverImageUrl,
      input.coverImageAlt,
      input.metaTitle,
      input.metaDescription,
      input.focusKeyword,
      input.canonicalUrl,
      input.noindex ? 1 : 0,
      input.seoScore,
      estimateReadingMinutes(input.content),
      input.status === "published" ? new Date().toISOString() : null,
    )
    .run();

  await syncTags(id, input.tags);
  return id;
}

export async function updatePost(id: string, input: PostInput): Promise<void> {
  const db = await getDb();
  const slug = await ensureUniqueSlug(input.slug || input.title, id);

  const existing = await db
    .prepare("SELECT published_at, slug, status FROM posts WHERE id = ?")
    .bind(id)
    .first<{ published_at: string | null; slug: string; status: string }>();

  // Renaming a published article would otherwise strand every existing link to
  // it — inbound links, search results, shares. Record the redirect first.
  if (existing && existing.slug !== slug && existing.status === "published") {
    await saveRedirect({
      sourcePath: `/blog/${existing.slug}`,
      targetPath: `/blog/${slug}`,
      statusCode: 301,
    });
  }

  // First publish stamps the date; re-publishing an already-published post
  // keeps the original so canonical dates don't drift on every edit.
  const publishedAt =
    input.status === "published"
      ? (existing?.published_at ?? new Date().toISOString())
      : existing?.published_at ?? null;

  await db
    .prepare(
      `UPDATE posts SET
         slug = ?, title = ?, excerpt = ?, content = ?, status = ?,
         author_name = ?, cover_image_url = ?, cover_image_alt = ?,
         meta_title = ?, meta_description = ?, focus_keyword = ?,
         canonical_url = ?, noindex = ?, seo_score = ?,
         reading_minutes = ?, published_at = ?, updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(
      slug,
      input.title,
      input.excerpt,
      input.content,
      input.status,
      input.authorName,
      input.coverImageUrl,
      input.coverImageAlt,
      input.metaTitle,
      input.metaDescription,
      input.focusKeyword,
      input.canonicalUrl,
      input.noindex ? 1 : 0,
      input.seoScore,
      estimateReadingMinutes(input.content),
      publishedAt,
      id,
    )
    .run();

  await syncTags(id, input.tags);
}

export async function deletePost(id: string): Promise<void> {
  const db = await getDb();
  await db.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
}

// ── Formatting ──────────────────────────────────────────────────────────────

export function formatPublishDate(date: string, locale = "en") {
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat(dateLocale, { dateStyle: "medium" }).format(parsed);
}
