import { NextResponse } from "next/server";
import { getCategories } from "@/services/woocommerce";

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const allCategories = await getCategories();
    // Exclude special utility categories like "Free E-books" or "Gift Wrap"
    const filtered = allCategories
      .filter((c) => c.slug !== "e-books" && c.slug !== "gift-wrap" && (c.count || 0) > 0)
      .map((c) => ({
        id: c.id,
        name: c.name.replace(/&amp;/g, "&"),
        slug: c.slug,
        count: c.count,
      }));

    return NextResponse.json({ categories: filtered });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ categories: [] });
  }
}
