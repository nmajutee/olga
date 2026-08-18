import { getDb } from "@/lib/db";

export type SiteSettings = Record<string, string>;

export const SETTING_DEFAULTS: SiteSettings = {
  site_title: "Olga Emma Elume",
  site_tagline: "Professional Communications & Digital Rights",
  site_description: "",
  site_url: "https://olgaemma.com",
  default_author: "Olga Emma Elume",
  posts_per_page: "12",
  contact_email: "contact@olgaemma.com",
  social_linkedin: "",
  social_x: "",
  social_instagram: "",
  seo_title_template: "%s | Olga Emma Elume",
  seo_default_og_image: "",
  seo_twitter_handle: "",
  ai_default_tone: "",
  ai_default_words: "1200",
  analytics_html: "",

  // Appearance — injected as CSS custom properties on the public site.
  brand_primary: "#4A7FC1",
  brand_primary_deep: "#3A6FB5",
  brand_ink: "#2C3E50",
  brand_accent: "#1E3A5F",
  brand_surface: "#FFFFFF",
  logo_url: "",
  logo_text: "",

  // Homepage
  hero_eyebrow: "",
  hero_title: "",
  hero_subtitle: "",
  hero_image: "",
  hero_cta_label: "",
  hero_cta_href: "",
  footer_note: "",

  // Search engines
  seo_robots_noindex: "",
  seo_google_verification: "",
  seo_bing_verification: "",
  seo_og_default_title: "",
};

/** Settings whose value is a colour, used by the appearance editor. */
export const COLOUR_SETTINGS = [
  "brand_primary",
  "brand_primary_deep",
  "brand_ink",
  "brand_accent",
  "brand_surface",
] as const;

/**
 * Appearance settings become CSS custom properties on the public site, so a
 * colour change in the dashboard is live without a rebuild. Only a fixed list
 * of keys is emitted, and each value is validated as a hex colour — these end
 * up inside a <style> tag.
 */
export function brandStyleTag(settings: SiteSettings): string {
  const hex = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

  const mapping: Array<[string, string]> = [
    ["--color-rose", settings.brand_primary],
    ["--color-sage", settings.brand_primary],
    ["--color-rose-deep", settings.brand_primary_deep],
    ["--color-charcoal", settings.brand_ink],
    ["--color-midnight", settings.brand_accent],
    ["--color-cream", settings.brand_surface],
  ];

  const declarations = mapping
    .filter(([, value]) => value && hex.test(value))
    .map(([name, value]) => `${name}:${value}`)
    .join(";");

  return declarations ? `:root{${declarations}}` : "";
}

/** All settings, with defaults filled in for keys the database lacks. */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const db = await getDb();
    const { results } = await db
      .prepare("SELECT key, value FROM settings")
      .all<{ key: string; value: string }>();

    const stored = Object.fromEntries((results ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
    return { ...SETTING_DEFAULTS, ...stored };
  } catch (error) {
    console.error(
      `[settings] ${error instanceof Error ? error.message : "Unknown error."}`,
    );
    return { ...SETTING_DEFAULTS };
  }
}

export async function getSetting(key: string): Promise<string> {
  const settings = await getSettings();
  return settings[key] ?? "";
}

export async function updateSettings(values: SiteSettings): Promise<void> {
  const db = await getDb();

  const statements = Object.entries(values).map(([key, value]) =>
    db
      .prepare(
        `INSERT INTO settings (key, value, updated_at)
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value,
                                        updated_at = excluded.updated_at`,
      )
      .bind(key, value ?? ""),
  );

  if (statements.length) await db.batch(statements);
}
