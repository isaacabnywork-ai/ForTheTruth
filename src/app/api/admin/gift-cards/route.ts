import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminGuard";
import {
  getGiftCardsPaged,
  getGiftCardOverview,
  issueGiftCard,
  getGiftCardSettings,
} from "@/services/giftCards";
import { sendGiftCardDeliveryEmail } from "@/services/giftCardEmail";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const includeOverview = searchParams.get("overview") === "true";

    const pagedResult = await getGiftCardsPaged({ search, status, page, limit });

    let overview = undefined;
    if (includeOverview) {
      overview = await getGiftCardOverview();
    }

    return NextResponse.json({
      ...pagedResult,
      overview,
    });
  } catch (error: any) {
    console.error("Admin gift cards query error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch gift cards" },
      { status: 500 }
    );
  }
}

const issueSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientEmail: z.string().email("Invalid recipient email"),
  senderName: z.string().min(1, "Sender name is required"),
  senderEmail: z.string().email("Invalid sender email"),
  amount: z.number().min(1, "Amount must be at least ₹1"),
  designId: z.string().min(1, "Design ID is required"),
  message: z.string().max(500).optional(),
  expiryDays: z.number().min(0).max(3650).optional(),
  sendEmail: z.boolean().optional().default(true),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const parsed = issueSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const settings = await getGiftCardSettings();
    const design =
      settings.designs.find((d) => d.id === data.designId) || settings.designs[0];

    const validityDays =
      data.expiryDays !== undefined ? data.expiryDays : settings.defaultValidityDays;

    const { giftCard, transaction } = await issueGiftCard({
      amount: data.amount,
      designId: design.id,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      message: data.message,
      type: "manual",
      validityDays,
      notes: data.notes || `Manually issued by admin ${admin.email}`,
      performedBy: admin.email,
    });

    let emailResult = null;
    if (data.sendEmail) {
      emailResult = await sendGiftCardDeliveryEmail({
        giftCard,
        fullCode: giftCard.code,
      });
    }

    return NextResponse.json({
      success: true,
      giftCard,
      fullCode: giftCard.code,
      transaction,
      emailResult,
    });
  } catch (error: any) {
    console.error("Admin gift card manual issue error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to issue gift card" },
      { status: 500 }
    );
  }
}
