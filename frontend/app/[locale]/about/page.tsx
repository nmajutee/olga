import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getDictionary } from "@/i18n/get-dictionary";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.about.metaTitle,
    description: dict.about.metaDescription,
    alternates: { canonical: `/${locale}/about` },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.about;
  const prefix = `/${locale}`;
  const aboutUrl = `https://olgaemma.com/${locale}/about`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: aboutUrl,
    mainEntity: {
      "@type": "Person",
      "@id": "https://olgaemma.com/#person",
      name: "Olga Emma Elume",
      jobTitle: "Professional Communications Consultant",
      description:
        "Professional communications consultant with 6+ years of experience in strategic communications, media relations, advocacy, and content strategy across Africa.",
      url: aboutUrl,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Buea",
        addressCountry: "CM",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "University of Buea",
      },
      knowsAbout: t.competencies,
      sameAs: [
        "https://www.linkedin.com/in/olgaelume",
        "https://x.com/mumolga",
        "https://www.instagram.com/olgaelume",
        "https://www.facebook.com/share/1KZs6j1Db6/",
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ label: dict.nav.home, href: prefix }, { label: dict.nav.about }]} />

      {/* ── Intro ── */}
      <section className="section" aria-labelledby="about-heading">
        <div className="container">
          <div className="about-intro">
            <div className="about-portrait">
              <Image
                src="/images/about-portrait.jpg"
                alt="Olga Emma Elume"
                className="about-portrait-image"
                width={800}
                height={1000}
                sizes="(min-width: 1024px) 32rem, (min-width: 768px) 40vw, 100vw"
              />
            </div>

            <div className="about-text">
              <div className="section-eyebrow" aria-hidden="true">{t.eyebrow}</div>
              <h1 id="about-heading">{t.heading}</h1>
              <p>{t.bio1}</p>
              <p>{t.bio2}</p>
              <p>{t.bio3}</p>

              <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href={`${prefix}/contact`} className="btn btn-primary">
                  {t.ctaContact}
                </Link>
                <a
                  href="/olga-emma-elume-cv.pdf"
                  className="btn btn-outline"
                  download
                >
                  {t.ctaCV}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Competencies ── */}
      <section
        className="section"
        style={{ background: "var(--color-cream-dark)" }}
        aria-labelledby="competencies-heading"
      >
        <div className="container">
          <div className="section-eyebrow" aria-hidden="true">{t.compEyebrow}</div>
          <h2 id="competencies-heading" className="section-title">
            {t.compTitle}
          </h2>

          <div className="competencies-grid" style={{ marginTop: "2.5rem" }}>
            {t.competencies.map((c) => (
              <div key={c} className="competency">
                <span className="competency-dot" aria-hidden="true" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="section" aria-labelledby="process-heading">
        <div className="container">
          <div className="section-eyebrow" aria-hidden="true">{t.processEyebrow}</div>
          <h2 id="process-heading" className="section-title">
            {t.processTitle}
          </h2>

          <div className="process-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
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

      {/* ── Experience Timeline ── */}
      <section
        className="section"
        style={{ background: "var(--color-cream-dark)" }}
        aria-labelledby="timeline-heading"
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-eyebrow" style={{ justifyContent: "center" }} aria-hidden="true">
              {t.expEyebrow}
            </div>
            <h2 id="timeline-heading" className="section-title">
              {t.expTitle}
            </h2>
            <p className="section-subtitle" style={{ marginInline: "auto" }}>
              {t.expSubtitle}
            </p>
          </div>

          <div className="pro-timeline">
            <div className="pro-timeline-line" aria-hidden="true" />
            {t.experience.map((e, i) => (
              <article
                key={e.role + e.company}
                className={`pro-timeline-item ${i % 2 === 0 ? "pro-timeline-left" : "pro-timeline-right"}`}
              >
                <div className="pro-timeline-node" aria-hidden="true">
                  <span className="pro-timeline-node-dot" />
                  <span className="pro-timeline-node-ring" />
                </div>

                <div className="pro-timeline-content">
                  <div className="pro-timeline-header">
                    <div className="pro-timeline-meta">
                      <span className="pro-timeline-dates">{e.dates}</span>
                      {e.type && <span className="pro-timeline-type">{e.type}</span>}
                    </div>
                    <div className="pro-timeline-company">{e.company}</div>
                    <h3 className="pro-timeline-role">{e.role}</h3>
                    {e.location && (
                      <div className="pro-timeline-location">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {e.location}
                      </div>
                    )}
                  </div>

                  <p className="pro-timeline-summary">{e.summary}</p>

                  <ul className="pro-timeline-highlights">
                    {e.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Education ── */}
      <section className="section" aria-labelledby="education-heading">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-eyebrow" style={{ justifyContent: "center" }} aria-hidden="true">
              {t.eduEyebrow}
            </div>
            <h2 id="education-heading" className="section-title">
              {t.eduTitle}
            </h2>
          </div>

          <div className="timeline">
            {t.education.map((edu) => (
              <div key={edu.degree} className="timeline-item">
                <div className="timeline-role">{edu.degree}</div>
                <div className="timeline-org">
                  <span className="timeline-org-dot" aria-hidden="true" />
                  {edu.institution}
                </div>
                <div className="timeline-dates">{edu.dates}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="container">
        <section className="cta-section" aria-labelledby="about-cta-heading">
          <div className="section-eyebrow" aria-hidden="true">{t.valuesEyebrow}</div>
          <h2 id="about-cta-heading" className="cta-title">
            {t.valuesTitle}
          </h2>
          <p className="cta-desc">
            {t.values[0].desc}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`${prefix}/contact`} className="btn btn-white btn-lg">
              {t.ctaContact}
            </Link>
            <a
              href="/olga-emma-elume-cv.pdf"
              className="btn btn-outline btn-lg"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "white" }}
              download
            >
              {t.ctaCV}
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
