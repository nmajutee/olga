import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/wordpress";
import { i18n } from "@/i18n/config";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olgaemma.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = i18n.locales;

  const staticPaths = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/services", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/case-studies", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/case-studies/reach-out-cameroon", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/case-studies/paradigm-initiative", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/case-studies/rock-me-fabulous", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/case-studies/psyeduc-global", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/blog", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/accessibility", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const staticPages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map((page) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );

  // Dynamic blog posts from WordPress
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPosts(50);
    blogPosts = locales.flatMap((locale) =>
      posts.map((post) => ({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    );
  } catch {
    // WordPress may be unavailable during build
  }

  return [...staticPages, ...blogPosts];
}
