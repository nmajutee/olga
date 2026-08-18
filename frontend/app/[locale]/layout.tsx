import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ViewBeacon } from "@/components/view-beacon";
import { DictionaryProvider } from "@/i18n/dictionary-provider";
import { getDictionary } from "@/i18n/get-dictionary";
import { i18n } from "@/i18n/config";
import { getSettings, brandStyleTag } from "@/lib/settings";
import { listNav } from "@/lib/navigation";
import { getAuthorProfile } from "@/lib/profile";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

/**
 * The shell reads settings and menus from D1 on every request. Without this,
 * Next would statically generate these pages at build time — when D1 is
 * unreachable — and bake the fallback colours and menu into the HTML, so
 * nothing changed in Appearance or Navigation would ever reach the site.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [dict, settings] = await Promise.all([getDictionary(locale), getSettings()]);

  // The share image and handle are editable in SEO settings; both were
  // hardcoded here, so those controls did nothing.
  const shareImage = settings.seo_default_og_image || "/og-image.jpg";
  const twitterHandle = settings.seo_twitter_handle || "@mumolga";

  return {
    metadataBase: new URL(settings.site_url || "https://olgaemma.com"),
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
          url: shareImage,
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
      images: [shareImage],
      creator: twitterHandle,
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
  const [dict, settings, headerNav, footerNav, author] = await Promise.all([
    getDictionary(locale),
    getSettings(),
    listNav("header"),
    listNav("footer"),
    getAuthorProfile(),
  ]);

  const brandCss = brandStyleTag(settings);

  // Menus fall back to the dictionary until someone edits them in Navigation.
  const navLinks = headerNav.length
    ? headerNav
        .filter((item) => item.visible)
        .map((item) => ({
          href: item.href,
          label: locale === "fr" && item.labelFr ? item.labelFr : item.labelEn,
        }))
    : [
        { href: "/", label: dict.nav.home },
        { href: "/about", label: dict.nav.about },
        { href: "/portfolio", label: dict.nav.portfolio },
        { href: "/services", label: dict.nav.services },
        { href: "/blog", label: dict.nav.blog },
      ];

  const footerLinks = footerNav
    .filter((item) => item.visible)
    .map((item) => ({
      href: item.href,
      label: locale === "fr" && item.labelFr ? item.labelFr : item.labelEn,
    }));

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://olgaemma.com/#person",
    name: author?.name ?? settings.site_title,
    url: settings.site_url,
    jobTitle: author?.title || "Professional Communications Consultant",
    description:
      "Professional Communications Consultant with 6+ years of experience in strategic communications, media relations, advocacy, and professional communications services across Africa.",
    image: author?.avatarUrl
      ? `${settings.site_url}${author.avatarUrl}`
      : `${settings.site_url}/og-image.jpg`,
    sameAs: [author?.linkedin, author?.socialX, author?.instagram, author?.website].filter(
      (link): link is string => Boolean(link && link.trim()),
    ),
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
    ...(author?.location
      ? { address: { "@type": "PostalAddress", addressLocality: author.location } }
      : {}),
    ...(author?.bio ? { description: author.bio } : {}),
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
      {brandCss && <style dangerouslySetInnerHTML={{ __html: brandCss }} />}

      {settings.seo_google_verification && (
        <meta name="google-site-verification" content={settings.seo_google_verification} />
      )}
      {settings.seo_bing_verification && (
        <meta name="msvalidate.01" content={settings.seo_bing_verification} />
      )}
      {settings.analytics_html && (
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: settings.analytics_html }}
        />
      )}

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

        <Navigation links={navLinks} brand={settings.logo_text || settings.site_title} logoUrl={settings.logo_url} />

        <main id="main-content" lang={locale}>
          {children}
        </main>

        <Footer links={footerLinks} note={settings.footer_note} settings={settings} />
        <ViewBeacon />
      </DictionaryProvider>
    </>
  );
}
