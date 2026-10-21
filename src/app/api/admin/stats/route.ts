import { NextResponse } from "next/server";
import { getAdminOverview } from "@/services/admin";
import { requireAdmin } from "@/lib/adminGuard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const stats = await getAdminOverview();
    return NextResponse.json(stats);
  } catch (error: unknown) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to retrieve store overview statistics" },
      { status: 500 }
    );
  }
}
