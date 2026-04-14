import Link from "next/link";
import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatPublishDate, getPosts } from "@/lib/wordpress";
import { getDictionary } from "@/i18n/get-dictionary";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.blog.metaTitle,
    description: dict.blog.metaDescription,
    alternates: { canonical: `/${locale}/blog` },
  };
}

export default async function BlogIndexPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.blog;
  const prefix = `/${locale}`;
  const blogUrl = `https://olgaemma.com/${locale}/blog`;
  const posts = await getPosts(12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t.metaTitle,
    description: t.metaDescription,
    url: blogUrl,
    isPartOf: { "@id": "https://olgaemma.com/#website" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${blogUrl}/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ label: dict.nav.home, href: prefix }, { label: dict.nav.blog }]} />

      {/* Page Header */}
      <section className="blog-page-header">
        <div className="container">
          <div className="blog-page-header-text">
            <span className="section-eyebrow">{t.eyebrow}</span>
            <h1 className="section-title">{t.title}</h1>
            <p className="section-subtitle">{t.subtitle}</p>
          </div>
          {posts.length > 0 && (
            <div className="blog-page-count">
              {posts.length} {t.articlesCount}
            </div>
          )}
        </div>
      </section>

      {/* Posts */}
      <section className="section">
        <div className="container">
          {posts.length > 0 ? (
            <>
              <Link href={`${prefix}/blog/${posts[0].slug}`} className="blog-featured">
                <div className="blog-featured-visual">
                  <span className="blog-featured-visual-text" aria-hidden="true">✦</span>
                </div>
                <div className="blog-featured-body">
                  <span className="blog-featured-tag">{t.featuredLabel}</span>
                  <h2 className="blog-featured-title">{posts[0].title}</h2>
                  <p className="blog-featured-excerpt">
                    {posts[0].excerpt
                      .replace(/<[^>]*>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()}
                  </p>
                  <div className="blog-featured-footer">
                    <div className="blog-featured-meta">
                      <div className="blog-featured-avatar" aria-hidden="true">
                        {posts[0].authorName.charAt(0)}
                      </div>
                      <div className="blog-featured-meta-text">
                        <strong>{posts[0].authorName}</strong>
                        <br />
                        {formatPublishDate(posts[0].date, locale)}
                      </div>
                    </div>
                    <span className="blog-featured-read">
                      {t.readMore}
                    </span>
                  </div>
                </div>
              </Link>

              {posts.length > 1 && (
                <div className="post-grid">
                  {posts.slice(1).map((post) => (
                    <PostCard key={post.slug} post={post} locale={locale} readMoreLabel={t.readMore} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>{t.noArticles}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <div className="container">
        <section className="cta-section">
          <h2 className="cta-title">
            {dict.home.ctaTitle}
          </h2>
          <p className="cta-desc">{dict.home.ctaDesc}</p>
          <Link href={`${prefix}/contact`} className="btn btn-white btn-lg">
            {dict.home.ctaButton}
          </Link>
        </section>
      </div>
    </>
  );
}