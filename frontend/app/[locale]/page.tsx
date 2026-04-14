import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { StatsCounter } from "@/components/stats-counter";
import { HeroAccordion } from "@/components/hero-accordion";
import { formatPublishDate, getPostsResult } from "@/lib/wordpress";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  ChatBubbleLeftRightIcon,
  NewspaperIcon,
  PencilSquareIcon,
  DocumentMagnifyingGlassIcon,
  AcademicCapIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

const icons = [
  { icon: ChatBubbleLeftRightIcon, iconClass: "expertise-icon-rose" },
  { icon: NewspaperIcon, iconClass: "expertise-icon-sage" },
  { icon: PencilSquareIcon, iconClass: "expertise-icon-rose" },
  { icon: DocumentMagnifyingGlassIcon, iconClass: "expertise-icon-charcoal" },
  { icon: AcademicCapIcon, iconClass: "expertise-icon-sage" },
  { icon: MegaphoneIcon, iconClass: "expertise-icon-rose" },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.home;
  const { posts, error } = await getPostsResult(3);
  const prefix = `/${locale}`;

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-status">
                <span className="hero-status-dot" aria-hidden="true" />
                {t.heroStatus}
              </div>

              <p className="hero-greeting">{t.heroGreeting}</p>

              <h1 id="hero-heading" className="hero-title">
                {t.heroLine1}<br />
                {t.heroLine2}{" "}
                <span className="hero-title-accent">{t.heroLine3}</span>
              </h1>

              <p className="hero-desc">{t.heroDesc}</p>

              <div className="hero-actions">
                <Link href={`${prefix}/contact`} className="btn btn-hero-primary btn-lg">
                  {t.ctaStart}
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </Link>
                <Link href={`${prefix}/portfolio`} className="btn btn-hero-ghost btn-lg">
                  {t.ctaViewCases}
                </Link>
              </div>

              <div className="hero-trust">
                {t.heroTrust.map((item: { value: string; label: string }, i: number) => (
                  <div key={i} className="hero-trust-item">
                    <span className="hero-trust-value">{item.value}</span>
                    <span className="hero-trust-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-accordion-wrapper">
              <HeroAccordion />
            </div>
          </div>
        </div>
      </section>

      {/* ══ OUR STORY / MISSION / VISION ══ */}
      <section className="section" style={{ background: "var(--color-cream-dark)" }} aria-labelledby="mission-heading">
        <div className="container">
          <h2 id="mission-heading" className="section-title">
            {t.missionTitle}
          </h2>

          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-card-icon mission-icon-rose" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h1m8-9v1m8 8h1M5.6 5.6l.7.7m12.1-.7l-.7.7"/><path d="M9 16a5 5 0 1110 0v1H9v-1z"/><path d="M9 17h6v4H9z"/></svg>
              </div>
              <h3>{t.storyLabel}</h3>
              <p>{t.storyText}</p>
            </div>
            <div className="mission-card">
              <div className="mission-card-icon mission-icon-rose" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="11"/></svg>
              </div>
              <h3>{t.missionLabel}</h3>
              <p>{t.missionText}</p>
            </div>
            <div className="mission-card">
              <div className="mission-card-icon mission-icon-rose" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <h3>{t.visionLabel}</h3>
              <p>{t.visionText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ EXPERTISE (Services) ══ */}
      <section className="section" aria-labelledby="expertise-heading">
        <div className="container">
          <h2 id="expertise-heading" className="section-title">
            {t.expertiseTitle}
          </h2>
          <p className="section-subtitle">{t.expertiseSubtitle}</p>

          <div className="expertise-grid" style={{ marginTop: "3rem" }}>
            {t.expertiseItems.map((e, i) => {
              const Icon = icons[i].icon;
              return (
                <div key={e.title} className="expertise-card">
                  <div className={`expertise-icon ${icons[i].iconClass}`}>
                    <Icon width={20} height={20} aria-hidden="true" />
                  </div>
                  <h3>{e.title}</h3>
                  <p>{e.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ IMPACT STATISTICS ══ */}
      <section
        className="section stats-section"
        aria-labelledby="stats-heading"
      >
        <div className="container">
          <h2 id="stats-heading" className="section-title">
            {t.statsTitle}
          </h2>
          <p className="section-subtitle">{t.statsSubtitle}</p>

          <div style={{ marginTop: "3rem" }}>
            <StatsCounter stats={t.stats} />
          </div>
        </div>
      </section>

      {/* ══ PORTFOLIO ══ */}
      <section
        className="section"
        aria-labelledby="portfolio-heading"
      >
        <div className="container">
          <h2 id="portfolio-heading" className="section-title">
            {t.portfolioTitle}
          </h2>
          <p className="section-subtitle">{t.portfolioSubtitle}</p>

          <div style={{ marginTop: "3rem" }}>
            <PortfolioGrid
              items={t.portfolioItems}
              labels={{
                modalActivity: dict.portfolioPage.modalActivity,
                modalRole: dict.portfolioPage.modalRole,
                modalImpact: dict.portfolioPage.modalImpact,
                closeModal: dict.portfolioPage.closeModal,
              }}
            />
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href={`${prefix}/portfolio`} className="btn btn-outline">
              {t.portfolioViewAll}
            </Link>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section
        className="section"
        style={{ background: "var(--color-cream-dark)" }}
        aria-labelledby="testimonials-heading"
      >
        <div className="container">
          <div className="section-eyebrow" aria-hidden="true">{t.testimonialsEyebrow}</div>
          <h2 id="testimonials-heading" className="section-title">
            {t.testimonialsTitle}
          </h2>

          <div className="testimonial-grid">
            {t.testimonials.map((item) => (
              <div key={item.name} className="testimonial-card">
                <blockquote className="testimonial-quote">{item.quote}</blockquote>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" aria-hidden="true">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="testimonial-name">{item.name}</div>
                    <div className="testimonial-role">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BLOG PREVIEW ══ */}
      <section
        className="section blog-section"
        aria-labelledby="blog-heading"
      >
        <div className="container">
          <div className="blog-section-header">
            <div>
              <div className="section-eyebrow" aria-hidden="true">{t.blogEyebrow}</div>
              <h2 id="blog-heading" className="section-title">
                {t.blogTitle}
              </h2>
              <p className="section-subtitle">
                {dict.blog.subtitle}
              </p>
            </div>
            <Link href={`${prefix}/blog`} className="btn btn-outline">
              {t.blogViewAll}
            </Link>
          </div>

          {posts.length > 0 ? (
            <>
              <Link href={`${prefix}/blog/${posts[0].slug}`} className="blog-featured">
                <div className="blog-featured-visual">
                  <span className="blog-featured-visual-text" aria-hidden="true">✦</span>
                </div>
                <div className="blog-featured-body">
                  <span className="blog-featured-tag">{dict.blog.featuredLabel}</span>
                  <h3 className="blog-featured-title">{posts[0].title}</h3>
                  <p className="blog-featured-excerpt">
                    {posts[0].excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
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
                      {dict.blog.readMore} <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </Link>

              {posts.length > 1 && (
                <div className="post-grid">
                  {posts.slice(1).map((post) => (
                    <PostCard key={post.slug} post={post} locale={locale} readMoreLabel={dict.blog.readMore} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>{error ? dict.blog.unavailableMessage : dict.blog.noArticles}</p>
            </div>
          )}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <div className="container">
        <section className="cta-section" aria-labelledby="cta-heading">
          <div className="section-eyebrow" aria-hidden="true">{t.ctaEyebrow}</div>
          <h2 id="cta-heading" className="cta-title">
            {t.ctaTitle}
          </h2>
          <p className="cta-desc">{t.ctaDesc}</p>
          <Link href={`${prefix}/contact`} className="btn btn-white btn-lg">
            {t.ctaButton}
          </Link>
        </section>
      </div>
    </>
  );
}
