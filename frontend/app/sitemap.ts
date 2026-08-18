import type { MetadataRoute } from "next";
import { getPublishedSlugs } from "@/lib/posts";
import { i18n } from "@/i18n/config";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olgaemma.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = i18n.locales;

  const staticPaths = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/services", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/case-studies", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/case-studies/community-campaigns", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/case-studies/digital-rights-research", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/case-studies/brand-social-media", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/case-studies/mental-health-comms", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/portfolio", changeFrequency: "monthly" as const, priority: 0.8 },
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

  // Published articles, straight from D1
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedSlugs();
    blogPosts = locales.flatMap((locale) =>
      posts.map((post) => ({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    );
  } catch {
    // The database is not reachable during a static build; ship the static paths.
  }

  return [...staticPages, ...blogPosts];
}
