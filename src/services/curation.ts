import fs from "fs";
import path from "path";
import type { TestimonialItem, CuratedShelfConfig } from "@/types/curation";
import { DEFAULT_REVIEWS } from "@/types/curation";

export type { TestimonialItem, CuratedShelfConfig };
export { DEFAULT_REVIEWS };

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

  bibleSpeaksTodayIds: [36313, 36309, 36306, 36302, 36294, 36285],
  bibleSpeaksTodayTitle: "The Bible Speaks Today",

  christianLivingIds: [38336, 31266, 46237, 38662, 4793, 53424],
  christianLivingTitle: "Christian Living",

  ministryIds: [44354, 14694, 22394, 14678, 14669, 4958],
  ministryTitle: "Ministry",

  theologyIds: [31091, 31117, 31424, 52810, 31100, 31155],
  theologyTitle: "Theology",

  reviews: DEFAULT_REVIEWS,
};

function getConfigPath() {
  return path.join(process.cwd(), "src", "config", "curated_shelves.json");
}

export function getCuratedShelfConfig(): CuratedShelfConfig {
  try {
    const filePath = getConfigPath();
    if (!fs.existsSync(filePath)) {
      return DEFAULT_CONFIG;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
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

      ministryIds: Array.isArray(data.ministryIds)
        ? data.ministryIds.map(Number)
        : DEFAULT_CONFIG.ministryIds,
      ministryTitle: data.ministryTitle ?? DEFAULT_CONFIG.ministryTitle,

      theologyIds: Array.isArray(data.theologyIds)
        ? data.theologyIds.map(Number)
        : DEFAULT_CONFIG.theologyIds,
      theologyTitle: data.theologyTitle ?? DEFAULT_CONFIG.theologyTitle,

      reviews:
        Array.isArray(data.reviews) && data.reviews.length > 0
          ? data.reviews
          : DEFAULT_CONFIG.reviews,
    };
  } catch (err) {
    console.error("Failed to read curated_shelves.json, using fallback", err);
    return DEFAULT_CONFIG;
  }
}

export function saveCuratedShelfConfig(config: CuratedShelfConfig): void {
  try {
    const filePath = getConfigPath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save curated_shelves.json", err);
    throw new Error("Unable to persist shelf curation configuration.");
  }
}
