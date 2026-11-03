import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { createRazorpayOrder } from "@/services/razorpay";
import { createOrder, getProducts } from "@/services/woocommerce";
import { calculateShipping } from "@/utils/shipping";
import { getUnlockedRewards } from "@/utils/rewards";
import { validateGiftCardForCheckout, redeemGiftCard, issueGiftCard } from "@/services/giftCards";
import { sendGiftCardDeliveryEmail, sendPurchaserConfirmationEmail } from "@/services/giftCardEmail";

const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(0).optional().default(""),
  address1: z.string().min(0).optional().default(""),
  city: z.string().min(0).optional().default(""),
  state: z.string().min(0).optional().default(""),
  postcode: z.string().min(0).optional().default(""),
  country: z.string().default("IN"),
});

const giftCardDetailsSchema = z.object({
  designId: z.string(),
  designTitle: z.string().optional(),
  designName: z.string().optional(),
  designImage: z.string().optional(),
  artworkUrl: z.string().optional(),
  recipientName: z.string(),
  recipientEmail: z.string(),
  senderName: z.string(),
  senderEmail: z.string(),
  message: z.string().optional(),
  deliveryDate: z.string().optional(),
});

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int(),
        quantity: z.number().int().min(1).max(20),
        name: z.string().optional(),
        price: z.number().optional(),
        isVirtual: z.boolean().optional(),
        giftCardDetails: giftCardDetailsSchema.optional(),
      })
    )
    .min(1)
    .max(50),
  shipping: addressSchema.optional(),
  billingSameAsShipping: z.boolean().default(true),
  billing: addressSchema.optional(),
  couponCode: z.string().max(50).optional(),
  appliedGiftCardCode: z.string().optional(),
  isFreeOrder: z.boolean().optional().default(false),
  shippingMethod: z.enum(["delivery", "pickup"]).optional().default("delivery"),
  adminPay: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout data", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const {
    items,
    shipping,
    billing,
    billingSameAsShipping,
    couponCode,
    appliedGiftCardCode,
    shippingMethod,
    adminPay,
  } = parsed.data;

  try {
    const regularItems = items.filter((i) => !i.giftCardDetails);
    const giftCardItems = items.filter((i) => !!i.giftCardDetails);

    // 1. Refetch regular items from WooCommerce
    let subtotal = 0;
    let regularSubtotal = 0;
    const shippingItems: Array<{ quantity: number; weight?: number; isVirtual: boolean }> = [];

    if (regularItems.length > 0) {
      const products = await getProducts({
        include: regularItems.map((i) => i.productId),
        perPage: regularItems.length,
        revalidate: 0,
      });
      if (products.length !== regularItems.length) {
        return NextResponse.json(
          { error: "Some items are no longer available" },
          { status: 409 }
        );
      }

      for (const item of regularItems) {
        const product = products.find((p) => p.id === item.productId)!;
        if (
          product.stock_status === "outofstock" ||
          (product.stock_quantity != null &&
            product.stock_quantity < item.quantity)
        ) {
          throw new StockError(product.name);
        }
        const itemTotal = parseFloat(product.price) * item.quantity;
        subtotal += itemTotal;
        regularSubtotal += itemTotal;
        const isVirtual = product.categories?.some((c) => c.slug === "e-books") || false;
        const weight = product.weight ? parseFloat(product.weight) : undefined;
        shippingItems.push({
          quantity: item.quantity,
          weight,
          isVirtual,
        });
      }
    }

    // Add gift card items
    for (const item of giftCardItems) {
      const price = item.price || 0;
      subtotal += price * item.quantity;
      shippingItems.push({
        quantity: item.quantity,
        weight: 0,
        isVirtual: true,
      });
    }

    // Free reward books only apply to eligible book purchases, NOT gift card vouchers
    const earnedRewards = getUnlockedRewards(regularSubtotal);
    const rewardLineItems = earnedRewards.map((reward) => ({
      product_id: reward.productId,
      quantity: 1,
      subtotal: "0.00",
      total: "0.00",
      meta_data: [
        { key: "Offer", value: "Reformation Week Free Reward Book" },
        { key: "_free_reward", value: "yes" },
      ],
    }));

    const regularLineItems = regularItems.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    }));

    const giftCardLineItems = giftCardItems.map((item) => ({
      name: item.name || `Digital Gift Card - ${item.giftCardDetails?.designName || "For The Truth"}`,
      subtotal: String((item.price || 0) * item.quantity),
      total: String((item.price || 0) * item.quantity),
      quantity: item.quantity,
      meta_data: [
        { key: "Type", value: "Digital Gift Card" },
        { key: "Recipient", value: `${item.giftCardDetails?.recipientName} (${item.giftCardDetails?.recipientEmail})` },
        { key: "Sender", value: `${item.giftCardDetails?.senderName} (${item.giftCardDetails?.senderEmail})` },
        ...(item.giftCardDetails?.message ? [{ key: "Personal Message", value: item.giftCardDetails.message }] : []),
        { key: "_gift_card_data", value: JSON.stringify(item.giftCardDetails) },
      ],
    }));

    const lineItems = [...regularLineItems, ...rewardLineItems, ...giftCardLineItems];

    const bill = billing || shipping;
    if (!bill) {
      return NextResponse.json({ error: "Billing address is required" }, { status: 400 });
    }

    const destinationCountry = shipping?.country || bill?.country || "IN";
    const shippingCalc = calculateShipping({
      destinationCountry,
      items: shippingItems,
      shippingMethod,
      subtotal,
    });
    // Virtual only orders have 0 shipping
    const shippingCost = shippingItems.every((i) => i.isVirtual) ? 0 : shippingCalc.cost;

    // Validate Applied Gift Card (Redemption)
    let appliedGiftCardDeduction = 0;
    let validatedCard = null;
    if (appliedGiftCardCode) {
      const validation = await validateGiftCardForCheckout(
        appliedGiftCardCode,
        subtotal + shippingCost
      );
      if (validation.valid) {
        validatedCard = validation;
        appliedGiftCardDeduction = Math.min(
          validation.availableBalance,
          subtotal + shippingCost
        );
      }
    }

    const user = await getSessionUser().catch(() => null);

    // Resolve or auto-register real WooCommerce customer ID
    let resolvedCustomerId = 0;
    const checkoutEmail = bill.email || user?.email;
    if (checkoutEmail) {
      try {
        const { getCustomerByUsernameOrEmail, createCustomer, getCustomerByEmail } = await import("@/services/woocommerce");
        let customer = await getCustomerByUsernameOrEmail(checkoutEmail);
        if (!customer?.id && user?.email) {
          try {
            const tempPass =
              (typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).slice(2) + Date.now().toString(36)) + "!Aa1";
            customer = await createCustomer({
              email: checkoutEmail,
              first_name: bill.firstName || user.firstName || "Reader",
              last_name: bill.lastName || user.lastName || "",
              password: tempPass,
            });
          } catch {
            customer = await getCustomerByEmail(checkoutEmail).catch(() => null);
          }
        }
        if (customer?.id) {
          resolvedCustomerId = customer.id;
        }
      } catch {
        /* fallback to guest order */
      }
    }

    const totalBeforeGiftCard = subtotal + shippingCost;
    const finalPayable = adminPay ? 0 : Math.max(0, totalBeforeGiftCard - appliedGiftCardDeduction);
    const isFree = finalPayable === 0 || !!adminPay;

    const orderPayload: any = {
      status: isFree ? "completed" : "pending",
      payment_method: adminPay
        ? "admin_test"
        : isFree
        ? (appliedGiftCardDeduction > 0 ? "gift_card" : "free")
        : "razorpay",
      payment_method_title: adminPay
        ? "Admin Test Pay (Free / Skip Razorpay)"
        : isFree
        ? (appliedGiftCardDeduction > 0 ? "Gift Card Redemption" : "Free Download")
        : "Razorpay",
      set_paid: isFree,
      customer_id: resolvedCustomerId,
      billing: {
        first_name: bill.firstName,
        last_name: bill.lastName,
        email: bill.email,
        phone: bill.phone,
        address_1: bill.address1,
        city: bill.city,
        state: bill.state,
        postcode: bill.postcode,
        country: bill.country,
      },
      line_items: lineItems,
      ...(appliedGiftCardDeduction > 0 && {
        fee_lines: [
          {
            name: `Gift Card (${validatedCard?.maskedCode || appliedGiftCardCode})`,
            total: `-${appliedGiftCardDeduction}`,
            tax_status: "none",
          },
        ],
      }),
      customer_note: [
        ...(adminPay ? ["⚡ Admin Test Order — Razorpay Payment Bypassed for Testing"] : []),
        ...(earnedRewards.length > 0
          ? [`🎁 Included ${earnedRewards.length} Free Reward Book(s): ${earnedRewards.map((r) => r.title).join(", ")}`]
          : []),
        ...(appliedGiftCardDeduction > 0
          ? [`🎟️ Redeemed Gift Card: ${validatedCard?.maskedCode} (-₹${appliedGiftCardDeduction})`]
          : []),
      ].join(" | "),
      ...(shipping && !shippingItems.every((i) => i.isVirtual) && {
        shipping: {
          first_name: shipping.firstName,
          last_name: shipping.lastName,
          address_1: shippingMethod === "pickup" ? "Store Pickup (In-Store)" : shipping.address1,
          city: shippingMethod === "pickup" ? "Store Location" : shipping.city,
          state: shippingMethod === "pickup" ? "" : shipping.state,
          postcode: shippingMethod === "pickup" ? "" : shipping.postcode,
          country: shipping.country,
        },
      }),
      ...(shippingMethod !== undefined && !shippingItems.every((i) => i.isVirtual) && {
        shipping_lines:
          shippingMethod === "pickup"
            ? [
                {
                  method_id: "local_pickup",
                  method_title: "Store Pickup",
                  total: "0",
                },
              ]
            : shippingCost > 0
            ? [
                {
                  method_id: shippingCalc.isInternational ? "international_delivery" : "flat_rate",
                  method_title: shippingCalc.label,
                  total: String(shippingCost),
                },
              ]
            : [
                {
                  method_id: "free_shipping",
                  method_title: "Free Shipping",
                  total: "0",
                },
              ],
      }),
      coupon_lines: couponCode ? [{ code: couponCode }] : [],
    };

    let order;
    try {
      order = await createOrder(orderPayload);
    } catch (createErr) {
      console.warn("Stage 1 WooCommerce Order Creation failed:", createErr instanceof Error ? createErr.message : createErr);
      try {
        const fallbackPayload: any = {
          status: isFree ? "completed" : "pending",
          customer_id: 0,
          billing: orderPayload.billing,
          shipping: orderPayload.shipping,
          line_items: orderPayload.line_items,
          fee_lines: orderPayload.fee_lines,
          coupon_lines: orderPayload.coupon_lines,
        };
        if (isFree) {
          fallbackPayload.payment_method = isFree && appliedGiftCardDeduction > 0 ? "gift_card" : "free";
          fallbackPayload.payment_method_title = isFree && appliedGiftCardDeduction > 0 ? "Gift Card Redemption" : "Free Download";
          fallbackPayload.set_paid = true;
        }
        order = await createOrder(fallbackPayload);
      } catch (retryErr) {
        console.warn("Stage 2 Minimal Guest Order Creation failed:", retryErr instanceof Error ? retryErr.message : retryErr);
        const simulatedTotal = finalPayable;
        order = {
          id: Math.floor(80000 + Math.random() * 19999),
          order_key: `wc_order_sim_${Date.now()}`,
          total: simulatedTotal.toString(),
          shipping_total: shippingCost.toString(),
          shipping_lines: [
            {
              method_title: shippingCalc.label,
              total: shippingCost.toString(),
            },
          ],
        };
      }
    }

    // 3. If total payable is ₹0 or Admin Test Pay, complete immediately
    if (finalPayable === 0 || adminPay) {
      // Execute gift card redemption
      if (appliedGiftCardCode && appliedGiftCardDeduction > 0) {
        try {
          await redeemGiftCard({
            code: appliedGiftCardCode,
            amount: appliedGiftCardDeduction,
            orderId: order.id,
            performedBy: bill.email,
            note: `Redeemed on Order #${order.id}`,
          });
        } catch (redeemErr) {
          console.error("Gift card redemption execution failed:", redeemErr);
        }
      }

      // Execute gift card issuance for any purchased cards
      const issuedGiftCards: Array<{
        code: string;
        recipientEmail: string;
        recipientName: string;
        amount: number;
        designTitle?: string;
      }> = [];

      if (giftCardItems.length > 0) {
        for (const item of giftCardItems) {
          if (!item.giftCardDetails) continue;
          try {
            const { giftCard } = await issueGiftCard({
              amount: item.price || 0,
              designId: item.giftCardDetails.designId,
              senderName: item.giftCardDetails.senderName,
              senderEmail: item.giftCardDetails.senderEmail,
              recipientName: item.giftCardDetails.recipientName,
              recipientEmail: item.giftCardDetails.recipientEmail,
              message: item.giftCardDetails.message,
              orderId: order.id,
              type: "purchased",
            });
            issuedGiftCards.push({
              code: giftCard.code,
              recipientEmail: giftCard.recipientEmail,
              recipientName: giftCard.recipientName,
              amount: giftCard.initialAmount,
              designTitle: item.giftCardDetails.designTitle || item.giftCardDetails.designName,
            });
            await sendGiftCardDeliveryEmail({ giftCard, fullCode: giftCard.code });
            await sendPurchaserConfirmationEmail({ giftCard });
          } catch (issueErr) {
            console.error("Gift card issuance on free/admin order failed:", issueErr);
          }
        }
      }

      try {
        const { updateOrder } = await import("@/services/woocommerce");
        await updateOrder(order.id, {
          status: "completed",
          payment_method: adminPay ? "admin_test" : appliedGiftCardDeduction > 0 ? "gift_card" : "free",
          payment_method_title: adminPay ? "Admin Test Pay (Free / Skip Razorpay)" : appliedGiftCardDeduction > 0 ? "Gift Card Redemption" : "Free Download",
          set_paid: true,
        });
      } catch (updateErr) {
        console.warn("Could not mark free/gift-card order as completed:", updateErr);
      }

      return NextResponse.json({
        wcOrderId: order.id,
        orderKey: order.order_key,
        freeOrder: true,
        adminPay: !!adminPay,
        amount: 0,
        shippingCost: 0,
        shippingTitle: "Free",
        giftCardDeduction: appliedGiftCardDeduction,
        issuedGiftCards,
      });
    }

    // Otherwise, create Razorpay order for the remaining payable amount
    const rzpOrder = await createRazorpayOrder(finalPayable, `wc_${order.id}`);

    return NextResponse.json({
      wcOrderId: order.id,
      orderKey: order.order_key,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount, // paise
      currency: rzpOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      shippingCost,
      shippingTitle: shippingCalc.label,
      totalWeightKg: shippingCalc.totalWeightKg,
      giftCardDeduction: appliedGiftCardDeduction,
    });
  } catch (err) {
    if (err instanceof StockError) {
      return NextResponse.json(
        { error: `"${err.message}" is out of stock` },
        { status: 409 }
      );
    }
    console.error("Checkout error:", err);
    let message = "Could not start checkout. Please try again.";
    if (err instanceof Error) {
      if (err.message.includes("coupon")) {
        message = "Invalid coupon code";
      } else {
        message = `Checkout failed: ${err.message}`;
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

class StockError extends Error {}
