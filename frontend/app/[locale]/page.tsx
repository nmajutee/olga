import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { formatPublishDate, getPosts } from "@/lib/wordpress";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  MegaphoneIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const icons = [
  { icon: MegaphoneIcon, iconClass: "expertise-icon-rose" },
  { icon: ChatBubbleLeftRightIcon, iconClass: "expertise-icon-sage" },
  { icon: PencilSquareIcon, iconClass: "expertise-icon-rose" },
  { icon: ShieldCheckIcon, iconClass: "expertise-icon-charcoal" },
  { icon: GlobeAltIcon, iconClass: "expertise-icon-sage" },
  { icon: SparklesIcon, iconClass: "expertise-icon-rose" },
];

const partners = [
  "Reach Out Cameroon",
  "Paradigm Initiative",
  "MTN Cameroon",
  "PsyEduc Global",
  "Rock Me Fabulous",
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.home;
  const posts = await getPosts(3);
  const prefix = `/${locale}`;

  const metrics = [
    { value: "6+", label: t.metricYears },
    { value: "30+", label: t.metricCampaigns },
    { value: "35%", label: t.metricEngagement },
    { value: "4", label: t.metricOrgs },
  ];

  const tagClasses = ["tag-rose", "tag-sage", "tag-rose", "tag-sage"];

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

              <h1 id="hero-heading" className="hero-title">
                {t.heroLine1}
                <br />
                <span className="hero-title-accent">{t.heroLine2}</span>
                <br />
                {t.heroLine3}
              </h1>

              <p className="hero-desc">{t.heroDesc}</p>

              <div className="hero-actions">
                <Link href={`${prefix}/contact`} className="btn btn-primary btn-lg">
                  {t.ctaStart}
                </Link>
                <Link href={`${prefix}/case-studies`} className="btn btn-outline btn-lg">
                  {t.ctaViewCases}
                </Link>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-portrait">
                <span className="hero-portrait-text" aria-hidden="true">OE</span>
              </div>
              <div className="hero-stat is-top">
                <span className="hero-stat-label">Experience</span>
                <span className="hero-stat-value">6+ Years</span>
              </div>
              <div className="hero-stat is-bottom">
                <span className="hero-stat-label">Campaigns</span>
                <span className="hero-stat-value">30+ Done</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PARTNER LOGOS ══ */}
      <section aria-label="Organizations I have worked with">
        <div className="container">
          <div className="logo-cloud">
            {partners.map((p) => (
              <span key={p} className="logo-cloud-item">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ METRICS ══ */}
      <section aria-label="Key achievements">
        <div className="container">
          <div className="metrics-bar">
            {metrics.map((m) => (
              <div key={m.label} className="metric">
                <div className="metric-value">{m.value}</div>
                <div className="metric-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EXPERTISE ══ */}
      <section className="section" aria-labelledby="expertise-heading">
        <div className="container">
          <div className="section-eyebrow" aria-hidden="true">{t.expertiseEyebrow}</div>
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

      {/* ══ FEATURED CASE STUDIES ══ */}
      <section
        className="section"
        style={{ background: "var(--color-cream-dark)" }}
        aria-labelledby="work-heading"
      >
        <div className="container">
          <div className="section-eyebrow" aria-hidden="true">{t.csEyebrow}</div>
          <h2 id="work-heading" className="section-title">
            {t.csTitle}
          </h2>
          <p className="section-subtitle">{t.csSubtitle}</p>

          <div className="case-study-grid" style={{ marginTop: "3rem" }}>
            {t.caseStudies.map((cs, i) => (
              <Link
                key={cs.slug}
                href={`${prefix}/case-studies/${cs.slug}`}
                className="case-study-card"
                aria-label={`${cs.title}`}
              >
                <div className="case-study-visual">
                  <span className="case-study-visual-text" aria-hidden="true">
                    {cs.visual}
                  </span>
                </div>
                <div className="case-study-body">
                  <div className="case-study-tags">
                    {cs.tags.map((tag) => (
                      <span key={tag} className={`tag ${tagClasses[i]}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3>{cs.title}</h3>
                  <p>{cs.desc}</p>
                  <span className="case-study-link">
                    {dict.caseStudiesPage.viewDetails} <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href={`${prefix}/case-studies`} className="btn btn-outline">
              {t.csViewAll}
            </Link>
          </div>
        </div>
      </section>

      {/* ══ PROCESS ══ */}
      <section className="section" aria-labelledby="process-heading">
        <div className="container">
          <div className="section-eyebrow" aria-hidden="true">{t.processEyebrow}</div>
          <h2 id="process-heading" className="section-title">
            {t.processTitle}
          </h2>
          <p className="section-subtitle">{t.processSubtitle}</p>

          <div className="process-grid">
            {t.processSteps.map((s) => (
              <div key={s.num} className="process-step">
                <div className="process-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="section" aria-labelledby="testimonials-heading">
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
        style={{ background: "var(--color-cream-dark)" }}
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
                        {formatPublishDate(posts[0].date)}
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
              <p>{dict.blog.noArticles}</p>
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
