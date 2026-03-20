import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  MegaphoneIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  SparklesIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

const serviceIcons = [
  MegaphoneIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  SparklesIcon,
];

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.services.metaTitle,
    description: dict.services.metaDescription,
    alternates: { canonical: `/${locale}/services` },
  };
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.services;
  const prefix = `/${locale}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    provider: { "@id": "https://olgaemma.com/#person" },
    name: "Strategic Communications Services",
    description:
      "Campaign strategy, media relations, content creation, crisis communications, advocacy, and brand consulting.",
    url: "https://olgaemma.com/services",
    areaServed: { "@type": "Place", name: "Africa" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Communications Services",
      itemListElement: t.items.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.title,
          description: s.desc,
        },
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Breadcrumbs items={[{ label: dict.nav.home, href: prefix }, { label: dict.nav.services }]} />

      <section className="section" aria-labelledby="services-heading">
        <div className="container">
          <header className="page-header">
            <div className="section-eyebrow" aria-hidden="true">{t.eyebrow}</div>
            <h1 id="services-heading">{t.title}</h1>
            <p className="section-subtitle">{t.subtitle}</p>
          </header>

          <div className="services-grid">
            {t.items.map((s, i) => {
              const Icon = serviceIcons[i];
              return (
                <div key={s.id} id={s.id} className="service-card">
                  <div className="service-icon">
                    <Icon width={22} height={22} aria-hidden="true" />
                  </div>
                  <h2>{s.title}</h2>
                  <p>{s.desc}</p>
                  <div className="service-features">
                    {s.features.map((f) => (
                      <div key={f} className="service-feature">
                        <CheckIcon
                          width={16}
                          height={16}
                          className="service-feature-check"
                          aria-hidden="true"
                        />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="container">
        <section className="cta-section" aria-labelledby="services-cta-heading">
          <div className="section-eyebrow" aria-hidden="true">{t.ctaEyebrow}</div>
          <h2 id="services-cta-heading" className="cta-title">
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
