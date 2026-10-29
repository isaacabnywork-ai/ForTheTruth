import fs from "fs";
import path from "path";
import type { MenuItem, SiteMenusConfig } from "@/types/menus";
import { DEFAULT_MENUS_CONFIG } from "@/types/menus";

export type { MenuItem, SiteMenusConfig };
export { DEFAULT_MENUS_CONFIG };

const CONFIG_PRODUCT_ID = 57010;

const globalForMenus = globalThis as unknown as {
  _menusCache?: SiteMenusConfig;
  _lastWcFetchTime?: number;
};

function parseMenus(data: any): SiteMenusConfig {
  if (!data || typeof data !== "object") return DEFAULT_MENUS_CONFIG;
  return {
    announcement: data.announcement ?? DEFAULT_MENUS_CONFIG.announcement,
    headerNav:
      Array.isArray(data.headerNav) && data.headerNav.length > 0
        ? data.headerNav
        : DEFAULT_MENUS_CONFIG.headerNav,
    footerShop:
      Array.isArray(data.footerShop) && data.footerShop.length > 0
        ? data.footerShop
        : DEFAULT_MENUS_CONFIG.footerShop,
    footerCompany:
      Array.isArray(data.footerCompany) && data.footerCompany.length > 0
        ? data.footerCompany
        : DEFAULT_MENUS_CONFIG.footerCompany,
    footerQuick:
      Array.isArray(data.footerQuick) && data.footerQuick.length > 0
        ? data.footerQuick
        : DEFAULT_MENUS_CONFIG.footerQuick,
    contactPhone: data.contactPhone ?? DEFAULT_MENUS_CONFIG.contactPhone,
    contactEmail: data.contactEmail ?? DEFAULT_MENUS_CONFIG.contactEmail,
    copyrightText: data.copyrightText ?? DEFAULT_MENUS_CONFIG.copyrightText,
  };
}

function getReadableLocalMenus(): any {
  // 1. Check /tmp on AWS Lambda
  const tmpPath = path.join("/tmp", "site_menus.json");
  if (fs.existsSync(tmpPath)) {
    try {
      const raw = fs.readFileSync(tmpPath, "utf-8");
      return JSON.parse(raw);
    } catch {}
  }

  // 2. Check bundled source file
  const bundledPath = path.join(process.cwd(), "src", "config", "site_menus.json");
  if (fs.existsSync(bundledPath)) {
    try {
      const raw = fs.readFileSync(bundledPath, "utf-8");
      return JSON.parse(raw);
    } catch {}
  }

  return null;
}

export function getSiteMenusConfig(): SiteMenusConfig {
  if (globalForMenus._menusCache) {
    return globalForMenus._menusCache;
  }
  const local = getReadableLocalMenus();
  if (local) {
    const parsed = parseMenus(local);
    globalForMenus._menusCache = parsed;
    return parsed;
  }
  return DEFAULT_MENUS_CONFIG;
}

export async function fetchSiteMenusConfigFromCloud(): Promise<SiteMenusConfig> {
  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://admin.forthetruth.in";
  const key = process.env.WOOCOMMERCE_API_KEY || "ck_c6693ca02bf0d33b2828f8d311d879be4bf835d5";
  const secret = process.env.WOOCOMMERCE_API_SECRET || "cs_8513b72208ead026d4f6667169466090ccc4f50d";

  try {
    const auth = Buffer.from(`${key}:${secret}`).toString("base64");
    const url = `${wpUrl.replace(/\/$/, "")}/wp-json/wc/v3/products/${CONFIG_PRODUCT_ID}`;
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });
    if (res.ok) {
      const product = await res.json();
      const meta = product.meta_data?.find((m: any) => m.key === "_site_menus");
      if (meta && meta.value) {
        const parsed = parseMenus(typeof meta.value === "string" ? JSON.parse(meta.value) : meta.value);
        globalForMenus._menusCache = parsed;
        globalForMenus._lastWcFetchTime = Date.now();
        try {
          fs.writeFileSync(
            path.join("/tmp", "site_menus.json"),
            JSON.stringify(parsed, null, 2),
            "utf-8"
          );
        } catch {}
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not fetch site menus from cloud, using local fallback", err);
  }

  return getSiteMenusConfig();
}

export async function saveSiteMenusConfig(config: SiteMenusConfig): Promise<void> {
  // 1. Immediately store in memory
  globalForMenus._menusCache = config;

  // 2. Save to /tmp (always writable in AWS Lambda / Amplify)
  try {
    fs.writeFileSync(
      path.join("/tmp", "site_menus.json"),
      JSON.stringify(config, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.warn("Failed to write /tmp/site_menus.json", err);
  }

  // 3. Try to save to bundled source path if writable (e.g. local environment)
  try {
    const bundledPath = path.join(process.cwd(), "src", "config", "site_menus.json");
    const dir = path.dirname(bundledPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(bundledPath, JSON.stringify(config, null, 2), "utf-8");
  } catch {
    // Read-only filesystem on Lambda / AWS Amplify - expected, ignore
  }

  // 4. Persist to WooCommerce database via REST API
  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://admin.forthetruth.in";
  const key = process.env.WOOCOMMERCE_API_KEY || "ck_c6693ca02bf0d33b2828f8d311d879be4bf835d5";
  const secret = process.env.WOOCOMMERCE_API_SECRET || "cs_8513b72208ead026d4f6667169466090ccc4f50d";

  try {
    const auth = Buffer.from(`${key}:${secret}`).toString("base64");
    const url = `${wpUrl.replace(/\/$/, "")}/wp-json/wc/v3/products/${CONFIG_PRODUCT_ID}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta_data: [
          {
            key: "_site_menus",
            value: JSON.stringify(config),
          },
        ],
      }),
    });
    if (!res.ok) {
      console.warn("WooCommerce site menus sync returned status", res.status);
    }
  } catch (err) {
    console.warn("Could not sync site menus to cloud database", err);
  }
}
