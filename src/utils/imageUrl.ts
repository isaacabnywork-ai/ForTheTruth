/**
 * Utility to convert raw WordPress image URLs into same-origin Edge CDN URLs.
 *
 * Benefits:
 * 1. Zero DNS resolution overhead for `admin.forthetruth.in`.
 * 2. Reuses the already open multiplexed HTTP/2 connection to `forthetruth.in`.
 * 3. Bypasses AWS Lambda Next.js image resizing cold starts.
 * 4. Served directly from AWS CloudFront edge caches across India with 1-year immutable caching.
 * 5. Completely shields the single WordPress EC2 origin from image-download bandwidth saturation.
 */
export function toCdnImageUrl(src?: string | null): string {
  if (!src || typeof src !== "string") return "";

  // Handle data URIs or already local paths
  if (src.startsWith("data:") || src.startsWith("/")) {
    return src;
  }

  // Rewrite any admin or demo WordPress uploads URL to local same-origin CDN rewrite
  return src.replace(
    /^https?:\/\/(?:admin\.forthetruth\.in|demos\.abnyweb\.in|forthetruth\.in)\/wp-content\/uploads\//,
    "/wp-content/uploads/"
  );
}

/**
 * Returns an absolute URL for OpenGraph, Twitter cards, or Schema.org structured data.
 */
export function toAbsoluteCdnImageUrl(src?: string | null): string {
  if (!src || typeof src !== "string") return "";
  const relative = toCdnImageUrl(src);
  if (relative.startsWith("/")) {
    return `https://forthetruth.in${relative}`;
  }
  return relative;
}
