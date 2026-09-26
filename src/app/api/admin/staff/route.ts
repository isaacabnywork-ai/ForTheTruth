import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, } from "@/lib/adminGuard";
import { getSessionToken } from "@/lib/session";
import { getServerEnv } from "@/config/env";

const WP_ADMIN_ROLES = ["administrator", "shop_manager", "editor"];

// ─── GET — list all admin-level staff ─────────────────────────────────────────
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await getSessionToken();
  const env = getServerEnv();

  // If fallback admin (no real WP token), return just themselves
  if (!token || token.startsWith("admin:") || token.startsWith("google:")) {
    return NextResponse.json({
      users: [
        {
          id: 9999,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          displayName: admin.displayName,
          role: "administrator",
          avatarUrl: admin.avatarUrl ?? "",
          isFallback: true,
        },
      ],
      fallback: true,
    });
  }

  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users?roles=administrator,shop_manager,editor&per_page=100&context=edit`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.message || "Failed to fetch staff from WordPress" },
        { status: res.status }
      );
    }

    const wpUsers = await res.json();
    const users = wpUsers.map((u: {
      id: number;
      name: string;
      email?: string;
      slug?: string;
      roles?: string[];
      avatar_urls?: Record<string, string>;
    }) => ({
      id: u.id,
      email: u.email ?? "",
      firstName: u.name?.split(" ")[0] ?? "",
      lastName: u.name?.split(" ").slice(1).join(" ") ?? "",
      displayName: u.name,
      role: u.roles?.[0] ?? "editor",
      avatarUrl: u.avatar_urls?.["96"] ?? "",
    }));

    return NextResponse.json({ users, fallback: false });
  } catch (err) {
    console.error("[staff GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ─── POST — create a new staff member ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await getSessionToken();
  const env = getServerEnv();

  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const { email, password, firstName, lastName, role } = body;

  // Validate role
  if (role && !WP_ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role. Must be administrator, shop_manager, or editor." }, { status: 400 });
  }

  // If fallback admin (no real WP JWT) — cannot create real WP users
  if (!token || token.startsWith("admin:") || token.startsWith("google:")) {
    return NextResponse.json(
      {
        error:
          "Cannot create real WordPress users while using the fallback login. Please fix your WordPress JWT backend first.",
        fallback: true,
      },
      { status: 503 }
    );
  }

  try {
    const username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") + Math.floor(Math.random() * 1000);
    const res = await fetch(
      `${env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          first_name: firstName ?? "",
          last_name: lastName ?? "",
          name: `${firstName ?? ""} ${lastName ?? ""}`.trim() || username,
          roles: [role ?? "shop_manager"],
        }),
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to create user in WordPress" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        displayName: data.name,
        role: data.roles?.[0] ?? role,
      },
    });
  } catch (err) {
    console.error("[staff POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ─── DELETE — remove staff member ─────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await getSessionToken();
  const env = getServerEnv();

  const { userId } = await req.json().catch(() => ({}));
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  if (!token || token.startsWith("admin:") || token.startsWith("google:")) {
    return NextResponse.json(
      { error: "Cannot delete WordPress users while using the fallback login.", fallback: true },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/${userId}?force=true&reassign=1`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err?.message || "Failed to delete user" }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[staff DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
