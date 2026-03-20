const translationCache = new Map<string, string>();

/**
 * Translate text using Google Translate free endpoint.
 * Caches results in memory for the lifetime of the server process.
 */
async function translateChunk(
  text: string,
  targetLang: string
): Promise<string> {
  if (!text.trim()) return text;

  const cacheKey = `${targetLang}:${text.length}:${text.slice(0, 80)}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });

    if (!res.ok) return text;

    const data = await res.json();
    const translated = (data[0] as Array<[string]>)
      .map((segment) => segment[0])
      .join("");

    translationCache.set(cacheKey, translated);
    return translated;
  } catch {
    return text; // Fallback to original on error
  }
}

/**
 * Translate HTML content by splitting into text/tag parts,
 * translating only the text nodes, and reassembling.
 */
export async function translateHtml(
  html: string,
  targetLang: string
): Promise<string> {
  if (targetLang === "en") return html;

  // Split into HTML tags and text segments
  const parts = html.split(/(<[^>]+>)/);
  const textIndices: number[] = [];
  const textsToTranslate: string[] = [];

  parts.forEach((part, i) => {
    if (!part.startsWith("<") && part.trim()) {
      textIndices.push(i);
      textsToTranslate.push(part);
    }
  });

  if (textsToTranslate.length === 0) return html;

  // Batch translate all text chunks joined by a separator
  const separator = " ||| ";
  const joined = textsToTranslate.join(separator);

  // Split into chunks of ~4000 chars to avoid URL limits
  const maxChunkLength = 4000;
  if (joined.length <= maxChunkLength) {
    const translated = await translateChunk(joined, targetLang);
    const translatedParts = translated.split(separator.trim());

    textIndices.forEach((idx, i) => {
      if (translatedParts[i]) {
        parts[idx] = translatedParts[i].trim();
      }
    });
  } else {
    // Translate individually for very long content
    for (let i = 0; i < textsToTranslate.length; i++) {
      parts[textIndices[i]] = await translateChunk(
        textsToTranslate[i],
        targetLang
      );
    }
  }

  return parts.join("");
}

/**
 * Translate a plain text string (no HTML).
 */
export async function translateText(
  text: string,
  targetLang: string
): Promise<string> {
  if (targetLang === "en" || !text.trim()) return text;
  return translateChunk(text, targetLang);
}
