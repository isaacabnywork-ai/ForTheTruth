import { NextRequest, NextResponse } from "next/server";
import { submitPosOrder, CreatePosOrderInput } from "@/services/admin";
import { requireAdmin } from "@/lib/adminGuard";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as CreatePosOrderInput;
    if (!body.lineItems || !body.lineItems.length) {
      return NextResponse.json(
        { error: "Order must contain at least one line item." },
        { status: 400 }
      );
    }

    try {
      const order = await submitPosOrder(body);
      return NextResponse.json({ success: true, order });
    } catch (wcError: unknown) {
      console.warn("WooCommerce POS order sync failed, saving fallback order to Supabase:", wcError);

      const fallbackOrderId = Math.floor(100000 + Math.random() * 900000);
      const { error: dbError } = await supabase.from("aipc_orders").insert({
        id: fallbackOrderId,
        date: new Date().toISOString(),
        lineItems: body.lineItems,
        totalAmount: body.totalAmount,
        discountAmount: body.discountAmount || 0,
        customerName: body.customerName || "Walk-in Customer",
        customerPhone: body.customerPhone || "",
        customerEmail: body.customerEmail || "",
        notes: `${body.notes || ""} [WOO_FALLBACK: ${(wcError as Error)?.message || "WC unreachable"}]`.trim(),
        paymentMethod: body.paymentMethod || "POS",
        refunded: false,
      });

      if (dbError) {
        console.error("Supabase fallback insert also failed:", dbError);
        throw wcError;
      }

      return NextResponse.json({
        success: true,
        order: {
          id: fallbackOrderId,
          status: "completed",
        },
        fallback: true,
      });
    }
  } catch (error: unknown) {
    console.error("POS Order creation failed:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to finalize POS order" },
      { status: 500 }
    );
  }
}
