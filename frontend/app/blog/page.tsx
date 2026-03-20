import Link from "next/link";
import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatPublishDate, getPosts } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Communications Blog & Insights",
  description:
    "My thoughts on communication, media, and storytelling, shaped by real work in strategy and advocacy.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getPosts(12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Communications Blog & Insights",
    description:
      "Expert insights on strategic communications, media relations, PR strategy, and storytelling in Africa.",
    url: "https://olgaemma.com/blog",
    isPartOf: { "@id": "https://olgaemma.com/#website" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://olgaemma.com/blog/${post.slug}`,
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
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

      {/* Page Header */}
      <section className="blog-page-header">
        <div className="container">
          <div className="blog-page-header-text">
            <span className="section-eyebrow">Insights &amp; Perspectives</span>
            <h1 className="section-title">Blog</h1>
            <p className="section-subtitle">
              Thoughts on communication, media, and storytelling, from planning to execution.
            </p>
          </div>
          {posts.length > 0 && (
            <div className="blog-page-count">
              {posts.length} {posts.length === 1 ? "Article" : "Articles"} Published
            </div>
          )}
        </div>
      </section>

      {/* Posts */}
      <section className="section">
        <div className="container">
          {posts.length > 0 ? (
            <>
              {/* Featured Post */}
              <Link href={`/blog/${posts[0].slug}`} className="blog-featured">
                <div className="blog-featured-visual">
                  <span className="blog-featured-visual-text" aria-hidden="true">✦</span>
                </div>
                <div className="blog-featured-body">
                  <span className="blog-featured-tag">Featured</span>
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
                        {formatPublishDate(posts[0].date)}
                      </div>
                    </div>
                    <span className="blog-featured-read">
                      Read article <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </Link>

              {/* Remaining Posts Grid */}
              {posts.length > 1 && (
                <div className="post-grid">
                  {posts.slice(1).map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>No posts published yet. Check back soon for new articles.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <div className="container">
        <section className="cta-section">
          <div className="section-eyebrow" aria-hidden="true">
            Have a Story?
          </div>
          <h2 className="cta-title">
            Let&apos;s craft a compelling narrative that resonates.
          </h2>
          <p className="cta-desc">
            From strategic campaigns to thought leadership, I help organizations
            communicate with clarity, purpose, and impact.
          </p>
          <Link href="/contact" className="btn btn-white btn-lg">
            Get in Touch
          </Link>
        </section>
      </div>
    </>
  );
}