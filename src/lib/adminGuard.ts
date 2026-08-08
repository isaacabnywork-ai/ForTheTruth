import { getSessionUser, type SessionUser } from "@/lib/session";

/**
 * Server-side admin check. A user is an admin only when they are logged in
 * (valid WP JWT cookie) AND their email is listed in the ADMIN_EMAILS env var
 * (comma-separated). If ADMIN_EMAILS is unset, admin access is denied for
 * everyone — locked by default.
 *
 * Client-side lock screens are UX only; every /api/admin/* route MUST call
 * this and return 401 when it yields null.
 */
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser().catch(() => null);
  if (!user?.email) return null;

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (allowed.length === 0) return null;
  return allowed.includes(user.email.toLowerCase()) ? user : null;
}
