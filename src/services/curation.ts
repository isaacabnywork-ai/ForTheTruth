import fs from "fs";
import path from "path";
import type { TestimonialItem, CuratedShelfConfig } from "@/types/curation";
import { DEFAULT_REVIEWS } from "@/types/curation";

export type { TestimonialItem, CuratedShelfConfig };
export { DEFAULT_REVIEWS };

const CONFIG_PRODUCT_ID = 57010;

const DEFAULT_CONFIG: CuratedShelfConfig = {
  heroIds: [47592, 46237, 48904],
  heroBadge: "",
  heroTitle: "Buy Christian Books Online in India for Spiritual Growth",
  heroSubtitle: "",
  spineIds: [44799, 44806, 44803, 44796, 44808, 44812, 48904, 44793, 39064, 45466],
  spineBadge: "Browse the shelf",
  spineTitle: "Explore Children Books",
  spineSubtitle:
    "Tap any spine to pull the book off the shelf and see its cover, author, and price — just like browsing in store.",
  featuredPickId: 44812,
  featuredBadge: "Editor's choice",
  featuredTitle: "This Month's Essential Read",
  featuredSubtitle:
    "One title we think belongs on every shelf this month — and why.",
  newArrivalsIds: [56886, 56883, 56874, 53118, 53116, 53106],
  newArrivalsTitle: "New Arrivals",
  bestsellersIds: [35262, 13148, 12833, 34468, 35647, 20507],
  bestsellersTitle: "Children Books",
  bestsellersMode: "category",

  bibleSpeaksTodayIds: [36313, 36309, 36306, 36302, 36294, 36285],
  bibleSpeaksTodayTitle: "The Bible Speaks Today",

  christianLivingIds: [38336, 31266, 46237, 38662, 4793, 53424],
  christianLivingTitle: "Christian Living",
  christianLivingMode: "category",

  ministryIds: [44354, 14694, 22394, 14678, 14669, 4958],
  ministryTitle: "Ministry",
  ministryMode: "category",

  theologyIds: [31091, 31117, 31424, 52810, 31100, 31155],
  theologyTitle: "Theology",
  theologyMode: "category",

  reviews: DEFAULT_REVIEWS,
};

const globalForCurated = globalThis as unknown as {
  _curatedCache?: CuratedShelfConfig;
  _lastWcFetchTime?: number;
};

function parseConfig(data: any): CuratedShelfConfig {
  if (!data || typeof data !== "object") return DEFAULT_CONFIG;
  return {
    heroIds: Array.isArray(data.heroIds)
      ? data.heroIds.map(Number)
      : DEFAULT_CONFIG.heroIds,
    heroBadge: data.heroBadge ?? DEFAULT_CONFIG.heroBadge,
    heroTitle: data.heroTitle ?? DEFAULT_CONFIG.heroTitle,
    heroSubtitle: data.heroSubtitle ?? DEFAULT_CONFIG.heroSubtitle,

    spineIds: Array.isArray(data.spineIds)
      ? data.spineIds.map(Number)
      : DEFAULT_CONFIG.spineIds,
    spineBadge: data.spineBadge ?? DEFAULT_CONFIG.spineBadge,
    spineTitle: data.spineTitle ?? DEFAULT_CONFIG.spineTitle,
    spineSubtitle: data.spineSubtitle ?? DEFAULT_CONFIG.spineSubtitle,

    featuredPickId:
      typeof data.featuredPickId === "number"
        ? data.featuredPickId
        : data.featuredPickId === null
        ? null
        : DEFAULT_CONFIG.featuredPickId,
    featuredBadge: data.featuredBadge ?? DEFAULT_CONFIG.featuredBadge,
    featuredTitle: data.featuredTitle ?? DEFAULT_CONFIG.featuredTitle,
    featuredSubtitle: data.featuredSubtitle ?? DEFAULT_CONFIG.featuredSubtitle,

    newArrivalsIds: Array.isArray(data.newArrivalsIds)
      ? data.newArrivalsIds.map(Number)
      : DEFAULT_CONFIG.newArrivalsIds,
    newArrivalsTitle:
      data.newArrivalsTitle ?? DEFAULT_CONFIG.newArrivalsTitle,
    bestsellersIds: Array.isArray(data.bestsellersIds)
      ? data.bestsellersIds.map(Number)
      : DEFAULT_CONFIG.bestsellersIds,
    bestsellersTitle:
      data.bestsellersTitle ?? DEFAULT_CONFIG.bestsellersTitle,
    bestsellersMode:
      data.bestsellersMode === "manual" ? "manual" : "category",

    bibleSpeaksTodayIds: Array.isArray(data.bibleSpeaksTodayIds)
      ? data.bibleSpeaksTodayIds.map(Number)
      : DEFAULT_CONFIG.bibleSpeaksTodayIds,
    bibleSpeaksTodayTitle:
      data.bibleSpeaksTodayTitle ?? DEFAULT_CONFIG.bibleSpeaksTodayTitle,

    christianLivingIds: Array.isArray(data.christianLivingIds)
      ? data.christianLivingIds.map(Number)
      : DEFAULT_CONFIG.christianLivingIds,
    christianLivingTitle:
      data.christianLivingTitle ?? DEFAULT_CONFIG.christianLivingTitle,
    christianLivingMode:
      data.christianLivingMode === "manual" ? "manual" : "category",

    ministryIds: Array.isArray(data.ministryIds)
      ? data.ministryIds.map(Number)
      : DEFAULT_CONFIG.ministryIds,
    ministryTitle: data.ministryTitle ?? DEFAULT_CONFIG.ministryTitle,
    ministryMode:
      data.ministryMode === "manual" ? "manual" : "category",

    theologyIds: Array.isArray(data.theologyIds)
      ? data.theologyIds.map(Number)
      : DEFAULT_CONFIG.theologyIds,
    theologyTitle: data.theologyTitle ?? DEFAULT_CONFIG.theologyTitle,
    theologyMode:
      data.theologyMode === "manual" ? "manual" : "category",

    reviews:
      Array.isArray(data.reviews) && data.reviews.length > 0
        ? data.reviews
        : DEFAULT_CONFIG.reviews,
  };
}

function getReadableLocalData(): any {
  // 1. Check /tmp on AWS Lambda
  const tmpPath = path.join("/tmp", "curated_shelves.json");
  if (fs.existsSync(tmpPath)) {
    try {
      const raw = fs.readFileSync(tmpPath, "utf-8");
      return JSON.parse(raw);
    } catch {}
  }

  // 2. Check bundled source file
  const bundledPath = path.join(process.cwd(), "src", "config", "curated_shelves.json");
  if (fs.existsSync(bundledPath)) {
    try {
      const raw = fs.readFileSync(bundledPath, "utf-8");
      return JSON.parse(raw);
    } catch {}
  }

  return null;
}

export function getCuratedShelfConfig(): CuratedShelfConfig {
  if (globalForCurated._curatedCache) {
    return globalForCurated._curatedCache;
  }
  const local = getReadableLocalData();
  if (local) {
    const parsed = parseConfig(local);
    globalForCurated._curatedCache = parsed;
    return parsed;
  }
  return DEFAULT_CONFIG;
}

export async function fetchCuratedShelfConfigFromCloud(): Promise<CuratedShelfConfig> {
  const now = Date.now();
  // Return in-memory cache immediately if fetched within the last 3 minutes
  if (
    globalForCurated._curatedCache &&
    globalForCurated._lastWcFetchTime &&
    now - globalForCurated._lastWcFetchTime < 180000
  ) {
    return globalForCurated._curatedCache;
  }

  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://admin.forthetruth.in";
  const key = process.env.WOOCOMMERCE_API_KEY || "ck_c6693ca02bf0d33b2828f8d311d879be4bf835d5";
  const secret = process.env.WOOCOMMERCE_API_SECRET || "cs_8513b72208ead026d4f6667169466090ccc4f50d";

  try {
    const auth = Buffer.from(`${key}:${secret}`).toString("base64");
    const url = `${wpUrl.replace(/\/$/, "")}/wp-json/wc/v3/products/${CONFIG_PRODUCT_ID}`;
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (res.ok) {
      const product = await res.json();
      const meta = product.meta_data?.find((m: any) => m.key === "_curated_shelves");
      if (meta && meta.value) {
        const parsed = parseConfig(typeof meta.value === "string" ? JSON.parse(meta.value) : meta.value);
        globalForCurated._curatedCache = parsed;
        globalForCurated._lastWcFetchTime = Date.now();
        try {
          fs.writeFileSync(
            path.join("/tmp", "curated_shelves.json"),
            JSON.stringify(parsed, null, 2),
            "utf-8"
          );
        } catch {}
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not fetch curated config from cloud, using local fallback", err);
  }

  return getCuratedShelfConfig();
}

export async function saveCuratedShelfConfig(config: CuratedShelfConfig): Promise<void> {
  // 1. Immediately store in memory cache
  globalForCurated._curatedCache = config;

  // 2. Save to /tmp (always writable in AWS Lambda / Amplify)
  try {
    fs.writeFileSync(
      path.join("/tmp", "curated_shelves.json"),
      JSON.stringify(config, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.warn("Failed to write /tmp/curated_shelves.json", err);
  }

  // 3. Try to save to bundled source path if writable (e.g. local environment)
  try {
    const bundledPath = path.join(process.cwd(), "src", "config", "curated_shelves.json");
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
            key: "_curated_shelves",
            value: JSON.stringify(config),
          },
        ],
      }),
    });
    if (!res.ok) {
      console.warn("WooCommerce config sync returned status", res.status);
    }
  } catch (err) {
    console.warn("Could not sync curated shelves to cloud database", err);
  }
}
