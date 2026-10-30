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

/**
 * Strips Claude web chat UI HTML artifacts (e.g. font-claude-response-body, text-text-100, etc.)
 * and unneeded chat container classes copied directly from Claude web interface into WordPress descriptions.
 */
export function cleanHtmlDescription(rawHtml: string): string {
  if (!rawHtml) return "";

  return rawHtml
    // Strip Claude font and chat body classes
    .replace(/\s*class="[^"]*font-claude-[^"]*"/gi, "")
    .replace(/\s*class="[^"]*text-text-[^"]*"/gi, "")
    .replace(/\s*class="[^"]*break-words[^"]*"/gi, "")
    .replace(/\s*font-claude-[a-z0-9_-]+/gi, "")
    // Remove empty class attributes left behind
    .replace(/\s*class="\s*"/gi, "")
    // Clean up excessive whitespace inside opening tags
    .replace(/<([a-z0-9]+)\s+>/gi, "<$1>");
}

/**
 * Formats a category name cleanly:
 * - Decodes HTML entities
 * - Converts "GOOD BOOK GUIDES" (or any accidental all-caps category) to Title Case "Good Book Guides"
 */
export function formatCategoryName(name: string): string {
  if (!name) return "";
  const cleaned = decodeHtmlEntities(name).trim();
  if (cleaned.toUpperCase() === "GOOD BOOK GUIDES") {
    return "Good Book Guides";
  }
  if (cleaned.length > 3 && cleaned === cleaned.toUpperCase() && !cleaned.includes("AIPC")) {
    return cleaned
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return cleaned;
}
