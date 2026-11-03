import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getCustomerGiftCards } from "@/services/giftCards";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser().catch(() => null);
  if (!user?.email) {
    return NextResponse.json({ error: "Please log in to view your gift cards" }, { status: 401 });
  }

  try {
    const cards = await getCustomerGiftCards(user.email);
    return NextResponse.json({ cards });
  } catch (error: any) {
    console.error("Customer gift cards fetch error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch gift cards" },
      { status: 500 }
    );
  }
}
