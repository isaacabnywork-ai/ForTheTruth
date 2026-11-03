import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateGiftCardForCheckout } from "@/services/giftCards";

export const dynamic = "force-dynamic";

// Simple in-memory rate limiter for failed validation attempts
const failedAttempts = new Map<string, { count: number; lastReset: number }>();
const MAX_FAILED_ATTEMPTS = 10;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

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
  orderTotal: z.number().min(0).optional().default(0),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        valid: false,
        error: "Too many failed attempts. Please try again after 5 minutes.",
      },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    recordFailure(ip);
    return NextResponse.json(
      { valid: false, error: "Please enter a valid gift card code." },
      { status: 400 }
    );
  }

  const { code, orderTotal } = parsed.data;
  const result = await validateGiftCardForCheckout(code, orderTotal);

  if (!result.valid) {
    recordFailure(ip);
    return NextResponse.json(
      { valid: false, error: result.error || "Invalid gift card code." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    valid: true,
    card: {
      code: result.code,
      maskedCode: result.maskedCode,
      initialAmount: result.initialAmount,
      availableBalance: result.availableBalance,
      appliedAmount: result.appliedAmount,
      remainingOrderTotal: result.remainingOrderTotal,
      remainingGiftCardBalance: result.remainingGiftCardBalance,
      designTitle: result.designTitle,
      designImage: result.designImage,
      expiryDate: result.expiryDate,
    },
  });
}
