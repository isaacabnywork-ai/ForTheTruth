import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { getGiftCardTransactionsPaged } from "@/services/giftCards";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const giftCardId = searchParams.get("giftCardId") || undefined;
    const type = (searchParams.get("type") as any) || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);

    const result = await getGiftCardTransactionsPaged({
      giftCardId,
      type,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Admin gift card transactions error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
