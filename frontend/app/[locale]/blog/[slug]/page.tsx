import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatPublishDate, getPostBySlug } from "@/lib/posts";
import { getDictionary } from "@/i18n/get-dictionary";
import { getAuthorProfile } from "@/lib/profile";
import { resolveRedirect } from "@/lib/redirects";
import { getSettings } from "@/lib/settings";
import { AuthorBox } from "@/components/author-box";
import { translateHtml, translateText } from "@/lib/translate";

type BlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  // Editor-authored SEO fields win; the excerpt is only the fallback.
  let description =
    post.metaDescription ??
    post.excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  let title = post.metaTitle ?? post.title;

  if (locale !== "en") {
    title = await translateText(title, locale);
    description = await translateText(description, locale);
  }

  // Sharing uses the cover image, then the site-wide fallback from SEO
  // settings. There is no separate per-article share image to keep in step.
  const settings = await getSettings();
  const socialImage = post.coverImageUrl || settings.seo_default_og_image || null;

  return {
    title,
    description,
    robots: post.noindex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: post.canonicalUrl ?? `/${locale}/blog/${slug}`,
    },
    openGraph: {
      title: `${title} | Olga Emma Elume`,
      description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updatedAt,
      authors: [post.authorName],
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale);
  const t = dict.blog;
  const prefix = `/${locale}`;
  const post = await getPostBySlug(slug);

  if (!post) {
    // A renamed article leaves a redirect behind; follow it rather than
    // serving a 404 to a link that used to work.
    const moved = await resolveRedirect(`/blog/${slug}`);
    if (moved) redirect(`/${locale}${moved.target}`);
    notFound();
  }

  // The live profile, so a renamed author or a new bio reaches old articles.
  const author = await getAuthorProfile(post.authorId);
  const authorName = author?.name ?? post.authorName;
  const authorInitial = authorName.charAt(0).toUpperCase();
  const postUrl = `https://olgaemma.com/${locale}/blog/${slug}`;
  const excerptText = post.excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);

  // Auto-translate content for non-English locales
  const postTitle = locale !== "en" ? await translateText(post.title, locale) : post.title;
  const postDescription = locale !== "en"
    ? await translateText(excerptText, locale)
    : excerptText;
  const postContent = locale !== "en"
    ? await translateHtml(post.content || post.excerpt, locale)
    : (post.content || post.excerpt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: postTitle,
    description: postDescription,
    url: postUrl,
    datePublished: post.date,
    dateModified: post.updatedAt,
    inLanguage: locale,
    wordCount: postContent.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length,
    ...(post.coverImageUrl ? { image: post.coverImageUrl } : {}),
    ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
    author: {
      "@type": "Person",
      "@id": "https://olgaemma.com/#person",
      name: authorName,
      ...(author?.avatarUrl ? { image: author.avatarUrl } : {}),
      ...(author?.title ? { jobTitle: author.title } : {}),
    },
    publisher: { "@id": "https://olgaemma.com/#person" },
    isPartOf: { "@id": "https://olgaemma.com/#website" },
    mainEntityOfPage: postUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ label: dict.nav.home, href: prefix }, { label: dict.nav.blog, href: `${prefix}/blog` }, { label: postTitle }]} />

      <article className="single-post">
        <div className="container">
          <header className="single-post-header">
            <div className="single-post-meta">
              <time dateTime={post.date}>{formatPublishDate(post.date, locale)}</time>
              {post.readingMinutes > 0 && (
                <>
                  <span aria-hidden="true"> · </span>
                  <span>{post.readingMinutes} min</span>
                </>
              )}
            </div>
            <h1>{postTitle}</h1>
            <div className="single-post-author">
              <div className="single-post-author-avatar" aria-hidden="true">
                {author?.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={author.avatarUrl} alt="" className="single-post-author-photo" />
                ) : (
                  authorInitial
                )}
              </div>
              <div>
                <div className="single-post-author-name">{authorName}</div>
                <div className="single-post-author-label">{author?.title || t.author}</div>
              </div>
            </div>
          </header>

          {post.coverImageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={post.coverImageUrl}
              alt={post.coverImageAlt ?? ""}
              className="single-post-cover"
            />
          )}

          <div className="single-post-content">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: postContent }}
            />
          </div>

          {author && <AuthorBox profile={author} label={t.author} />}

          <div className="single-post-footer">
            <Link href={`${prefix}/blog`} className="btn btn-outline">
              {t.backToBlog}
            </Link>
            <div className="single-post-share">
              <span>{t.shareArticle}:</span>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                className="single-post-share-link"
                aria-label="Share on LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`}
                className="single-post-share-link"
                aria-label="Share on X"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}