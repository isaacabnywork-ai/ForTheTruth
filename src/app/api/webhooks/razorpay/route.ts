import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, fetchRazorpayOrder } from "@/services/razorpay";
import { updateOrder } from "@/services/woocommerce";

/**
 * Razorpay webhook — configure in the Razorpay dashboard:
 * URL: https://forthetruth.in/api/webhooks/razorpay
 * Events: payment.captured, order.paid, payment.failed
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
    const orderEntity = event?.payload?.order?.entity;

    // 1. Try finding receipt directly from notes or payload
    let receipt: string | undefined =
      payment?.notes?.receipt ||
      orderEntity?.receipt ||
      payment?.notes?.wcOrderId;

    // 2. Fallback: Parse from description if formatted as "Order #57128"
    if (!receipt && payment?.description && typeof payment.description === "string") {
      const match = payment.description.match(/Order\s*#?(\d+)/i);
      if (match && match[1]) {
        receipt = `wc_${match[1]}`;
      }
    }

    // 3. Fallback: Fetch order details directly from Razorpay API using order_id
    if (!receipt && payment?.order_id) {
      try {
        const rzpOrder = await fetchRazorpayOrder(payment.order_id);
        if (rzpOrder?.receipt) {
          receipt = rzpOrder.receipt;
        } else if (rzpOrder?.notes?.wcOrderId) {
          receipt = `wc_${rzpOrder.notes.wcOrderId}`;
        }
      } catch (e) {
        console.warn("Could not fetch order from Razorpay API:", e);
      }
    }

    let wcOrderId: number = NaN;
    if (receipt) {
      const cleaned = String(receipt).replace(/^wc_/, "").trim();
      wcOrderId = parseInt(cleaned, 10);
    }

    if (Number.isInteger(wcOrderId) && wcOrderId > 0) {
      if (event.event === "payment.captured" || event.event === "order.paid") {
        await updateOrder(wcOrderId, {
          status: "processing",
          transaction_id: payment?.id || orderEntity?.id,
          set_paid: true,
        });
        console.log(`[Razorpay Webhook] Successfully marked WC order #${wcOrderId} as processing (Tx: ${payment?.id})`);
      } else if (event.event === "payment.failed") {
        await updateOrder(wcOrderId, { status: "failed" });
      }
    } else {
      console.warn("[Razorpay Webhook] Could not resolve WooCommerce order ID from webhook payload:", {
        event: event.event,
        paymentId: payment?.id,
        orderId: payment?.order_id,
        notes: payment?.notes,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    // Return 200 so Razorpay doesn't retry forever on our internal errors
    return NextResponse.json({ ok: false });
  }
}
