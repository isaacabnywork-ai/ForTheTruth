import { NextRequest, NextResponse } from "next/server";
import { submitPosOrder, CreatePosOrderInput } from "@/services/admin";
import { requireAdmin } from "@/lib/adminGuard";

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
    const order = await submitPosOrder(body);
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("POS Order creation failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to finalize POS order in WooCommerce" },
      { status: 500 }
    );
  }
}
