import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";

/** Lets the admin UI know whether the current session has admin rights. */
export async function GET() {
  const admin = await requireAdmin();
  return NextResponse.json({
    isAdmin: !!admin,
    email: admin?.email ?? null,
    name: admin ? `${admin.firstName} ${admin.lastName}`.trim() : null,
  });
}
