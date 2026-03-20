import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getDictionary } from "@/i18n/get-dictionary";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.accessibility.metaTitle,
    description: dict.accessibility.metaDescription,
    alternates: { canonical: `/${locale}/accessibility` },
  };
}

export default async function AccessibilityPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.accessibility;
  const prefix = `/${locale}`;

  return (
    <>
      <Breadcrumbs items={[{ label: dict.nav.home, href: prefix }, { label: t.title }]} />

      <article className="section">
        <div className="container prose">
          <h1>{t.title}</h1>
          <p>{t.intro}</p>

          <h2>{t.effortsTitle}</h2>
          <ul>
            {t.efforts.map((effort, i) => (
              <li key={i}>{effort}</li>
            ))}
          </ul>

          <h2>{t.feedbackTitle}</h2>
          <p>
            {t.feedbackText.split("olgaanyutsa@gmail.com")[0]}
            <Link href={`${prefix}/contact`}>olgaanyutsa@gmail.com</Link>
            {t.feedbackText.split("olgaanyutsa@gmail.com")[1]}
          </p>
        </div>
      </article>
    </>
  );
}
