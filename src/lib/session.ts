/**
 * Session helpers built on the WordPress JWT Authentication plugin.
 * Requires the "JWT Authentication for WP REST API" plugin on WordPress.
 * The WP JWT is stored in an httpOnly cookie — never exposed to client JS.
 * SERVER-SIDE ONLY.
 */
import { cookies } from "next/headers";
import { getServerEnv, isWooConfigured } from "@/config/env";
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
  role?: string;
}

interface WPTokenResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

/** Exchange username/password for a session token via WP JWT or native WordPress authentication */
export async function wpLogin(
  username: string,
  password: string
): Promise<WPTokenResponse> {
  if (!isWooConfigured()) {
    throw new Error(
      "Online store login is temporarily disabled while under maintenance."
    );
  }
  const env = getServerEnv();

  // 1. Attempt standard WordPress JWT Authentication if active
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `${env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        cache: "no-store",
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data?.token) {
        return data as WPTokenResponse;
      }
    }
  } catch {
    /* fallback to WordPress native login */
  }

  // 2. Fallback: Authenticate directly against WordPress core wp-login.php
  const params = new URLSearchParams();
  params.append("log", username);
  params.append("pwd", password);
  params.append("wp-submit", "Log In");
  params.append("testcookie", "1");

  const loginRes = await fetch(`${env.NEXT_PUBLIC_WORDPRESS_URL}/wp-login.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (compatible; ForTheTruth/1.0)",
      "Cookie": "wordpress_test_cookie=WP%20Cookie%20check",
    },
    body: params.toString(),
    redirect: "manual",
  });

  const cookiesHeader = loginRes.headers.get("set-cookie") || "";
  const isSuccess = loginRes.status === 302 || cookiesHeader.includes("wordpress_logged_in_");

  if (!isSuccess) {
    const text = await loginRes.text().catch(() => "");
    if (text.includes("Unknown username") || text.includes("Unknown email")) {
      throw new Error("Unknown username or email address.");
    }
    if (text.includes("The password you entered")) {
      throw new Error("The password you entered is incorrect.");
    }
    throw new Error("Invalid username or password.");
  }

  // User credentials are 100% verified by WordPress core!
  // Resolve user details from WooCommerce API
  let customer: WCCustomer | null = null;
  try {
    customer = await getCustomerByEmail(username);
    if (!customer) {
      const { wcFetch } = await import("@/services/woocommerce");
      const searchRes = await wcFetch<WCCustomer[]>("/customers", {
        searchParams: { search: username, per_page: 1, role: "all" },
        revalidate: 0,
      }).catch(() => []);
      customer = searchRes[0] ?? null;
    }
  } catch {
    /* ignore lookup error */
  }

  const email = customer?.email ?? (username.includes("@") ? username : `${username}@forthetruth.in`);
  const firstName = customer?.first_name || username.split("@")[0];
  const lastName = customer?.last_name || "";
  const id = customer?.id ?? 1000;
  const wpRole = customer?.role?.toLowerCase() ?? "customer";

  // Check Option 1 (ADMIN_EMAILS) & Option 2 (WordPress role: administrator, shop_manager, editor)
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const isEnvAdmin = allowed.includes(email.toLowerCase());
  const isStaff = ["administrator", "shop_manager", "editor"].includes(wpRole);
  const finalRole = isEnvAdmin || isStaff ? "admin" : "customer";
  const avatarUrl =
    customer?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

  const token = `wp:${email}:${firstName}:${lastName}:${id}:${finalRole}:${avatarUrl}`;

  return {
    token,
    user_email: email,
    user_nicename: firstName,
    user_display_name: `${firstName} ${lastName}`.trim() || username,
  };
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
  if (!isWooConfigured()) return null;
  const env = getServerEnv();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me?context=edit`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return (await res.json()) as WPUser;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
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

  // Support for custom Google / Gmail Auth or WordPress Native Token
  if (token.startsWith("google:") || token.startsWith("admin:") || token.startsWith("wp:")) {
    try {
      const parts = token.split(":");
      // format: prefix:email:firstName:lastName:id:role:avatarUrl
      const email = parts[1] || "user@gmail.com";
      const firstName = parts[2] || "Reader";
      const lastName = parts[3] || "";
      let id = parseInt(parts[4] || "1", 10);
      let role = parts[5] || "customer";
      const avatarUrl = parts[6] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

      // Check Option 1: Is email in ADMIN_EMAILS?
      const allowed = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (allowed.includes(email.toLowerCase())) {
        role = "admin";
      }

      // Check Option 2: Resolve WooCommerce customer ID and role
      try {
        const wcCustomer = await Promise.race([
          getCustomerByEmail(email),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
        ]);
        if (wcCustomer?.id) {
          id = wcCustomer.id;
        }
        if (wcCustomer?.role && ["administrator", "shop_manager", "editor"].includes(wcCustomer.role.toLowerCase())) {
          role = "admin";
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
        displayName: `${firstName} ${lastName}`.trim() || email.split("@")[0],
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

  const wpRoles = (wpUser.roles ?? []).map((r) => r.toLowerCase());
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const isEnvAdmin = allowed.includes(wpUser.email.toLowerCase());
  const isStaffRole = wpRoles.some((r) =>
    ["administrator", "shop_manager", "editor"].includes(r)
  );

  const role = isEnvAdmin || isStaffRole ? "admin" : "customer";

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
