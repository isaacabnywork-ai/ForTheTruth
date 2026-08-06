import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/services/razorpay";
import { updateOrder } from "@/services/woocommerce";

/**
 * Razorpay webhook — configure in the Razorpay dashboard:
 * URL: https://your-domain.com/api/webhooks/razorpay
 * Events: payment.captured, payment.failed
 * Secret: RAZORPAY_WEBHOOK_SECRET
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody);
    const payment = event?.payload?.payment?.entity;
    // We set receipt to `wc_<orderId>` when creating the Razorpay order
    const receipt: string | undefined =
      payment?.notes?.receipt ?? event?.payload?.order?.entity?.receipt;
    const wcOrderId = receipt?.startsWith("wc_")
      ? parseInt(receipt.slice(3), 10)
      : NaN;

    if (Number.isInteger(wcOrderId)) {
      if (event.event === "payment.captured") {
        await updateOrder(wcOrderId, {
          status: "processing",
          transaction_id: payment?.id,
          set_paid: true,
        });
      } else if (event.event === "payment.failed") {
        await updateOrder(wcOrderId, { status: "failed" });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    // Return 200 so Razorpay doesn't retry forever on our internal errors
    return NextResponse.json({ ok: false });
  }
}
