import { fetchWordPress } from "@/lib/wordpress-request";

export type WpPostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  authorName: string;
};

export type WpPost = WpPostSummary & {
  content: string;
};

/** Shape returned by WP REST API /wp/v2/posts with _embed */
type WpRestPost = {
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  date: string;
  _embedded?: {
    author?: Array<{ name: string }>;
  };
};

const wpUrl = process.env.WORDPRESS_API_URL;

function restUrl(path: string) {
  return `${wpUrl}/wp-json/wp/v2${path}`;
}

function normalizePost(raw: WpRestPost): WpPost {
  return {
    slug: raw.slug,
    title: raw.title.rendered,
    excerpt: raw.excerpt.rendered,
    content: raw.content?.rendered ?? "",
    date: raw.date,
    authorName: raw._embedded?.author?.[0]?.name ?? "Editorial team",
  };
}

export function getWordPressUrl() {
  return wpUrl ?? "";
}

export function getWordPressStatus() {
  return {
    configured: Boolean(wpUrl),
    endpoint: wpUrl
      ? `${wpUrl}/wp-json/wp/v2`
      : "Set WORDPRESS_API_URL to enable live data",
  };
}

export async function getPosts(limit = 6): Promise<WpPostSummary[]> {
  if (!wpUrl) return [];

  try {
    const res = await fetchWordPress({
      url: restUrl(`/posts?per_page=${limit}&_embed=author`),
    });

    if (res.status < 200 || res.status >= 300) return [];

    const posts = JSON.parse(res.body) as WpRestPost[];
    return posts.map(normalizePost);
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<WpPost | null> {
  if (!wpUrl) return null;

  try {
    const res = await fetchWordPress({
      url: restUrl(`/posts?slug=${encodeURIComponent(slug)}&_embed=author`),
    });

    if (res.status < 200 || res.status >= 300) return null;

    const posts = JSON.parse(res.body) as WpRestPost[];
    if (!posts.length) return null;

    return normalizePost(posts[0]);
  } catch {
    return null;
  }
}

export function formatPublishDate(date: string, locale = "en") {
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";

  return new Intl.DateTimeFormat(dateLocale, {
    dateStyle: "medium",
  }).format(new Date(date));
}