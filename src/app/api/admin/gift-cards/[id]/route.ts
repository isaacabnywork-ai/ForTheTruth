import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminGuard";
import {
  getGiftCardById,
  updateGiftCardStatus,
  adjustGiftCardBalance,
  extendGiftCardExpiry,
} from "@/services/giftCards";
import { sendGiftCardDeliveryEmail } from "@/services/giftCardEmail";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const card = await getGiftCardById(id);
  if (!card) {
    return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
  }

  return NextResponse.json({ giftCard: card });
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("status"),
    status: z.enum(["active", "disabled", "expired"]),
    reason: z.string().optional(),
  }),
  z.object({
    action: z.literal("balance"),
    type: z.enum(["admin_credit", "admin_debit"]),
    amount: z.number().positive("Amount must be positive"),
    reason: z.string().min(1, "Reason is required"),
  }),
  z.object({
    action: z.literal("expiry"),
    newExpiryDate: z.string().nullable(),
    reason: z.string().min(1, "Reason is required"),
  }),
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const data = parsed.data;
    if (data.action === "status") {
      const updated = await updateGiftCardStatus(
        id,
        data.status,
        data.reason || `Status updated to ${data.status} by admin ${admin.email}`,
        admin.email
      );
      return NextResponse.json({ success: true, giftCard: updated });
    }

    if (data.action === "balance") {
      const result = await adjustGiftCardBalance({
        id,
        amount: data.amount,
        type: data.type,
        note: data.reason,
        performedBy: admin.email,
      });
      return NextResponse.json({
        success: true,
        giftCard: result.giftCard,
        transaction: result.transaction,
      });
    }

    if (data.action === "expiry") {
      const updated = await extendGiftCardExpiry(
        id,
        data.newExpiryDate,
        data.reason,
        admin.email
      );
      return NextResponse.json({ success: true, giftCard: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Gift card update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update gift card" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const card = await getGiftCardById(id);
  if (!card) {
    return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body?.action || "resend-email";

  if (action === "resend-email") {
    const result = await sendGiftCardDeliveryEmail({
      giftCard: card,
      fullCode: card.code,
    });
    return NextResponse.json({ success: result.success, emailResult: result });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
