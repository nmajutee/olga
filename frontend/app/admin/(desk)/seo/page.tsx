import { getSettings } from "@/lib/settings";
import { listRedirects } from "@/lib/redirects";
import { auditInternalLinks } from "@/lib/link-audit";
import { LinkHealth } from "@/components/admin/link-health";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsShell, type SettingGroup } from "@/components/admin/settings-shell";

export const dynamic = "force-dynamic";

const GROUPS: SettingGroup[] = [
  {
    title: "Titles and descriptions",
    blurb: "Defaults for any page that does not set its own.",
    fields: [
      { key: "seo_title_template", label: "Title template", hint: "%s is replaced by the page title." },
      { key: "seo_og_default_title", label: "Fallback social title" },
      { key: "site_description", label: "Site description", type: "textarea", hint: "Used on the homepage and as the last-resort meta description." },
    ],
  },
  {
    title: "Social sharing",
    blurb: "What appears when a link to the site is pasted into a chat or feed.",
    fields: [
      { key: "seo_default_og_image", label: "Fallback share image", hint: "Used when an article has no cover image, and on pages that are not articles. 1200×630 works everywhere." },
      { key: "seo_twitter_handle", label: "X / Twitter handle", placeholder: "@handle" },
    ],
  },
  {
    title: "Indexing",
    blurb: "Control what search engines are allowed to do.",
    fields: [
      {
        key: "seo_robots_noindex",
        label: "Hide the entire site from search engines",
        type: "toggle",
        hint: "Use while the site is in progress. Remember to switch it off before launch — nothing will rank while it is on.",
      },
      { key: "seo_google_verification", label: "Google Search Console token", hint: "The content value of the google-site-verification meta tag." },
      { key: "seo_bing_verification", label: "Bing verification token" },
    ],
  },
  {
    title: "Analytics",
    blurb: "Injected into every public page.",
    fields: [
      {
        key: "analytics_html",
        label: "Tracking snippet",
        type: "textarea",
        hint: "Raw HTML. This runs in every visitor's browser — paste only code you trust.",
      },
    ],
  },
];

export default async function SeoPage() {
  const [settings, redirects, audit] = await Promise.all([
    getSettings(),
    listRedirects(),
    auditInternalLinks(),
  ]);

  return (
    <div className="admin-page">
      <PageHeader
        title="SEO & analytics"
        description="How the site presents itself to search engines and social platforms."
      />
      <div className="admin-stack">
        <SettingsShell groups={GROUPS} settings={settings} />
        <LinkHealth redirects={redirects} audit={audit} />
      </div>
    </div>
  );
}
