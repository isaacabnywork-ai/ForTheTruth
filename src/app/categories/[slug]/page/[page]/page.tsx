import { permanentRedirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string; page: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Handles WordPress / WooCommerce legacy category pagination URLs like /categories/theology/page/2
 * Permanently redirects (308/301) to /categories/theology?page=2 with all query params preserved.
 */
export default async function CategoryPaginatedPage({
  params,
  searchParams,
}: Props) {
  const { slug, page } = await params;
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
  permanentRedirect(qs ? `/categories/${slug}?${qs}` : `/categories/${slug}`);
}
