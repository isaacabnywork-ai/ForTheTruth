import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getOrdersByCustomer } from "@/services/woocommerce";

export const revalidate = 0;

export async function GET() {
  const user = await getSessionUser().catch(() => null);
  if (!user || !user.email) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  try {
    const liveOrders = user.id ? await getOrdersByCustomer(user.id).catch(() => []) : [];
    
    if (liveOrders && liveOrders.length > 0) {
      return NextResponse.json({
        orders: liveOrders.map((o) => ({
          id: o.id,
          status: o.status,
          total: o.total,
          currency: o.currency,
          date: o.date_created,
          itemCount: o.line_items.reduce((n, li) => n + li.quantity, 0),
        })),
      });
    }

    return NextResponse.json({ orders: [] });
  } catch {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 502 });
  }
}
