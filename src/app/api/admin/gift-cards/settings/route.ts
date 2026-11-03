import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminGuard";
import { getGiftCardSettings, updateGiftCardSettings } from "@/services/giftCards";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getGiftCardSettings();
  return NextResponse.json({ settings });
}

const settingsSchema = z.object({
  enabled: z.boolean().optional(),
  minAmount: z.number().min(10).max(50000).optional(),
  maxAmount: z.number().min(100).max(100000).optional(),
  defaultValidityDays: z.number().min(0).max(3650).optional(),
  allowMultiplePerOrder: z.boolean().optional(),
  allowPartialRedemption: z.boolean().optional(),
  allowGuestRedemption: z.boolean().optional(),
  senderName: z.string().optional(),
  senderEmail: z.string().email().optional(),
  designs: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        subtitle: z.string(),
        description: z.string(),
        image: z.string(),
        bgColor: z.string(),
        enabled: z.boolean(),
      })
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid settings payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await updateGiftCardSettings(parsed.data);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error("Admin gift card settings update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
