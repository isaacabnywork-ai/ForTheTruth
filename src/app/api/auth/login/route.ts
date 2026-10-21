import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, wpLogin } from "@/lib/session";
import { getServerEnv } from "@/config/env";
import { getCustomerByEmail } from "@/services/woocommerce";

const schema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;



  try {
    // Attempt standard WordPress JWT login
    const { token } = await wpLogin(email, password);
    const user = await resolveUser(token, email);
    const res = NextResponse.json({ ok: true, user });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {

    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

async function resolveUser(token: string, fallbackEmail: string) {
  // If native WP login token format: wp:email:firstName:lastName:id:role:avatarUrl
  if (token.startsWith("wp:")) {
    const parts = token.split(":");
    const email = parts[1] || fallbackEmail;
    const firstName = parts[2] || fallbackEmail.split("@")[0];
    const lastName = parts[3] || "";
    const id = parseInt(parts[4] || "1001", 10);
    let role = parts[5] || "customer";
    const avatarUrl =
      parts[6] ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

    // Re-verify against ADMIN_EMAILS environment variable
    const allowed = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (allowed.includes(email.toLowerCase())) {
      role = "admin";
    }

    return {
      id,
      email,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`.trim() || email.split("@")[0],
      avatarUrl,
      role,
    };
  }

  // Otherwise handle JWT or standard WP REST API token
  const env = getServerEnv();
  const res = await fetch(
    `${env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me?context=edit`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  ).catch(() => null);

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!res || !res.ok) {
    const customer = await getCustomerByEmail(fallbackEmail).catch(() => null);
    const isEnvAdmin = allowed.includes(fallbackEmail.toLowerCase());
    const isWpStaff = customer?.role && ["administrator", "shop_manager", "editor"].includes(customer.role.toLowerCase());
    const role = isEnvAdmin || isWpStaff ? "admin" : (customer?.role ?? "customer");

    return {
      id: customer?.id ?? 1001,
      email: fallbackEmail,
      firstName: customer?.first_name || fallbackEmail.split("@")[0],
      lastName: customer?.last_name || "Reader",
      avatarUrl:
        customer?.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fallbackEmail)}`,
      role,
    };
  }

  const wpUser = await res.json();
  const wpEmail = wpUser.email || fallbackEmail;
  const customer = await getCustomerByEmail(wpEmail).catch(() => null);
  const wpRoles = ((wpUser.roles as string[]) || []).map((r: string) => r.toLowerCase());
  const isEnvAdmin = allowed.includes(wpEmail.toLowerCase());
  const isWpStaff =
    wpRoles.some((r: string) => ["administrator", "shop_manager", "editor"].includes(r)) ||
    (customer?.role && ["administrator", "shop_manager", "editor"].includes(customer.role.toLowerCase()));

  const role = isEnvAdmin || isWpStaff ? "admin" : (customer?.role ?? "customer");

  return {
    id: customer?.id ?? wpUser.id ?? 1001,
    email: wpEmail,
    firstName: customer?.first_name ?? wpUser.name?.split(" ")[0] ?? "Reader",
    lastName: customer?.last_name ?? "",
    avatarUrl:
      customer?.avatar_url ??
      wpUser.avatar_urls?.["96"] ??
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(wpEmail)}`,
    role,
  };
}
