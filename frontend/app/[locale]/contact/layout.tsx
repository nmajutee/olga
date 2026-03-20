import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";

type LayoutProps = {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.contact.metaTitle,
    description: dict.contact.metaDescription,
    alternates: { canonical: `/${locale}/contact` },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
