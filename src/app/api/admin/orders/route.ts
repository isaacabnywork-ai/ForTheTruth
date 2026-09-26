import { NextRequest, NextResponse } from "next/server";
import { fetchAllOrders } from "@/services/admin";

export const revalidate = 0;

export async function GET(req: NextRequest) {
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
