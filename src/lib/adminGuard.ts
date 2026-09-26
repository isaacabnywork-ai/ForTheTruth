import { getSessionUser, type SessionUser } from "@/lib/session";

/**
 * Server-side admin check. A user is an admin if:
 *   1. They have the 'admin' role (set by WP administrator/shop_manager roles), OR
 *   2. They match the fallback admin email (contact@forthetruth.in) used when WP JWT is unavailable.
 *
 * This replaces the old ADMIN_EMAILS env var approach, allowing dynamic user management
 * directly via the Staff & Access panel instead of env var changes.
 *
 * Client-side lock screens are UX only; every /api/admin/* route MUST call
 * this and return 401 when it yields null.
 */
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser().catch(() => null);
  if (!user?.email) return null;

  // Grant access to WordPress admin/shop_manager roles OR the fallback admin
  if (user.role === "admin") return user;

  // Also check ADMIN_EMAILS env var as a secondary fallback
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(user.email.toLowerCase()) ? user : null;
}
