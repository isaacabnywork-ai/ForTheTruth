import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount } = await req.json(); // amount in rupees
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
  }

  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `pos_${Date.now()}`,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Razorpay order creation failed:", data);
    return NextResponse.json({ error: data?.error?.description || "Failed to create Razorpay order" }, { status: 500 });
  }

  return NextResponse.json({ orderId: data.id, amount: data.amount, currency: data.currency });
}
