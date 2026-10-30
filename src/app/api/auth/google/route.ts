import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE } from "@/lib/session";

const schema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().optional(),
  credential: z.string().optional(), // Google JWT ID Token from One-Tap
}).refine((data) => data.email || data.credential, {
  message: "Either a valid Gmail address or a Google credential token is required",
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid Gmail address or Google credentials are required" }, { status: 400 });
  }

  let email = parsed.data.email || "";
  let firstName = parsed.data.firstName;
  let lastName = parsed.data.lastName;
  let avatarUrl = parsed.data.avatarUrl;

  // If a JWT credential token was passed from Google One-Tap, decode payload
  if (parsed.data.credential && !email) {
    try {
      const payloadBase64 = parsed.data.credential.split(".")[1];
      const decodedJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
      const googleToken = JSON.parse(decodedJson);
      if (googleToken.email) {
        email = googleToken.email;
        firstName = firstName || googleToken.given_name || googleToken.name?.split(" ")[0];
        lastName = lastName || googleToken.family_name || googleToken.name?.split(" ").slice(1).join(" ");
        avatarUrl = avatarUrl || googleToken.picture;
      }
    } catch (e) {
      console.error("Failed to decode Google JWT token:", e);
    }
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid Gmail or Google email address is required" }, { status: 400 });
  }

  // Extract a clean readable name if not explicitly given
  const defaultFirst = email.split("@")[0].replace(/[-_.0-9]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim() || "Google Reader";
  const finalFirst = firstName || defaultFirst;
  const finalLast = lastName || "";
  const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

  // Check Option 1: Is email in ADMIN_EMAILS environment variable?
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const isEnvAdmin = allowed.includes(email.toLowerCase());

  // Calculate stable numeric ID hash for the user
  const idHash = Math.abs(
    email.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  ) % 1000000 || 5001;

  // Check Option 2: Does user have an administrator, shop_manager, or editor role in WordPress?
  let wpRole = "customer";
  let realCustomerId = 0;
  try {
    const { getCustomerByUsernameOrEmail, createCustomer, getCustomerByEmail } = await import("@/services/woocommerce");
    let wcCustomer = await Promise.race([
      getCustomerByUsernameOrEmail(email),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);

    // If customer doesn't exist yet, create them in WooCommerce
    if (!wcCustomer?.id) {
      try {
        const tempPass =
          (typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2) + Date.now().toString(36)) + "!Aa1";
        wcCustomer = await createCustomer({
          email,
          first_name: finalFirst,
          last_name: finalLast,
          password: tempPass,
        });
      } catch {
        // If registration error (e.g. account already exists), query by email
        wcCustomer = await getCustomerByEmail(email).catch(() => null);
      }
    }

    if (wcCustomer?.role) {
      wpRole = wcCustomer.role.toLowerCase();
    }
    if (wcCustomer?.id) {
      realCustomerId = wcCustomer.id;
    }
  } catch {
    /* ignore fallback */
  }

  if (!realCustomerId) {
    realCustomerId = idHash;
  }

  const isWpAdmin = ["administrator", "shop_manager", "editor"].includes(wpRole);
  const finalRole = isEnvAdmin || isWpAdmin ? "admin" : "customer";

  const token = `google:${email}:${finalFirst}:${finalLast}:${realCustomerId}:${finalRole}:${finalAvatar}`;
  
  const user = {
    id: realCustomerId,
    email,
    firstName: finalFirst,
    lastName: finalLast,
    displayName: `${finalFirst} ${finalLast}`.trim(),
    avatarUrl: finalAvatar,
    role: finalRole,
    wpRole,
  };

  const res = NextResponse.json({ ok: true, user });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30-day session for Google sign-in
  });

  return res;
}
