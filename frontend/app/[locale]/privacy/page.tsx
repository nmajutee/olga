import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getDictionary } from "@/i18n/get-dictionary";
import { CONTACT_EMAIL } from "@/lib/contact";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.privacy.metaTitle,
    description: dict.privacy.metaDescription,
    alternates: { canonical: `/${locale}/privacy` },
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.privacy;
  const prefix = `/${locale}`;

  return (
    <>
      <Breadcrumbs items={[{ label: dict.nav.home, href: prefix }, { label: t.title }]} />

      <article className="section">
        <div className="container prose">
          <h1>{t.title}</h1>
          <p>
            <em>{t.lastUpdated}: January 2025</em>
          </p>

          {t.sections.map((section, i) => (
            <div key={i}>
              <h2>{`${i + 1}. ${section.heading}`}</h2>
              <p>
                {section.heading === "Contact" ? (
                  <>
                    {section.content.split(CONTACT_EMAIL)[0]}
                    <Link href={`${prefix}/contact`}>{CONTACT_EMAIL}</Link>
                    {section.content.split(CONTACT_EMAIL)[1]}
                  </>
                ) : (
                  section.content
                )}
              </p>
            </div>
          ))}
        </div>
      </article>
    </>
  );
}
