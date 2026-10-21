import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/services/woocommerce";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const forceRefresh = searchParams.get("refresh") === "true";

    const products = await getAllProducts({ forceRefresh });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    console.error("Failed to fetch admin products:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error)?.message || "Failed to retrieve book catalog from WooCommerce",
        products: [],
      },
      { status: 500 }
    );
  }
}
