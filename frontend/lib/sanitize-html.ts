/**
 * Allowlist sanitizer for editor and AI-generated HTML.
 *
 * Content here is authored by an authenticated admin, so this is defence in
 * depth rather than the only line of defence — but AI output and pasted-in
 * markup both reach `dangerouslySetInnerHTML`, so it is stripped on the way
 * into the database. Anything not explicitly allowed is dropped.
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "strong", "em", "b", "i", "u", "s", "code", "pre",
  "blockquote", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td", "span", "div",
]);

/** Tags whose *contents* are discarded along with the tag itself. */
const VOID_CONTENT_TAGS = new Set([
  "script", "style", "iframe", "object", "embed", "noscript", "template",
]);

const SELF_CLOSING = new Set(["br", "hr", "img"]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading"]),
  th: new Set(["colspan", "rowspan", "scope"]),
  td: new Set(["colspan", "rowspan"]),
  "*": new Set(["class", "id"]),
};

const SAFE_URL = /^(?:https?:\/\/|\/|#|mailto:|tel:|data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,)/i;

/**
 * Escapes text, leaving already-valid entities alone. Blindly escaping `&`
 * would turn the editor's `&amp;` into `&amp;amp;` on every save, compounding
 * each time the post is edited.
 */
function escapeText(value: string): string {
  return value
    .replace(/&(?!#[0-9]{1,7};|#[xX][0-9a-fA-F]{1,6};|[a-zA-Z][a-zA-Z0-9]{1,31};)/g, "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value: string): string {
  return escapeText(value).replaceAll('"', "&quot;");
}

function sanitizeAttributes(tag: string, raw: string): string {
  const allowed = ALLOWED_ATTRS[tag];
  const globals = ALLOWED_ATTRS["*"];
  const out: string[] = [];

  const attrPattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let match: RegExpExecArray | null;

  while ((match = attrPattern.exec(raw)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";

    // Event handlers and style are never allowed, whatever the tag.
    if (name.startsWith("on") || name === "style") continue;
    if (!allowed?.has(name) && !globals.has(name)) continue;

    if ((name === "href" || name === "src") && !SAFE_URL.test(value.trim())) continue;

    out.push(`${name}="${escapeAttr(value)}"`);
  }

  // Any link that opens a new tab gets the tab-nabbing guard.
  if (tag === "a" && out.some((attr) => attr.startsWith('target="_blank"'))) {
    if (!out.some((attr) => attr.startsWith("rel="))) {
      out.push('rel="noopener noreferrer"');
    }
  }

  return out.length ? ` ${out.join(" ")}` : "";
}

export function sanitizeHtml(input: string): string {
  if (!input) return "";

  let out = "";
  let cursor = 0;
  const openStack: string[] = [];

  while (cursor < input.length) {
    const lt = input.indexOf("<", cursor);

    if (lt === -1) {
      out += escapeText(input.slice(cursor));
      break;
    }

    out += escapeText(input.slice(cursor, lt));

    const gt = input.indexOf(">", lt);
    if (gt === -1) {
      // Unterminated tag: treat the remainder as text.
      out += escapeText(input.slice(lt));
      break;
    }

    const rawTag = input.slice(lt + 1, gt);
    cursor = gt + 1;

    // Comments and doctypes are dropped outright.
    if (rawTag.startsWith("!")) continue;

    const isClosing = rawTag.startsWith("/");
    const nameMatch = /^\/?([a-zA-Z][a-zA-Z0-9-]*)/.exec(rawTag);

    // Not a tag at all (`a < b`) — keep it as literal text.
    if (!nameMatch) {
      out += escapeText(input.slice(lt, gt + 1));
      continue;
    }

    const tag = nameMatch[1].toLowerCase();

    if (VOID_CONTENT_TAGS.has(tag)) {
      if (!isClosing) {
        const closeIndex = input.toLowerCase().indexOf(`</${tag}`, cursor);
        const afterClose = closeIndex === -1 ? -1 : input.indexOf(">", closeIndex);
        cursor = afterClose === -1 ? input.length : afterClose + 1;
      }
      continue;
    }

    if (!ALLOWED_TAGS.has(tag)) continue;

    if (isClosing) {
      const openIndex = openStack.lastIndexOf(tag);
      if (openIndex === -1) continue;
      openStack.splice(openIndex, 1);
      out += `</${tag}>`;
      continue;
    }

    const attrs = sanitizeAttributes(tag, rawTag.slice(nameMatch[0].length));

    if (SELF_CLOSING.has(tag)) {
      out += `<${tag}${attrs} />`;
    } else {
      openStack.push(tag);
      out += `<${tag}${attrs}>`;
    }
  }

  // Close anything the input left dangling, innermost first.
  while (openStack.length) {
    out += `</${openStack.pop()}>`;
  }

  return out;
}

/** Plain text from HTML — used for excerpts, meta descriptions and word counts. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
