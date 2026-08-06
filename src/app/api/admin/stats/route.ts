import { NextResponse } from "next/server";
import { getAdminOverview } from "@/services/admin";

export const revalidate = 0;

export async function GET() {
  try {
    const stats = await getAdminOverview();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve store overview statistics" },
      { status: 500 }
    );
  }
}
