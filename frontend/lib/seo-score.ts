import { htmlToText } from "@/lib/sanitize-html";

export type SeoCheckStatus = "good" | "warn" | "bad";

export type SeoCheck = {
  id: string;
  label: string;
  status: SeoCheckStatus;
  detail: string;
  weight: number;
};

export type SeoAnalysis = {
  score: number;
  grade: "Poor" | "Needs work" | "Good" | "Excellent";
  wordCount: number;
  keywordDensity: number;
  checks: SeoCheck[];
};

export type SeoInput = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  coverImageAlt: string;
};

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const META_MIN = 120;
const META_MAX = 158;
const WORDS_MIN = 600;

function includesKeyword(haystack: string, keyword: string): boolean {
  if (!keyword) return false;
  return haystack.toLowerCase().includes(keyword.toLowerCase());
}

function countOccurrences(text: string, keyword: string): number {
  if (!keyword.trim()) return 0;
  const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.toLowerCase().match(new RegExp(escaped.toLowerCase(), "g")) ?? []).length;
}

/**
 * Yoast-style content analysis. Deliberately opinionated: every check is
 * something that measurably affects how the post is indexed or clicked,
 * and each carries a weight so the headline score is not a flat average.
 */
export function analyzeSeo(input: SeoInput): SeoAnalysis {
  const text = htmlToText(input.content);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const keyword = input.focusKeyword.trim();
  const effectiveTitle = input.metaTitle.trim() || input.title.trim();

  const headings = [...input.content.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)].map(
    (match) => ({ level: Number(match[1]), text: htmlToText(match[2]) }),
  );
  const h2Count = headings.filter((h) => h.level === 2).length;

  const images = [...input.content.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const imagesMissingAlt = images.filter(
    (tag) => !/\balt\s*=\s*("[^"]+"|'[^']+')/i.test(tag),
  ).length;

  const links = [...input.content.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["']/gi)].map(
    (m) => m[1],
  );
  const internalLinks = links.filter((href) => href.startsWith("/")).length;
  const externalLinks = links.filter((href) => /^https?:\/\//i.test(href)).length;

  const occurrences = countOccurrences(text, keyword);
  const keywordDensity = wordCount ? (occurrences / wordCount) * 100 : 0;

  const firstParagraph = htmlToText(
    /<p[^>]*>([\s\S]*?)<\/p>/i.exec(input.content)?.[1] ?? text.slice(0, 400),
  );

  const checks: SeoCheck[] = [];

  const push = (
    id: string,
    label: string,
    status: SeoCheckStatus,
    detail: string,
    weight: number,
  ) => checks.push({ id, label, status, detail, weight });

  // ── Focus keyword ──
  if (!keyword) {
    push("keyword", "Focus keyword", "bad", "No focus keyword set.", 10);
  } else {
    push("keyword", "Focus keyword", "good", `Targeting “${keyword}”.`, 10);
  }

  push(
    "keyword-title",
    "Keyword in title",
    keyword ? (includesKeyword(effectiveTitle, keyword) ? "good" : "bad") : "warn",
    keyword
      ? includesKeyword(effectiveTitle, keyword)
        ? "The title contains the focus keyword."
        : "Add the focus keyword to the title, ideally near the start."
      : "Set a focus keyword first.",
    12,
  );

  push(
    "keyword-slug",
    "Keyword in URL",
    keyword ? (includesKeyword(input.slug, keyword.replace(/\s+/g, "-")) ? "good" : "warn") : "warn",
    keyword
      ? includesKeyword(input.slug, keyword.replace(/\s+/g, "-"))
        ? "The slug contains the focus keyword."
        : "Work the keyword into the slug and keep it short."
      : "Set a focus keyword first.",
    6,
  );

  push(
    "keyword-intro",
    "Keyword in opening",
    keyword ? (includesKeyword(firstParagraph, keyword) ? "good" : "warn") : "warn",
    keyword
      ? includesKeyword(firstParagraph, keyword)
        ? "The keyword appears in the first paragraph."
        : "Mention the keyword in the first paragraph so the topic is obvious."
      : "Set a focus keyword first.",
    8,
  );

  const densityStatus: SeoCheckStatus =
    !keyword || wordCount < 100
      ? "warn"
      : keywordDensity < 0.4
        ? "warn"
        : keywordDensity > 2.8
          ? "bad"
          : "good";
  push(
    "density",
    "Keyword density",
    densityStatus,
    keyword
      ? `${occurrences} occurrence${occurrences === 1 ? "" : "s"} — ${keywordDensity.toFixed(2)}% (aim for 0.5–2.5%).`
      : "Set a focus keyword first.",
    8,
  );

  // ── Titles and meta ──
  const titleLength = effectiveTitle.length;
  push(
    "title-length",
    "SEO title length",
    titleLength === 0
      ? "bad"
      : titleLength < TITLE_MIN || titleLength > TITLE_MAX
        ? "warn"
        : "good",
    `${titleLength} characters (aim for ${TITLE_MIN}–${TITLE_MAX}).`,
    10,
  );

  const metaLength = input.metaDescription.trim().length;
  push(
    "meta-description",
    "Meta description",
    metaLength === 0
      ? "bad"
      : metaLength < META_MIN || metaLength > META_MAX
        ? "warn"
        : "good",
    metaLength === 0
      ? "Missing — search engines will invent one from the page text."
      : `${metaLength} characters (aim for ${META_MIN}–${META_MAX}).`,
    12,
  );

  push(
    "keyword-meta",
    "Keyword in meta description",
    keyword ? (includesKeyword(input.metaDescription, keyword) ? "good" : "warn") : "warn",
    keyword
      ? includesKeyword(input.metaDescription, keyword)
        ? "The meta description contains the keyword."
        : "Include the keyword — it is bolded in search results."
      : "Set a focus keyword first.",
    6,
  );

  // ── Content body ──
  push(
    "length",
    "Content length",
    wordCount === 0 ? "bad" : wordCount < 300 ? "bad" : wordCount < WORDS_MIN ? "warn" : "good",
    `${wordCount} words (${WORDS_MIN}+ competes better for informational queries).`,
    12,
  );

  push(
    "headings",
    "Subheadings",
    h2Count === 0 ? "bad" : h2Count < 2 ? "warn" : "good",
    h2Count === 0
      ? "No H2 subheadings — long text without structure is hard to scan and to rank."
      : `${h2Count} H2 subheading${h2Count === 1 ? "" : "s"}.`,
    8,
  );

  push(
    "keyword-heading",
    "Keyword in a subheading",
    keyword
      ? headings.some((h) => includesKeyword(h.text, keyword))
        ? "good"
        : "warn"
      : "warn",
    keyword
      ? headings.some((h) => includesKeyword(h.text, keyword))
        ? "A subheading contains the keyword."
        : "Use the keyword in at least one H2."
      : "Set a focus keyword first.",
    5,
  );

  push(
    "images",
    "Image alt text",
    images.length === 0
      ? "warn"
      : imagesMissingAlt > 0
        ? "bad"
        : "good",
    images.length === 0
      ? "No images. One relevant image improves dwell time and gives you image search."
      : imagesMissingAlt > 0
        ? `${imagesMissingAlt} of ${images.length} images have no alt text.`
        : `All ${images.length} images have alt text.`,
    6,
  );

  push(
    "links",
    "Links",
    internalLinks === 0 && externalLinks === 0
      ? "bad"
      : internalLinks === 0
        ? "warn"
        : "good",
    `${internalLinks} internal, ${externalLinks} external. Internal links spread authority and keep readers on site.`,
    7,
  );

  push(
    "cover-alt",
    "Cover image alt text",
    input.coverImageAlt.trim() ? "good" : "warn",
    input.coverImageAlt.trim()
      ? "Cover image is described."
      : "Describe the cover image for screen readers and image search.",
    4,
  );

  push(
    "excerpt",
    "Excerpt",
    input.excerpt.trim().length >= 60 ? "good" : "warn",
    input.excerpt.trim().length >= 60
      ? "Excerpt is long enough to use on cards and previews."
      : "Write a 1–2 sentence excerpt for listing pages and social shares.",
    4,
  );

  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const earned = checks.reduce(
    (sum, check) =>
      sum + check.weight * (check.status === "good" ? 1 : check.status === "warn" ? 0.5 : 0),
    0,
  );
  const score = totalWeight ? Math.round((earned / totalWeight) * 100) : 0;

  return {
    score,
    grade: score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 45 ? "Needs work" : "Poor",
    wordCount,
    keywordDensity: Number(keywordDensity.toFixed(2)),
    checks,
  };
}
