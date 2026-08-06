import { NextRequest, NextResponse } from "next/server";
import { updateProductInventory } from "@/services/admin";
import { requireAdmin } from "@/lib/adminGuard";

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { productId, stock_quantity, regular_price, sale_price } = body;
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updated = await updateProductInventory(Number(productId), {
      stock_quantity: stock_quantity !== undefined ? Number(stock_quantity) : undefined,
      regular_price: regular_price ? String(regular_price) : undefined,
      sale_price: sale_price !== undefined ? String(sale_price) : undefined,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("Stock adjustment error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update book catalog inventory in WooCommerce" },
      { status: 500 }
    );
  }
}
