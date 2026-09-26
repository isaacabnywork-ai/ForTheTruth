import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { lineItems } = body;

    // 1. Update stock in Supabase
    for (const item of lineItems) {
      const bookId = item.product_id;
      // Fetch current stock
      const { data: book } = await supabase.from("aipc_books").select("*").eq("id", bookId).single();
      if (book) {
        const newQty = Math.max(0, (book["AIPC QTY"] || 0) - item.quantity);
        const newSold = (book["AIPC Sold"] || 0) + item.quantity;
        await supabase.from("aipc_books").update({ "AIPC QTY": newQty, "AIPC Sold": newSold }).eq("id", bookId);
      }
    }

    // 2. Save order to Supabase
    const orderId = Math.floor(100000 + Math.random() * 900000);
    const { error: orderError } = await supabase.from("aipc_orders").insert({
      id: orderId,
      date: new Date().toISOString(),
      lineItems: body.lineItems,
      totalAmount: body.totalAmount,
      discountAmount: body.discountAmount,
      customerName: body.customerName || "",
      customerPhone: body.customerPhone || "",
      customerEmail: body.customerEmail || "",
      notes: body.notes || "",
      paymentMethod: body.paymentMethod || "",
      refunded: false
    });

    if (orderError) throw new Error("Failed to insert order: " + orderError.message);
    
    return NextResponse.json({ success: true, order: { id: orderId } });
  } catch (error: unknown) {
    console.error("AIPC checkout error:", error);
    return NextResponse.json(
      { error: "Failed to process AIPC offline order and update Supabase." },
      { status: 500 }
    );
  }
}
