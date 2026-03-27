import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { PortfolioGrid } from "@/components/portfolio-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.portfolioPage.metaTitle,
    description: dict.portfolioPage.metaDescription,
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.portfolioPage;
  const items = dict.home.portfolioItems;

  return (
    <>
      <div className="container">
        <div className="page-header">
          <div className="section-eyebrow" aria-hidden="true">
            {t.eyebrow}
          </div>
          <h1>{t.title}</h1>
          <p className="section-subtitle">{t.subtitle}</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <PortfolioGrid
            items={items}
            labels={{
              modalActivity: t.modalActivity,
              modalRole: t.modalRole,
              modalImpact: t.modalImpact,
              closeModal: t.closeModal,
            }}
          />
        </div>
      </section>
    </>
  );
}
