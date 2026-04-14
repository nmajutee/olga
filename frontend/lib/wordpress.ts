import {
  fetchWordPress,
  inspectWordPressResponse,
} from "@/lib/wordpress-request";

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

export type WpPostsResult = {
  posts: WpPostSummary[];
  error: string | null;
  blocked: boolean;
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

function logWordPressError(scope: string, message: string) {
  console.error(`[wordpress:${scope}] ${message}`);
}

export async function getPostsResult(limit = 6): Promise<WpPostsResult> {
  if (!wpUrl) {
    return {
      posts: [],
      error: "WORDPRESS_API_URL is not set.",
      blocked: false,
    };
  }

  try {
    const res = await fetchWordPress({
      url: restUrl(`/posts?per_page=${limit}&_embed=author`),
    });

    const responseIssue = inspectWordPressResponse(res);
    if (responseIssue) {
      logWordPressError("posts", responseIssue.message);
      return {
        posts: [],
        error: responseIssue.message,
        blocked: responseIssue.blocked,
      };
    }

    const posts = JSON.parse(res.body) as WpRestPost[];
    return {
      posts: posts.map(normalizePost),
      error: null,
      blocked: false,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown WordPress connection error.";
    logWordPressError("posts", message);
    return {
      posts: [],
      error: message,
      blocked: false,
    };
  }
}

export async function getPosts(limit = 6): Promise<WpPostSummary[]> {
  const { posts } = await getPostsResult(limit);
  return posts;
}

export async function getPostBySlug(slug: string): Promise<WpPost | null> {
  if (!wpUrl) return null;

  try {
    const res = await fetchWordPress({
      url: restUrl(`/posts?slug=${encodeURIComponent(slug)}&_embed=author`),
    });

    const responseIssue = inspectWordPressResponse(res);
    if (responseIssue) {
      logWordPressError("post-by-slug", responseIssue.message);
      return null;
    }

    const posts = JSON.parse(res.body) as WpRestPost[];
    if (!posts.length) return null;

    return normalizePost(posts[0]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown WordPress connection error.";
    logWordPressError("post-by-slug", message);
    return null;
  }
}

export function formatPublishDate(date: string, locale = "en") {
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";

  return new Intl.DateTimeFormat(dateLocale, {
    dateStyle: "medium",
  }).format(new Date(date));
}
