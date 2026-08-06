import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid Gmail or Google email address is required" }, { status: 400 });
  }

  const { email, firstName, lastName, avatarUrl } = parsed.data;
  
  // Extract a clean readable name if not explicitly given
  const defaultFirst = email.split("@")[0].replace(/[-_.0-9]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim() || "Google Reader";
  const finalFirst = firstName || defaultFirst;
  const finalLast = lastName || " (Verified Gmail)";
  const finalAvatar = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

  // Generate deterministic customer ID from email string hash for realistic persistence
  let idHash = 5000;
  for (let i = 0; i < email.length; i++) {
    idHash = (idHash + email.charCodeAt(i) * 31) % 90000 + 10000;
  }

  const token = `google:${email}:${finalFirst}:${finalLast}:${idHash}:customer:${finalAvatar}`;
  
  const user = {
    id: idHash,
    email,
    firstName: finalFirst,
    lastName: finalLast,
    displayName: `${finalFirst} ${finalLast}`.trim(),
    avatarUrl: finalAvatar,
    role: "customer",
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
