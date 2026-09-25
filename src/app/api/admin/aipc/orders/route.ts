import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: orders, error } = await supabase
      .from("aipc_orders")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;
    return NextResponse.json(orders || []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read orders from Supabase" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, action = "refund" } = await req.json();

    const { data: order, error: fetchErr } = await supabase
      .from("aipc_orders")
      .select("*")
      .eq("id", orderId)
      .single();
      
    if (fetchErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.refunded) {
      return NextResponse.json({ error: "Order already refunded" }, { status: 400 });
    }

    // If it's a full refund on a Razorpay order, process financial refund via Razorpay API
    const notes = order.notes || "";
    const rzpMatch = notes.match(/Razorpay ID:\s*(pay_[a-zA-Z0-9_]+)/);
    
    if (action === "refund" && rzpMatch) {
      const paymentId = rzpMatch[1];
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      
      const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      
      const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({ amount: Math.round(order.totalAmount * 100) })
      });

      const rzpData = await rzpRes.json();
      if (!rzpRes.ok && rzpData.error?.code !== "BAD_REQUEST_ERROR") { 
        throw new Error(`Razorpay Refund Failed: ${rzpData.error?.description || "Unknown error"}`);
      }
    }

    // Update local stock to return items in Supabase
    for (const item of (order.lineItems as any[])) {
      const bookId = item.product_id;
      const { data: book } = await supabase.from("aipc_books").select("*").eq("id", bookId).single();
      if (book) {
        const newQty = (book["AIPC QTY"] || 0) + item.quantity;
        const newSold = Math.max(0, (book["AIPC Sold"] || 0) - item.quantity);
        await supabase.from("aipc_books").update({ "AIPC QTY": newQty, "AIPC Sold": newSold }).eq("id", bookId);
      }
    }

    // Mark order as refunded / exchanged
    const { error: updateErr, data: updatedOrder } = await supabase
      .from("aipc_orders")
      .update({
        refunded: true,
        refundedAt: new Date().toISOString(),
        refundType: action
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: error.message || "Failed to process refund" }, { status: 500 });
  }
}
