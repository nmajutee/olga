import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { listItems } from "@/lib/collections";

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
    alternates: { canonical: `/${locale}/portfolio` },
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

  // Dashboard-managed pieces take over as soon as any exist; until then the
  // translated defaults stay, so the page is never empty mid-migration.
  const managed = await listItems("portfolio", { publishedOnly: true });
  const items = managed.length
    ? managed.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.extra.category || "Work",
        image: item.imageUrl ?? "",
        activity: item.summary,
        role: item.extra.role || item.extra.location || "",
        impact: item.extra.year || "",
      }))
    : dict.home.portfolioItems;

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

      <section className="section reveal" style={{ paddingTop: 0 }}>
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
