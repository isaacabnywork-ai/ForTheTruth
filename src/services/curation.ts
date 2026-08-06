import fs from "fs";
import path from "path";

export interface CuratedShelfConfig {
  // 1. Top Hero Section
  heroIds: number[];
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;

  // 2. Spine Bookshelf Slider
  spineIds: number[];
  spineBadge?: string;
  spineTitle?: string;
  spineSubtitle?: string;

  // 3. Editor's Choice Featured Pick
  featuredPickId: number | null;
  featuredBadge?: string;
  featuredTitle?: string;
  featuredSubtitle?: string;

  // 4. Shelves
  newArrivalsIds: number[];
  newArrivalsTitle?: string;
  bestsellersIds: number[];
  bestsellersTitle?: string;
}

const DEFAULT_CONFIG: CuratedShelfConfig = {
  heroIds: [],
  heroBadge: "Independent Christian Bookstore",
  heroTitle: "Happy reading, friend",
  heroSubtitle: "600+ handpicked titles on Bible study, devotion, prayer, and Christian living. Sound doctrine, honest prices, delivered across India.",
  spineIds: [],
  spineBadge: "Browse the shelf",
  spineTitle: "Explore this month's essentials",
  spineSubtitle: "Tap any spine to pull the book off the shelf and see its cover, author, and price — just like browsing in store.",
  featuredPickId: null,
  featuredBadge: "Editor's choice",
  featuredTitle: "This Month's Essential Read",
  featuredSubtitle: "One title we think belongs on every shelf this month — and why.",
  newArrivalsIds: [],
  newArrivalsTitle: "New Arrivals",
  bestsellersIds: [],
  bestsellersTitle: "Bestsellers",
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
      heroIds: Array.isArray(data.heroIds) ? data.heroIds.map(Number) : DEFAULT_CONFIG.heroIds,
      heroBadge: data.heroBadge ?? DEFAULT_CONFIG.heroBadge,
      heroTitle: data.heroTitle ?? DEFAULT_CONFIG.heroTitle,
      heroSubtitle: data.heroSubtitle ?? DEFAULT_CONFIG.heroSubtitle,

      spineIds: Array.isArray(data.spineIds) ? data.spineIds.map(Number) : DEFAULT_CONFIG.spineIds,
      spineBadge: data.spineBadge ?? DEFAULT_CONFIG.spineBadge,
      spineTitle: data.spineTitle ?? DEFAULT_CONFIG.spineTitle,
      spineSubtitle: data.spineSubtitle ?? DEFAULT_CONFIG.spineSubtitle,

      featuredPickId: typeof data.featuredPickId === "number" ? data.featuredPickId : (data.featuredPickId === null ? null : DEFAULT_CONFIG.featuredPickId),
      featuredBadge: data.featuredBadge ?? DEFAULT_CONFIG.featuredBadge,
      featuredTitle: data.featuredTitle ?? DEFAULT_CONFIG.featuredTitle,
      featuredSubtitle: data.featuredSubtitle ?? DEFAULT_CONFIG.featuredSubtitle,

      newArrivalsIds: Array.isArray(data.newArrivalsIds) ? data.newArrivalsIds.map(Number) : DEFAULT_CONFIG.newArrivalsIds,
      newArrivalsTitle: data.newArrivalsTitle ?? DEFAULT_CONFIG.newArrivalsTitle,
      bestsellersIds: Array.isArray(data.bestsellersIds) ? data.bestsellersIds.map(Number) : DEFAULT_CONFIG.bestsellersIds,
      bestsellersTitle: data.bestsellersTitle ?? DEFAULT_CONFIG.bestsellersTitle,
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
