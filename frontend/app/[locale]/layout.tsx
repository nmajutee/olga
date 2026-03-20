import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { DictionaryProvider } from "@/i18n/dictionary-provider";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { i18n } from "@/i18n/config";

const display = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

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
      "strategic communications consultant Cameroon",
      "communications consultant Africa",
      "media relations specialist Cameroon",
      "PR consultant Cameroon",
      "content strategist Africa",
      "advocacy communications specialist",
      "crisis communications consultant",
      "campaign strategist Africa",
      "communications consultant hire Africa",
      "public relations professional Cameroon",
      "nonprofit communications consultant",
      "digital marketing specialist Cameroon",
      "brand strategy consultant Africa",
      "chargée de communication Cameroun",
      "consultante communications stratégiques Afrique",
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
    jobTitle: "Strategic Communications Consultant",
    description:
      "Strategic Communications Consultant with 6+ years of experience driving impactful campaigns, media relations, and advocacy across Africa.",
    image: "https://olgaemma.com/og-image.jpg",
    sameAs: [
      "https://www.linkedin.com/in/olgaelume",
      "https://x.com/mumolga",
      "https://www.instagram.com/olgaelume",
      "https://www.facebook.com/share/1KZs6j1Db6/",
    ],
    knowsAbout: [
      "Strategic Communications",
      "Media Relations",
      "Content Strategy",
      "Crisis Communications",
      "Advocacy",
      "Digital Campaigns",
      "Public Relations",
      "Corporate Communications",
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
      "Portfolio and blog of Olga Emma Elume, Strategic Communications Professional based in Buea, Cameroon.",
    publisher: { "@id": "https://olgaemma.com/#person" },
    inLanguage: locale,
  };

  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <DictionaryProvider dictionary={dict}>
          <a href="#main-content" className="skip-link">
            {dict.skipToContent}
          </a>

          <Navigation />

          <main id="main-content">{children}</main>

          <Footer />
        </DictionaryProvider>
      </body>
    </html>
  );
}
