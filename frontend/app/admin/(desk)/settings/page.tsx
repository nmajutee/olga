import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsShell, type SettingGroup } from "@/components/admin/settings-shell";

export const dynamic = "force-dynamic";

const GROUPS: SettingGroup[] = [
  {
    title: "Site identity",
    blurb: "Used in page titles, the footer and structured data.",
    fields: [
      { key: "site_title", label: "Site title" },
      { key: "site_tagline", label: "Tagline" },
      { key: "site_url", label: "Canonical URL", type: "url", hint: "No trailing slash." },
      { key: "default_author", label: "Default author byline" },
    ],
  },
  {
    title: "Contact and social",
    blurb: "Where enquiries go, and which profiles the footer links to.",
    fields: [
      { key: "contact_email", label: "Contact email", type: "email" },
      { key: "social_linkedin", label: "LinkedIn URL", type: "url" },
      { key: "social_x", label: "X URL", type: "url" },
      { key: "social_instagram", label: "Instagram URL", type: "url" },
    ],
  },
  {
    title: "Reading",
    blurb: "How the blog behaves.",
    fields: [{ key: "posts_per_page", label: "Articles per page", type: "number" }],
  },
  {
    title: "Drafting defaults",
    blurb: "Pre-filled on every commissioning brief.",
    fields: [
      { key: "ai_default_tone", label: "House voice", type: "textarea" },
      { key: "ai_default_words", label: "Default length in words", type: "number" },
    ],
  },
];

export default async function SettingsPage() {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);

  return (
    <div className="admin-page">
      <PageHeader title="Settings" description="Identity, contact details and editorial defaults." />

      <div className="admin-grid">
        <div className="admin-col-main">
          <SettingsShell groups={GROUPS} settings={settings} />
        </div>

        <div className="admin-col-aside admin-stack">
          <section className="admin-card admin-card-pad">
            <h2 className="admin-h2">Secrets</h2>
            <p className="admin-meta mt-1.5">
              API keys are never stored in the database. Set them on the Worker:
            </p>
            {/* Wrap rather than scroll: a horizontal scrollbar inside a
                narrow aside hides half the command. */}
            <pre
              className="admin-mono mt-3 whitespace-pre-wrap break-all rounded-lg p-3"
              style={{ background: "var(--sunken)", color: "var(--ink-2)", lineHeight: 1.7 }}
            >
{`npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put RESEND_API_KEY`}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
