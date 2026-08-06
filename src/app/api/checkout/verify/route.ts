import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaymentSignature } from "@/services/razorpay";
import { updateOrder } from "@/services/woocommerce";

const schema = z.object({
  wcOrderId: z.number().int().positive(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const data = parsed.data;

  const valid = verifyPaymentSignature({
    razorpayOrderId: data.razorpayOrderId,
    razorpayPaymentId: data.razorpayPaymentId,
    razorpaySignature: data.razorpaySignature,
  });

  if (!valid) {
    await updateOrder(data.wcOrderId, { status: "failed" }).catch(() => {});
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 400 }
    );
  }

  try {
    await updateOrder(data.wcOrderId, {
      status: "processing",
      transaction_id: data.razorpayPaymentId,
      set_paid: true,
    });
    return NextResponse.json({ ok: true, orderId: data.wcOrderId });
  } catch {
    // Payment is valid but WC update failed — webhook will reconcile
    return NextResponse.json({ ok: true, orderId: data.wcOrderId });
  }
}
