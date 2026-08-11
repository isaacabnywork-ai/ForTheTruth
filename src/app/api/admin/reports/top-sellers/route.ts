import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { getTopSellersReport } from "@/services/woocommerce";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reports = await getTopSellersReport();
    return NextResponse.json(reports);
  } catch (err: unknown) {
    console.error("Top Sellers Report API error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch top sellers report" },
      { status: 500 }
    );
  }
}
