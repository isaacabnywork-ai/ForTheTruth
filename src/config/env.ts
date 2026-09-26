import { z } from "zod";

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
  return serverSchema.safeParse(process.env).success;
}
