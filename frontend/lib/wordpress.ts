import { postToWordPress } from "@/lib/wordpress-request";

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

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type PostsQueryResult = {
  posts: {
    nodes: Array<{
      slug: string;
      title: string;
      excerpt: string;
      date: string;
      author?: {
        node?: {
          name: string;
        };
      };
    }>;
  };
};

type PostQueryResult = {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    author?: {
      node?: {
        name: string;
      };
    };
  } | null;
};

const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
const wordpressUrl =
  process.env.NEXT_PUBLIC_WORDPRESS_URL || "http://localhost:8080";
const wordpressHostHeader = process.env.WORDPRESS_HOST_HEADER;

function normalizePost(node: {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  content?: string;
  author?: {
    node?: {
      name: string;
    };
  };
}): WpPost {
  return {
    slug: node.slug,
    title: node.title,
    excerpt: node.excerpt,
    content: node.content ?? "",
    date: node.date,
    authorName: node.author?.node?.name ?? "Editorial team"
  };
}

async function fetchGraphQL<T>(query: string, variables?: Record<string, unknown>) {
  if (!endpoint) {
    return null;
  }

  const response = await postToWordPress({
    endpoint,
    hostHeader: wordpressHostHeader,
    body: JSON.stringify({ query, variables })
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`WordPress GraphQL request failed with ${response.status}`);
  }

  const json = JSON.parse(response.body) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new Error(json.errors.map((entry) => entry.message).join("; "));
  }

  return json.data ?? null;
}

export function getWordPressUrl() {
  return wordpressUrl;
}

export function getWordPressStatus() {
  return {
    configured: Boolean(endpoint),
    endpoint: endpoint ?? "Set WORDPRESS_GRAPHQL_ENDPOINT to enable live data",
    hostHeader: wordpressHostHeader ?? null
  };
}

export async function getPosts(limit = 6): Promise<WpPostSummary[]> {
  try {
    const data = await fetchGraphQL<PostsQueryResult>(
      `
        query GetPosts($limit: Int!) {
          posts(first: $limit) {
            nodes {
              slug
              title
              excerpt
              date
              author {
                node {
                  name
                }
              }
            }
          }
        }
      `,
      { limit }
    );

    if (!data) {
      return [];
    }

    return data.posts.nodes.map((node) => normalizePost(node));
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<WpPost | null> {
  try {
    const data = await fetchGraphQL<PostQueryResult>(
      `
        query GetPostBySlug($slug: ID!) {
          post(id: $slug, idType: SLUG) {
            slug
            title
            excerpt
            content
            date
            author {
              node {
                name
              }
            }
          }
        }
      `,
      { slug }
    );

    if (!data?.post) {
      return null;
    }

    return normalizePost(data.post);
  } catch {
    return null;
  }
}

export function formatPublishDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(new Date(date));
}