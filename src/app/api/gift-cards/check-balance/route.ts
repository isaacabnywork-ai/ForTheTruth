import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateGiftCardForCheckout, getGiftCardByCode } from "@/services/giftCards";

export const dynamic = "force-dynamic";

const failedAttempts = new Map<string, { count: number; lastReset: number }>();
const MAX_FAILED_ATTEMPTS = 8;
const WINDOW_MS = 5 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = failedAttempts.get(ip);
  if (!entry) return true;
  if (now - entry.lastReset > WINDOW_MS) {
    failedAttempts.delete(ip);
    return true;
  }
  return entry.count < MAX_FAILED_ATTEMPTS;
}

function recordFailure(ip: string) {
  const now = Date.now();
  const entry = failedAttempts.get(ip) || { count: 0, lastReset: now };
  if (now - entry.lastReset > WINDOW_MS) {
    entry.count = 1;
    entry.lastReset = now;
  } else {
    entry.count += 1;
  }
  failedAttempts.set(ip, entry);
}

const schema = z.object({
  code: z.string().min(5).max(30),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        error: "Too many balance check attempts. Please try again after 5 minutes.",
      },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    recordFailure(ip);
    return NextResponse.json(
      { error: "Please enter a valid gift card code." },
      { status: 400 }
    );
  }

  const { code } = parsed.data;
  const result = await validateGiftCardForCheckout(code, 0);

  if (!result.valid && result.status !== "redeemed" && result.status !== "expired") {
    recordFailure(ip);
    return NextResponse.json(
      { error: result.error || "No gift card found with this code." },
      { status: 404 }
    );
  }

  const fullCard = await getGiftCardByCode(code);

  return NextResponse.json({
    valid: result.valid,
    maskedCode: result.maskedCode,
    balance: result.availableBalance,
    initialAmount: result.initialAmount,
    status: result.status,
    expiryDate: result.expiryDate,
    designTitle: result.designTitle,
    designImage: result.designImage,
    senderName: fullCard?.senderName,
    recipientName: fullCard?.recipientName,
  });
}
