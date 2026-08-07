import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { getSalesReports } from "@/services/woocommerce";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const period = searchParams.get("period") as "week" | "month" | "year" | null;
  const validPeriod = period || "month";

  try {
    const reports = await getSalesReports(validPeriod);
    return NextResponse.json(reports);
  } catch (err: any) {
    console.error("Sales Report API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch sales reports" },
      { status: 500 }
    );
  }
}
