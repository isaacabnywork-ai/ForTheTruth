import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { getAllCustomersPaged } from "@/services/woocommerce";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || undefined;

  try {
    const customersData = await getAllCustomersPaged(page, search);
    return NextResponse.json(customersData);
  } catch (err: any) {
    console.error("Customers API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
