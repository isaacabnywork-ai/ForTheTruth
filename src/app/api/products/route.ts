import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/services/woocommerce";

/** Client-safe product proxy, e.g. for the wishlist page: /api/products?include=1,2,3 */
export async function GET(req: NextRequest) {
  const includeParam = req.nextUrl.searchParams.get("include");
  const ids = (includeParam ?? "")
    .split(",")
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 50);

  if (ids.length === 0) return NextResponse.json({ products: [] });

  try {
    const products = await getProducts({ include: ids, perPage: ids.length });
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Failed to load products" }, { status: 502 });
  }
}
