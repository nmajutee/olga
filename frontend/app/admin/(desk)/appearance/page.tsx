import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsShell, type SettingGroup } from "@/components/admin/settings-shell";

export const dynamic = "force-dynamic";

const GROUPS: SettingGroup[] = [
  {
    title: "Brand colours",
    blurb:
      "These become CSS variables on the public site, so a change here is live without a rebuild. Hex values only.",
    fields: [
      { key: "brand_primary", label: "Primary", type: "color", hint: "Links, buttons, accents." },
      { key: "brand_primary_deep", label: "Primary (hover)", type: "color" },
      { key: "brand_ink", label: "Body text", type: "color" },
      { key: "brand_accent", label: "Deep accent", type: "color", hint: "Footers and dark sections." },
      { key: "brand_surface", label: "Page background", type: "color" },
    ],
  },
  {
    title: "Logo",
    blurb: "Shown in the header. Leave the image empty to use the wordmark.",
    fields: [
      { key: "logo_url", label: "Logo image", hint: "Path from Media, e.g. /media/2026/08/logo.svg" },
      { key: "logo_text", label: "Wordmark text", placeholder: "Olga Emma Elume" },
    ],
  },
  {
    title: "Homepage hero",
    blurb: "The first thing a visitor reads. Leave any field empty to keep the built-in copy.",
    fields: [
      { key: "hero_eyebrow", label: "Eyebrow", placeholder: "Communications strategist" },
      { key: "hero_cta_label", label: "Button label", placeholder: "Start a conversation" },
      { key: "hero_title", label: "Headline", type: "textarea" },
      { key: "hero_subtitle", label: "Supporting line", type: "textarea" },
      { key: "hero_image", label: "Hero image", hint: "Path from Media." },
      { key: "hero_cta_href", label: "Button link", placeholder: "/contact" },
    ],
  },
  {
    title: "Footer",
    blurb: "Shown beneath the navigation links.",
    fields: [{ key: "footer_note", label: "Footer note", type: "textarea" }],
  },
];

export default async function AppearancePage() {
  const settings = await getSettings();

  return (
    <div className="admin-page">
      <PageHeader
        title="Appearance"
        description="Colours, logo and the copy that opens the homepage."
      />
      <SettingsShell groups={GROUPS} settings={settings} />
    </div>
  );
}
