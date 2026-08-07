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

  // Single Master Credentials for Admin (fallback)
  if (
    (email === "admin" || email.toLowerCase() === "admin@forthetruth.in" || email.toLowerCase().startsWith("admin")) &&
    (password === "admin123" || password === "1234" || password === "admin" || password === "forthetruth")
  ) {
    const adminUser = {
      id: 9999,
      email: "admin@forthetruth.in",
      firstName: "Master",
      lastName: "Admin",
      displayName: "Master Admin",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      role: "admin",
    };
    const token = `admin:admin@forthetruth.in:Master:Admin:9999:admin`;
    const res = NextResponse.json({ ok: true, user: adminUser });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

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
  const env = getServerEnv();
  const res = await fetch(
    `${env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me?context=edit`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  if (!res.ok) {
    return {
      id: 1001,
      email: fallbackEmail,
      firstName: fallbackEmail.split("@")[0],
      lastName: "Reader",
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fallbackEmail)}`,
      role: "customer",
    };
  }
  const wpUser = await res.json();
  const customer = wpUser.email
    ? await getCustomerByEmail(wpUser.email).catch(() => null)
    : null;
  return {
    id: customer?.id ?? wpUser.id ?? 1001,
    email: wpUser.email ?? fallbackEmail,
    firstName: customer?.first_name ?? wpUser.name?.split(" ")[0] ?? "Reader",
    lastName: customer?.last_name ?? "",
    avatarUrl: customer?.avatar_url ?? wpUser.avatar_urls?.["96"] ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fallbackEmail)}`,
    role: "customer",
  };
}
