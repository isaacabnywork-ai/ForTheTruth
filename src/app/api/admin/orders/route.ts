import { NextRequest, NextResponse } from "next/server";
import { fetchAllOrders } from "@/services/admin";
import { requireAdmin } from "@/lib/adminGuard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const status = req.nextUrl.searchParams.get("status") || "all";
    const orders = await fetchAllOrders(status);
    return NextResponse.json({ orders });
  } catch (error: unknown) {
    console.error("Failed to fetch orders ledger:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to query orders ledger" },
      { status: 500 }
    );
  }
}
