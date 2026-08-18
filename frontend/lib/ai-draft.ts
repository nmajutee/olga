import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { getEnv } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize-html";

export const DraftSchema = z.object({
  title: z.string().describe("Headline, 50-60 characters, leads with the focus keyword"),
  slug: z.string().describe("Lowercase hyphenated URL segment, 3-6 words"),
  metaTitle: z.string().describe("SEO title tag, at most 60 characters"),
  metaDescription: z
    .string()
    .describe("Meta description, 140-155 characters, contains the focus keyword, ends with a reason to click"),
  excerpt: z.string().describe("Two-sentence summary for listing cards"),
  focusKeyword: z.string().describe("The single phrase this article targets"),
  tags: z.array(z.string()).describe("3-6 topic tags"),
  contentHtml: z
    .string()
    .describe(
      "The article body as clean semantic HTML using only <p>, <h2>, <h3>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em> and <a href>. No <h1> — the page renders the title separately. No markdown, no wrapper div.",
    ),
});

export type Draft = z.infer<typeof DraftSchema>;

export type DraftRequest = {
  topic: string;
  focusKeyword: string;
  audience: string;
  tone: string;
  words: number;
  locale: string;
};

const SYSTEM_PROMPT = `You write long-form editorial articles for the personal site of Olga Emma Elume, a communications strategist working in digital rights advocacy, media literacy, and humanitarian communications across Africa.

House style:
- Concrete and specific. Name real mechanisms, real trade-offs, real constraints.
- No marketing filler, no "in today's fast-paced world", no "delve", no rhetorical questions as openers.
- Short paragraphs (2-4 sentences). Vary sentence length.
- First person only where it carries authority; otherwise write in the third person.
- British-influenced international English.

SEO requirements, applied without making the prose sound optimised:
- The focus keyword appears in the title, the first paragraph, at least one H2, and the meta description.
- Keyword density between 0.5% and 2%. Never repeat the keyword mechanically.
- Structure the body with H2 sections and H3 subsections where the material justifies them.
- Open with a paragraph that answers the reader's question directly, so the page can win a featured snippet.
- Include at least one bulleted or numbered list where it genuinely aids scanning.
- Where a claim would normally cite a source, phrase it so the editor can attach one, rather than inventing a statistic, date, organisation, or quotation. Never fabricate facts.`;

/**
 * Generates a draft. `onProgress` fires with the character count of each text
 * delta so the caller can flush bytes downstream and keep the connection warm
 * — a full article takes longer than an idle HTTP connection survives.
 */
export async function generateDraft(
  request: DraftRequest,
  onProgress?: (chars: number) => void,
): Promise<Draft> {
  const env = await getEnv();
  const apiKey = env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Run `npx wrangler secret put ANTHROPIC_API_KEY`.",
    );
  }

  const client = new Anthropic({ apiKey });

  const userPrompt = [
    `Topic: ${request.topic}`,
    request.focusKeyword ? `Focus keyword: ${request.focusKeyword}` : null,
    request.audience ? `Audience: ${request.audience}` : null,
    request.tone ? `Tone: ${request.tone}` : null,
    `Target length: about ${request.words} words.`,
    request.locale === "fr" ? "Write the article in French." : "Write the article in English.",
  ]
    .filter(Boolean)
    .join("\n");

  const stream = client.messages.stream({
    model: "claude-opus-5",
    max_tokens: 64000,
    system: SYSTEM_PROMPT,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: zodOutputFormat(DraftSchema),
    },
    messages: [{ role: "user", content: userPrompt }],
  });

  if (onProgress) {
    stream.on("text", (text) => onProgress(text.length));
  }

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new Error(
      `Claude declined this topic (${message.stop_details?.category ?? "unspecified"}).`,
    );
  }

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  let parsed: Draft;
  try {
    parsed = DraftSchema.parse(JSON.parse(text));
  } catch {
    throw new Error("Claude returned a draft that did not match the expected shape.");
  }

  return { ...parsed, contentHtml: sanitizeHtml(parsed.contentHtml) };
}
