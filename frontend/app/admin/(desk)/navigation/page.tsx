import { listNav } from "@/lib/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { NavEditor } from "@/components/admin/nav-editor";

export const dynamic = "force-dynamic";

const HEADER_FALLBACK = [
  { labelEn: "Home", labelFr: "Accueil", href: "/", visible: true },
  { labelEn: "About", labelFr: "À propos", href: "/about", visible: true },
  { labelEn: "Services", labelFr: "Services", href: "/services", visible: true },
  { labelEn: "Case studies", labelFr: "Études de cas", href: "/case-studies", visible: true },
  { labelEn: "Portfolio", labelFr: "Portfolio", href: "/portfolio", visible: true },
  { labelEn: "Blog", labelFr: "Blog", href: "/blog", visible: true },
  { labelEn: "Contact", labelFr: "Contact", href: "/contact", visible: true },
];

const FOOTER_FALLBACK = [
  { labelEn: "Privacy", labelFr: "Confidentialité", href: "/privacy", visible: true },
  { labelEn: "Accessibility", labelFr: "Accessibilité", href: "/accessibility", visible: true },
];

export default async function NavigationPage() {
  const [header, footer] = await Promise.all([listNav("header"), listNav("footer")]);

  return (
    <div className="admin-page">
      <PageHeader
        title="Navigation"
        description="The menus in the header and footer. Links starting with / are internal; the locale prefix is added automatically."
      />

      <div className="admin-grid">
        <div className="admin-col-half">
          <NavEditor
            location="header"
            title="Header menu"
            blurb="Shown in the top navigation, in this order."
            items={header.length ? header : HEADER_FALLBACK}
            isDefault={header.length === 0}
          />
        </div>

        <div className="admin-col-half">
          <NavEditor
            location="footer"
            title="Footer menu"
            blurb="Secondary links beneath the main footer columns."
            items={footer.length ? footer : FOOTER_FALLBACK}
            isDefault={footer.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
