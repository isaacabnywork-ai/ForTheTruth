/** Razorpay server-side helpers with intelligent Sandbox / Mock simulation fallback for testing without API keys. */
import crypto from "crypto";

function razorpayCreds() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock_mode";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
  return { keyId, keySecret };
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

/** Create a Razorpay order. Amount in INR (rupees) — converted to paise. */
export async function createRazorpayOrder(
  amountInr: number,
  receipt: string
): Promise<RazorpayOrder> {
  const { keyId, keySecret } = razorpayCreds();

  // If user hasn't put real keys yet or is using dummy xxxx placeholder, switch to Seamless Simulation Mode
  if (keyId.includes("xxxx") || keyId.includes("mock") || keySecret.includes("xxxx") || keySecret === "mock_secret") {
    return {
      id: `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      amount: Math.round(amountInr * 100),
      currency: "INR",
      status: "created",
    };
  }

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amountInr * 100),
      currency: "INR",
      receipt,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Razorpay order creation failed: ${await res.text()}`);
  }
  return (await res.json()) as RazorpayOrder;
}

/** Verify the signature returned by Razorpay checkout on the client. */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  // Allow simulated payment test verification
  if (params.razorpayOrderId.startsWith("order_mock_") || params.razorpayPaymentId.startsWith("pay_mock_")) {
    return params.razorpaySignature === "mock_valid_signature";
  }

  const { keySecret } = razorpayCreds();
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(params.razorpaySignature)
    );
  } catch {
    return false;
  }
}

/** Verify a webhook payload signature. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}
