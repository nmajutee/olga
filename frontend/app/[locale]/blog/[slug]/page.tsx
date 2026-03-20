import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatPublishDate, getPostBySlug } from "@/lib/wordpress";
import { getDictionary } from "@/i18n/get-dictionary";
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

  let description = post.excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  let title = post.title;
  if (locale !== "en") {
    title = await translateText(title, locale);
    description = await translateText(description, locale);
  }

  return {
    title,
    description,
    alternates: { canonical: `/${locale}/blog/${slug}` },
    openGraph: {
      title: `${title} | Olga Emma Elume`,
      description,
      type: "article",
      publishedTime: post.date,
      authors: [post.authorName],
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
    notFound();
  }

  const authorInitial = post.authorName.charAt(0).toUpperCase();

  // Auto-translate content for non-English locales
  const postTitle = locale !== "en" ? await translateText(post.title, locale) : post.title;
  const postContent = locale !== "en"
    ? await translateHtml(post.content || post.excerpt, locale)
    : (post.content || post.excerpt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: postTitle,
    description: post.excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160),
    url: `https://olgaemma.com/blog/${slug}`,
    datePublished: post.date,
    inLanguage: locale,
    author: {
      "@type": "Person",
      "@id": "https://olgaemma.com/#person",
      name: post.authorName,
    },
    publisher: { "@id": "https://olgaemma.com/#person" },
    isPartOf: { "@id": "https://olgaemma.com/#website" },
    mainEntityOfPage: `https://olgaemma.com/blog/${slug}`,
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
              <time dateTime={post.date}>{formatPublishDate(post.date)}</time>
            </div>
            <h1>{postTitle}</h1>
            <div className="single-post-author">
              <div className="single-post-author-avatar" aria-hidden="true">
                {authorInitial}
              </div>
              <div>
                <div className="single-post-author-name">{post.authorName}</div>
                <div className="single-post-author-label">{t.author}</div>
              </div>
            </div>
          </header>

          <div className="single-post-content">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: postContent }}
            />
          </div>

          <div className="single-post-footer">
            <Link href={`${prefix}/blog`} className="btn btn-outline">
              {t.backToBlog}
            </Link>
            <div className="single-post-share">
              <span>{t.shareArticle}:</span>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://olgaemma.com/blog/${slug}`)}`}
                className="single-post-share-link"
                aria-label="Share on LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://olgaemma.com/blog/${slug}`)}&text=${encodeURIComponent(postTitle)}`}
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