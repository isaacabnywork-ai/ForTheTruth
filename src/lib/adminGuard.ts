import { getSessionUser, type SessionUser } from "@/lib/session";
import { getCustomerByUsernameOrEmail } from "@/services/woocommerce";

export const STAFF_ROLES = ["admin", "administrator", "shop_manager", "editor"];

/**
 * Server-side admin check. Access to the Admin Panel is granted if EITHER:
 *   Option 1: The user's email matches the ADMIN_EMAILS environment variable list, OR
 *   Option 2: The user has a WordPress staff role (administrator, shop_manager, or editor).
 */
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser().catch(() => null);
  if (!user?.email) return null;

  const emailLower = user.email.toLowerCase();

  // Option 1: Check ADMIN_EMAILS environment variable
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (allowed.includes(emailLower)) {
    return { ...user, role: "admin" };
  }

  // Option 2: Check session role (administrator, shop_manager, editor, admin)
  if (user.role && STAFF_ROLES.includes(user.role.toLowerCase())) {
    return user;
  }

  // Option 2 Fallback: Check live WooCommerce / WordPress customer record
  try {
    const wcCustomer = await Promise.race([
      getCustomerByUsernameOrEmail(user.email),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ]);
    if (wcCustomer?.role && STAFF_ROLES.includes(wcCustomer.role.toLowerCase())) {
      return { ...user, role: wcCustomer.role };
    }
  } catch {
    /* ignore network timeout */
  }

  return null;
}
