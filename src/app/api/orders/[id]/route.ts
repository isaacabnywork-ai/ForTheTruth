import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getOrder } from "@/services/woocommerce";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (!Number.isInteger(orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const user = await getSessionUser().catch(() => null);
  const orderKey = req.nextUrl.searchParams.get("key");

  try {
    // Try live WooCommerce order lookup first
    const order = await getOrder(orderId).catch(() => null);
    if (order) {
      const owns =
        (user && user.id && order.customer_id === user.id) ||
        (orderKey && order.order_key === orderKey);
      if (owns) {
        return NextResponse.json({ order });
      }
    }
  } catch {
    // Ignore error
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
