import { permanentRedirect } from "next/navigation";

interface Props {
  params: Promise<{ page: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Handles WordPress / WooCommerce legacy pagination URLs like /shop/page/3?srsltid=...
 * Permanently redirects (308/301) to /shop?page=3 with all query params preserved.
 */
export default async function ShopPaginatedPage({
  params,
  searchParams,
}: Props) {
  const { page } = await params;
  const sp = await searchParams;

  const urlParams = new URLSearchParams();
  const pageNum = parseInt(page, 10);
  if (!isNaN(pageNum) && pageNum > 1) {
    urlParams.set("page", String(pageNum));
  }

  for (const [key, value] of Object.entries(sp)) {
    if (key !== "page" && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlParams.append(key, v));
      } else {
        urlParams.set(key, value);
      }
    }
  }

  const qs = urlParams.toString();
  permanentRedirect(qs ? `/shop?${qs}` : "/shop");
}
