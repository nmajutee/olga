import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getDictionary } from "@/i18n/get-dictionary";

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const dict = await getDictionary(locale);
  const cs = dict.caseStudyDetail.data[slug as keyof typeof dict.caseStudyDetail.data];
  if (!cs) return { title: "Case Study Not Found" };

  return {
    title: `${cs.title} | Case Study`,
    description: cs.tldr,
    alternates: { canonical: `/${locale}/case-studies/${slug}` },
    openGraph: {
      title: `${cs.title} | Case Study | Olga Emma Elume`,
      description: cs.tldr,
      type: "article",
    },
  };
}

export function generateStaticParams() {
  return [
    { slug: "community-campaigns" },
    { slug: "digital-rights-research" },
    { slug: "brand-social-media" },
    { slug: "mental-health-comms" },
  ];
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const dict = await getDictionary(locale);
  const labels = dict.caseStudyDetail;
  const cs = labels.data[slug as keyof typeof labels.data];
  const prefix = `/${locale}`;

  if (!cs) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: cs.title,
    description: cs.tldr,
    url: `https://olgaemma.com/case-studies/${slug}`,
    author: {
      "@type": "Person",
      "@id": "https://olgaemma.com/#person",
      name: "Olga Emma Elume",
    },
    about: cs.tags.join(", "),
    isPartOf: { "@id": "https://olgaemma.com/#website" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs items={[{ label: dict.nav.home, href: prefix }, { label: dict.nav.caseStudies, href: `${prefix}/case-studies` }, { label: cs.title }]} />

      {/* ── Hero ── */}
      <section className="case-detail-hero" aria-labelledby="case-heading">
        <div className="container">
          <div className="case-study-tags" style={{ marginBottom: "1rem" }}>
            {cs.tags.map((t) => (
              <span key={t} className="tag tag-rose">{t}</span>
            ))}
          </div>
          <h1 id="case-heading" className="section-title" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            {cs.title}
          </h1>
          <p className="section-subtitle" style={{ maxWidth: "44rem" }}>
            {cs.subtitle}
          </p>

          <dl className="case-detail-meta">
            <div className="case-detail-meta-item">
              <dt>{labels.role}</dt>
              <dd>{cs.role}</dd>
            </div>
            <div className="case-detail-meta-item">
              <dt>{labels.timeline}</dt>
              <dd>{cs.timeline}</dd>
            </div>
            <div className="case-detail-meta-item">
              <dt>{labels.tools}</dt>
              <dd>{cs.tools.join(", ")}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── TL;DR ── */}
      <div className="container">
        <div
          style={{
            padding: "2rem",
            borderRadius: "var(--radius-xl)",
            background: "var(--color-blush-soft)",
            marginBottom: "2rem",
          }}
        >
          <strong style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-rose-deep)" }}>
            {labels.tldr}
          </strong>
          <p style={{ marginTop: "0.5rem", color: "var(--color-charcoal)", lineHeight: 1.7 }}>
            {cs.tldr}
          </p>
        </div>
      </div>

      {/* ── Challenge ── */}
      <div className="case-section">
        <div className="section-eyebrow" aria-hidden="true">{labels.challenge}</div>
        <h2>{labels.challenge}</h2>
        <p>{cs.challenge}</p>
      </div>

      {/* ── Approach ── */}
      <div className="case-section">
        <div className="section-eyebrow" aria-hidden="true">{labels.approach}</div>
        <h2>{labels.approach}</h2>
        <p>{cs.approach}</p>
      </div>

      {/* ── Deliverables ── */}
      <div className="case-section">
        <div className="section-eyebrow" aria-hidden="true">{labels.deliverables}</div>
        <h2>{labels.deliverables}</h2>
        <ul style={{ paddingLeft: "1.5rem", listStyle: "disc" }}>
          {cs.deliverables.map((d) => (
            <li key={d} style={{ marginBottom: "0.5rem", color: "var(--color-stone)", lineHeight: 1.7 }}>
              {d}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Results ── */}
      <section className="section" style={{ background: "var(--color-cream-dark)" }} aria-labelledby="results-heading">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className="section-eyebrow" style={{ justifyContent: "center" }} aria-hidden="true">
              {labels.results}
            </div>
            <h2 id="results-heading" className="section-title">{labels.results}</h2>
          </div>
          <div className="case-results-grid">
            {cs.results.map((r) => (
              <div key={r.label} className="case-result">
                <div className="case-result-value">{r.value}</div>
                <div className="case-result-label">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="container">
        <section className="cta-section" aria-labelledby="case-cta-heading">
          <h2 id="case-cta-heading" className="cta-title">
            {dict.caseStudiesPage.ctaTitle}
          </h2>
          <p className="cta-desc">{dict.caseStudiesPage.ctaDesc}</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`${prefix}/contact`} className="btn btn-white btn-lg">
              {dict.caseStudiesPage.ctaButton}
            </Link>
            <Link
              href={`${prefix}/case-studies`}
              className="btn btn-outline btn-lg"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "white" }}
            >
              {labels.backToAll}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
