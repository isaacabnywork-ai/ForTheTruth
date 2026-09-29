import { z } from "zod";

/**
 * Maintenance mode toggle.
 * When set to true (or when DISABLE_WOOCOMMERCE is set in env), all external
 * WordPress/WooCommerce API calls are bypassed immediately with zero network latency.
 * Offline services, Supabase database, and AIPC POS continue working smoothly.
 */
export const WOOCOMMERCE_MAINTENANCE_MODE = false;

/**
 * Server-side env validation. Import ONLY from server code
 * (services, route handlers, server components).
 */
const serverSchema = z.object({
  NEXT_PUBLIC_WORDPRESS_URL: z.string().url(),
  WOOCOMMERCE_API_KEY: z.string().min(1),
  WOOCOMMERCE_API_SECRET: z.string().min(1),
});

export function getServerEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Missing/invalid environment variables: ${parsed.error.issues
        .map((i) => i.path.join("."))
        .join(", ")} — copy .env.example to .env.local and fill it in.`
    );
  }
  return parsed.data;
}

export function isWooConfigured(): boolean {
  if (process.env.ENABLE_WOOCOMMERCE === "true") {
    return serverSchema.safeParse(process.env).success;
  }
  if (
    process.env.DISABLE_WOOCOMMERCE === "true" ||
    process.env.DISABLE_WOOCOMMERCE_API === "true" ||
    WOOCOMMERCE_MAINTENANCE_MODE
  ) {
    return false;
  }
  return serverSchema.safeParse(process.env).success;
}

