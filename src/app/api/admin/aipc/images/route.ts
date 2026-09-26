import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { wcFetch } from "@/services/woocommerce";
import type { Product } from "@/types/product";

/**
 * GET /api/admin/aipc/images
 * Fetches WooCommerce product images for AIPC books by SKU.
 * Called client-side after the POS loads so it doesn't block render.
 * Returns a map of { sku: imageUrl }
 */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all products (paginated, 100 per page) to build SKU → image map
    const PER_PAGE = 100;
    const FIELDS = "id,sku,images";

    // Get page 1 and total pages
    const firstRes = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products?per_page=${PER_PAGE}&status=publish&_fields=${FIELDS}&page=1`,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.WOOCOMMERCE_API_KEY}:${process.env.WOOCOMMERCE_API_SECRET}`
            ).toString("base64"),
        },
        next: { revalidate: 3600 }, // cache for 1 hour
      }
    );

    if (!firstRes.ok) {
      return NextResponse.json({ images: {} });
    }

    const firstBatch = (await firstRes.json()) as Product[];
    const totalPages = parseInt(firstRes.headers.get("x-wp-totalpages") ?? "1", 10);

    // Fetch remaining pages in parallel
    let allProducts = [...firstBatch];
    if (totalPages > 1) {
      const pageNums = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const rest = await Promise.all(
        pageNums.map((page) =>
          fetch(
            `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products?per_page=${PER_PAGE}&status=publish&_fields=${FIELDS}&page=${page}`,
            {
              headers: {
                Authorization:
                  "Basic " +
                  Buffer.from(
                    `${process.env.WOOCOMMERCE_API_KEY}:${process.env.WOOCOMMERCE_API_SECRET}`
                  ).toString("base64"),
              },
              next: { revalidate: 3600 },
            }
          ).then((r) => (r.ok ? r.json() : []))
        )
      );
      allProducts = [...allProducts, ...rest.flat()];
    }

    // Build SKU → image URL map
    const images: Record<string, string> = {};
    for (const product of allProducts) {
      if (product.sku && product.images?.[0]?.src) {
        images[product.sku.toLowerCase()] = product.images[0].src;
      }
    }

    return NextResponse.json({ images });
  } catch (err) {
    console.error("Failed to fetch AIPC images:", err);
    return NextResponse.json({ images: {} });
  }
}
