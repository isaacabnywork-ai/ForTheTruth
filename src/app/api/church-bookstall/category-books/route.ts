import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/services/woocommerce";
import { getAuthor } from "@/types/product";

export const revalidate = 300; // Cache for 5 minutes

export async function GET(req: NextRequest) {
  const categoryIdParam = req.nextUrl.searchParams.get("categoryId");
  const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined;

  if (!categoryId || isNaN(categoryId)) {
    return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
  }

  try {
    const products = await getProducts({
      category: categoryId,
      perPage: 100, // get all published books in this category
      status: "publish",
      orderby: "title",
      order: "asc",
      revalidate: 300,
    });

    const books = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.images[0]?.src ?? null,
      author: getAuthor(p) ?? null,
      stock_status: p.stock_status,
    }));

    return NextResponse.json({ books });
  } catch (error) {
    console.error(`Failed to fetch books for category ${categoryId}:`, error);
    return NextResponse.json({ books: [] });
  }
}
