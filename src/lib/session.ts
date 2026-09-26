/**
 * Session helpers built on the WordPress JWT Authentication plugin.
 * Requires the "JWT Authentication for WP REST API" plugin on WordPress.
 * The WP JWT is stored in an httpOnly cookie — never exposed to client JS.
 * SERVER-SIDE ONLY.
 */
import { cookies } from "next/headers";
import { getServerEnv } from "@/config/env";
import { getCustomerByEmail, type WCCustomer } from "@/services/woocommerce";

export const SESSION_COOKIE = "ftt_token";

export interface SessionUser {
  id: number; // WooCommerce customer id
  wpUserId: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
}

interface WPTokenResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

/** Exchange username/password for a WP JWT. Throws on bad credentials. */
export async function wpLogin(
  username: string,
  password: string
): Promise<WPTokenResponse> {
  const env = getServerEnv();
  const res = await fetch(
    `${env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    }
  );
  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(
      data?.message?.replace(/<[^>]+>/g, "") || "Invalid email or password"
    );
  }
  return data as WPTokenResponse;
}

interface WPUser {
  id: number;
  name: string;
  email?: string;
  avatar_urls?: Record<string, string>;
  roles?: string[];
}

/** Fetch the WP user for a token. Returns null if the token is invalid. */
async function wpGetUser(token: string): Promise<WPUser | null> {
  const env = getServerEnv();
  const res = await fetch(
    `${env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me?context=edit`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  if (!res.ok) return null;
  return (await res.json()) as WPUser;
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Resolve the current session to a user (WP identity + WC customer record or custom Google/Gmail Profile).
 * Returns null when logged out or the token expired.
 */
export async function getSessionUser(): Promise<SessionUser & { role?: string } | null> {
  const token = await getSessionToken();
  if (!token) return null;

  // Support for custom Google / Gmail Auth
  if (token.startsWith("google:") || token.startsWith("admin:")) {
    try {
      const parts = token.split(":");
      // format: prefix:email:firstName:lastName:id:role:avatarUrl
      const email = parts[1] || "user@gmail.com";
      const firstName = parts[2] || "Reader";
      const lastName = parts[3] || "";
      let id = parseInt(parts[4] || "1", 10);
      const role = parts[5] || "customer";
      const avatarUrl = parts[6] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

      // Resolve real WooCommerce customer ID by email if available
      try {
        const wcCustomer = await getCustomerByEmail(email);
        if (wcCustomer?.id) {
          id = wcCustomer.id;
        }
      } catch {
        /* fallback to token id */
      }

      return {
        id,
        wpUserId: id,
        email,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`.trim(),
        avatarUrl,
        role,
      };
    } catch {
      return null;
    }
  }

  const wpUser = await wpGetUser(token);
  if (!wpUser?.email) return null;

  let customer: WCCustomer | null = null;
  try {
    customer = await getCustomerByEmail(wpUser.email);
  } catch {
    /* customer record optional */
  }

  const wpRoles = wpUser.roles ?? [];
  const role = wpRoles.some((r) =>
    ["administrator", "shop_manager"].includes(r)
  )
    ? "admin"
    : "customer";

  return {
    id: customer?.id ?? wpUser.id,
    wpUserId: wpUser.id,
    email: wpUser.email,
    firstName: customer?.first_name ?? wpUser.name.split(" ")[0] ?? "",
    lastName: customer?.last_name ?? "",
    displayName: wpUser.name,
    avatarUrl: customer?.avatar_url ?? wpUser.avatar_urls?.["96"],
    role,
  };
}
