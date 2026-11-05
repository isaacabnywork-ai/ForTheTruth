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
 * Cleans up product short description excerpts:
 * - Strips old WordPress yellow 'Contact Us' button HTML blocks (#fcb424)
 * - Strips format-prices placeholders
 * - Formats 'Contact us to check availability' with a consistent subtle underline, removing redundant button styling
 */
export function cleanProductShortDescription(rawHtml: string): string {
  if (!rawHtml) return "";

  return cleanHtmlDescription(rawHtml)
    // Strip old WordPress yellow Contact Us buttons
    .replace(/<p[^>]*>\s*<a[^>]*style=[\"'][^\"']*background-color:[^\"']*#fcb424[^\"']*[\"'][^>]*>[\s\S]*?<\/a>\s*<\/p>/gi, "")
    .replace(/<a[^>]*style=[\"'][^\"']*background-color:[^\"']*#fcb424[^\"']*[\"'][^>]*>[\s\S]*?<\/a>/gi, "")
    // Strip format-prices container tags
    .replace(/<div class=[\"']format-prices[\"'][^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, "")
    .replace(/<div class=[\"']format-prices[\"'][^>]*>[\s\S]*?<\/div>/gi, "")
    // Format "Contact us to check availability..." with a clean underline and WhatsApp link
    .replace(/<em><strong>(Contact us to check the availability[^<]*)<\/strong><\/em>/gi, (_match, text) => {
      return `<a href="https://api.whatsapp.com/send?phone=918604685533&text=Hello%2C%20I%20want%20to%20know%20more%20info%20about%20For%20The%20Truth%20products" target="_blank" rel="noopener noreferrer" class="underline decoration-gold decoration-2 underline-offset-4 font-semibold text-charcoal hover:text-gold-dark transition-colors inline-block mt-0.5">${text.trim()}</a>`;
    })
    .trim();
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
