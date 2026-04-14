import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { DictionaryProvider } from "@/i18n/dictionary-provider";
import { getDictionary } from "@/i18n/get-dictionary";
import { i18n } from "@/i18n/config";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return {
    metadataBase: new URL("https://olgaemma.com"),
    title: {
      default: dict.meta.siteTitle,
      template: "%s | Olga Emma Elume",
    },
    description: dict.meta.siteDescription,
    keywords: [
      "Olga Emma Elume",
      "communications professional",
      "professional communications",
      "professional communications services",
      "strategic communications professional",
      "professional communications consultant",
      "communications professional development",
      "professional services communications",
      "marketing communications professional",
      "digital communications professional",
      "corporate communications professional",
      "professional communications training",
      "media communications professional",
      "professional writing and communications",
      "professional marketing communications",
      "effective professional communications",
      "business and professional communications",
      "professional communications skills",
      "communications professional certifications",
      "public relations professional communications",
      "professional healthcare communications",
      "professional communications agency",
      "certified communications professional",
      "professional graphic communications",
      "visual communications professional",
      "professional communications network",
      "communications professional resume",
      "strategic communications consultant Cameroon",
      "communications consultant Africa",
      "media relations specialist Cameroon",
      "PR consultant Cameroon",
      "content strategist Africa",
      "advocacy communications specialist",
      "crisis communications consultant",
      "campaign strategist Africa",
      "professional communications development",
      "communications professional organizations",
      "professional communications certification",
      "professional communications course",
      "communications professional jobs",
      "chargée de communication Cameroun",
      "consultante communications stratégiques Afrique",
      "communications professionnelles",
    ],
    authors: [{ name: "Olga Emma Elume", url: "https://olgaemma.com" }],
    creator: "Olga Emma Elume",
    publisher: "Olga Emma Elume",
    category: "Professional Portfolio",
    openGraph: {
      type: "website",
      locale: dict.locale,
      url: `https://olgaemma.com/${locale}`,
      siteName: "Olga Emma Elume",
      title: dict.meta.siteTitle,
      description: dict.meta.ogDescription,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Olga Emma Elume | Strategic Communications Professional",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.siteTitle,
      description: dict.meta.ogDescription,
      images: ["/og-image.jpg"],
      creator: "@mumolga",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `https://olgaemma.com/${locale}`,
      languages: {
        en: "https://olgaemma.com/en",
        fr: "https://olgaemma.com/fr",
      },
    },
    other: {
      "geo.region": "CM",
      "geo.placename": "Buea, Cameroon",
      "revisit-after": "7 days",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://olgaemma.com/#person",
    name: "Olga Emma Elume",
    url: "https://olgaemma.com",
    jobTitle: "Professional Communications Consultant",
    description:
      "Professional Communications Consultant with 6+ years of experience in strategic communications, media relations, advocacy, and professional communications services across Africa.",
    image: "https://olgaemma.com/og-image.jpg",
    sameAs: [
      "https://www.linkedin.com/in/olgaelume",
      "https://x.com/mumolga",
      "https://www.instagram.com/olgaelume",
      "https://www.facebook.com/share/1KZs6j1Db6/",
    ],
    knowsAbout: [
      "Professional Communications",
      "Strategic Communications",
      "Media Relations",
      "Content Strategy",
      "Crisis Communications",
      "Advocacy",
      "Digital Campaigns",
      "Public Relations",
      "Corporate Communications",
      "Professional Communications Services",
      "Marketing Communications",
      "Professional Communications Training",
      "Business and Professional Communications",
      "Professional Writing and Communications",
      "Visual Communications",
      "Healthcare Communications",
      "Professional Communications Development",
      "Brand Strategy",
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "CM",
      addressLocality: "Buea",
    },
    knowsLanguage: ["en", "fr"],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://olgaemma.com/#website",
    name: "Olga Emma Elume",
    url: "https://olgaemma.com",
    description:
      "Professional communications services by Olga Emma Elume — strategic communications professional based in Buea, Cameroon. Offering professional communications consulting across Africa.",
    publisher: { "@id": "https://olgaemma.com/#person" },
    inLanguage: locale,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <DictionaryProvider dictionary={dict}>
        <a href="#main-content" className="skip-link">
          {dict.skipToContent}
        </a>

        <Navigation />

        <main id="main-content" lang={locale}>
          {children}
        </main>

        <Footer />
      </DictionaryProvider>
    </>
  );
}
