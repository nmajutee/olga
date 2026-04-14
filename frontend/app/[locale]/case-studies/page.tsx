import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getDictionary } from "@/i18n/get-dictionary";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.caseStudiesPage.metaTitle,
    description: dict.caseStudiesPage.metaDescription,
    alternates: { canonical: `/${locale}/case-studies` },
  };
}

export default async function CaseStudiesPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.caseStudiesPage;
  const prefix = `/${locale}`;
  const tagClasses = ["tag-rose", "tag-sage", "tag-rose", "tag-sage"];
  const caseStudiesUrl = `https://olgaemma.com/${locale}/case-studies`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t.metaTitle,
    description: t.metaDescription,
    url: caseStudiesUrl,
    isPartOf: { "@id": "https://olgaemma.com/#website" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: t.items.map((cs, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${caseStudiesUrl}/${cs.slug}`,
        name: cs.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ label: dict.nav.home, href: prefix }, { label: dict.nav.caseStudies }]} />

      <section className="section" aria-labelledby="cs-heading">
        <div className="container">
          <header className="page-header">
            <div className="section-eyebrow" aria-hidden="true">{t.eyebrow}</div>
            <h1 id="cs-heading">{t.title}</h1>
            <p className="section-subtitle">{t.subtitle}</p>
          </header>

          <div className="case-study-grid">
            {t.items.map((cs, i) => (
              <Link
                key={cs.slug}
                href={`${prefix}/case-studies/${cs.slug}`}
                className="case-study-card"
                aria-label={cs.title}
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
                  <h2>{cs.title}</h2>
                  <p style={{ fontWeight: 500, color: "var(--color-charcoal)", marginBottom: "0.5rem" }}>
                    {cs.subtitle}
                  </p>
                  <p>{cs.desc}</p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                    {cs.metrics.map((m) => (
                      <span key={m} className="tag tag-outline">{m}</span>
                    ))}
                  </div>
                  <span className="case-study-link">
                    {t.viewDetails} <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <section className="cta-section" aria-labelledby="cs-cta-heading">
          <h2 id="cs-cta-heading" className="cta-title">
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
