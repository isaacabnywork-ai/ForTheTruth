/**
 * Decodes numeric (decimal & hex) and named HTML entities into clean Unicode characters.
 * Handles double-encoded entities (e.g. &amp;#8217; -> ’).
 */
export function decodeHtmlEntities(raw: string): string {
  if (!raw) return "";

  let text = raw;

  for (let pass = 0; pass < 2; pass++) {
    if (!text.includes("&")) break;

    // Unescape &amp; first to resolve double-encoded entities
    text = text.replace(/&amp;/g, "&");

    // Decimal numeric entities (e.g. &#8217;, &#39;, &#160;)
    text = text.replace(/&#(\d+);/g, (_, code) => {
      const num = Number(code);
      if (!Number.isFinite(num)) return "";
      try {
        return String.fromCodePoint(num);
      } catch {
        return "";
      }
    });

    // Hex numeric entities (e.g. &#x27;, &#x2019;)
    text = text.replace(/&#x([0-9a-f]+);/gi, (_, code) => {
      const num = parseInt(code, 16);
      if (!Number.isFinite(num)) return "";
      try {
        return String.fromCodePoint(num);
      } catch {
        return "";
      }
    });

    // Named entities
    text = text
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/&rsquo;/g, "’")
      .replace(/&lsquo;/g, "‘")
      .replace(/&rdquo;/g, "”")
      .replace(/&ldquo;/g, "“")
      .replace(/&ndash;/g, "–")
      .replace(/&mdash;/g, "—")
      .replace(/&hellip;/g, "…")
      .replace(/&copy;/g, "©")
      .replace(/&reg;/g, "®")
      .replace(/&trade;/g, "™");
  }

  return text;
}

/**
 * Strips HTML tags and decodes entities into a clean, plain text excerpt.
 */
export function cleanExcerpt(htmlOrText: string, maxLength?: number): string {
  if (!htmlOrText) return "";
  const withoutTags = htmlOrText.replace(/<[^>]+>/g, " ");
  const decoded = decodeHtmlEntities(withoutTags).replace(/\s+/g, " ").trim();
  if (maxLength && decoded.length > maxLength) {
    return decoded.slice(0, maxLength).trim();
  }
  return decoded;
}
