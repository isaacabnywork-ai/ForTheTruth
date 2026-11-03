import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPaymentSignature } from "@/services/razorpay";
import { updateOrder } from "@/services/woocommerce";
import { redeemGiftCard, issueGiftCard } from "@/services/giftCards";
import { sendGiftCardDeliveryEmail, sendPurchaserConfirmationEmail } from "@/services/giftCardEmail";

const schema = z.object({
  wcOrderId: z.number().int().positive(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  appliedGiftCardCode: z.string().optional(),
  giftCardDeduction: z.number().optional(),
  purchasedGiftCards: z
    .array(
      z.object({
        price: z.number().positive(),
        giftCardDetails: z.object({
          designId: z.string(),
          senderName: z.string(),
          senderEmail: z.string(),
          recipientName: z.string(),
          recipientEmail: z.string(),
          message: z.string().optional(),
        }),
      })
    )
    .optional(),
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

  // 1. Redeem applied gift card if any
  if (data.appliedGiftCardCode && (data.giftCardDeduction || 0) > 0) {
    try {
      await redeemGiftCard({
        code: data.appliedGiftCardCode,
        amount: data.giftCardDeduction!,
        orderId: data.wcOrderId,
        performedBy: "Customer (Checkout)",
        note: `Redeemed on Order #${data.wcOrderId} via Razorpay`,
      });
    } catch (redeemErr) {
      console.error("Post-payment gift card redemption error:", redeemErr);
    }
  }

  // 2. Issue any purchased gift cards
  if (data.purchasedGiftCards && data.purchasedGiftCards.length > 0) {
    for (const item of data.purchasedGiftCards) {
      try {
        const { giftCard } = await issueGiftCard({
          amount: item.price,
          designId: item.giftCardDetails.designId,
          senderName: item.giftCardDetails.senderName,
          senderEmail: item.giftCardDetails.senderEmail,
          recipientName: item.giftCardDetails.recipientName,
          recipientEmail: item.giftCardDetails.recipientEmail,
          message: item.giftCardDetails.message,
          orderId: data.wcOrderId,
          type: "purchased",
        });
        await sendGiftCardDeliveryEmail({ giftCard, fullCode: giftCard.code });
        await sendPurchaserConfirmationEmail({ giftCard });
      } catch (issueErr) {
        console.error("Post-payment gift card issuance error:", issueErr);
      }
    }
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
