import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import {
  getStaffMembers,
  createStaffCustomer,
  deleteStaffCustomer,
} from "@/services/woocommerce";

export const dynamic = "force-dynamic";

// ─── GET — list all admin-level staff from WP + env ─────────────────────────
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const users = await getStaffMembers();
    return NextResponse.json({ users, fallback: false });
  } catch (err) {
    console.error("[staff GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ─── POST — create a new staff member in WordPress ──────────────────────────
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const { email, password, firstName, lastName, role } = body;

  const validRole = (["administrator", "shop_manager", "editor"].includes(role)
    ? role
    : "shop_manager") as "administrator" | "shop_manager" | "editor";

  try {
    const newCustomer = await createStaffCustomer({
      email,
      first_name: firstName ?? "",
      last_name: lastName ?? "",
      role: validRole,
      password,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newCustomer.id,
        email: newCustomer.email,
        displayName:
          `${newCustomer.first_name || ""} ${newCustomer.last_name || ""}`.trim() ||
          newCustomer.email.split("@")[0],
        role: newCustomer.role || validRole,
      },
    });
  } catch (err) {
    console.error("[staff POST]", err);
    const msg = err instanceof Error ? err.message : "Failed to create staff in WordPress";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─── DELETE — remove staff member from WordPress ────────────────────────────
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await req.json().catch(() => ({}));
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const numericId = Number(userId);
  if (numericId >= 9000) {
    return NextResponse.json(
      {
        error:
          "This admin account is defined in your environment variables (ADMIN_EMAILS) and cannot be deleted via the database. To remove it, update your environment configuration.",
      },
      { status: 400 }
    );
  }

  try {
    await deleteStaffCustomer(numericId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[staff DELETE]", err);
    const msg = err instanceof Error ? err.message : "Failed to delete user";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
