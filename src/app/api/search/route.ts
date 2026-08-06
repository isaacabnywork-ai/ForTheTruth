import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/services/woocommerce";
import { getAuthor } from "@/types/product";
import { sortProductsByRelevance } from "@/utils/search";

/** Intelligent autocomplete search endpoint: /api/search?q=psalms */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    // Fetch a larger candidate pool from WooCommerce to overcome default poor search ranking
    const products = await getProducts({
      search: q,
      perPage: 40,
      revalidate: 120,
    });

    // Sort by multi-word relevance score and take top 8 best matches
    const sorted = sortProductsByRelevance(products, q).slice(0, 8);

    return NextResponse.json({
      results: sorted.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: p.images[0]?.src ?? null,
        author: getAuthor(p) ?? null,
        rating: p.average_rating,
        ratingCount: p.rating_count,
      })),
    });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
