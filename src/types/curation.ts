export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  rating: number;
  audience?: "reader" | "church";
}

export type ShelfDisplayMode = "manual" | "category";

export interface CustomCategoryShelf {
  id: string;
  title: string;
  mode: ShelfDisplayMode;
  bookIds: number[];
  categoryId?: number;
  categorySlug?: string;
  categoryName?: string;
  viewAllHref?: string;
}

export const BUILTIN_CATEGORY_SHELF_IDS = [
  "newArrivalsIds",
  "bibleSpeaksTodayIds",
  "christianLivingIds",
  "ministryIds",
  "theologyIds",
  "bestsellersIds",
] as const;

export function normalizeCategoryShelfOrder(
  order: unknown,
  extraShelves: CustomCategoryShelf[] = []
): string[] {
  const validBuiltins = new Set<string>(BUILTIN_CATEGORY_SHELF_IDS);
  const customKeys = extraShelves.map((s) => `custom:${s.id}`);
  const validCustom = new Set<string>(customKeys);
  const result: string[] = [];
  const seen = new Set<string>();

  if (Array.isArray(order)) {
    for (const raw of order) {
      if (typeof raw !== "string") continue;
      if ((validBuiltins.has(raw) || validCustom.has(raw)) && !seen.has(raw)) {
        seen.add(raw);
        result.push(raw);
      }
    }
  }

  for (const key of BUILTIN_CATEGORY_SHELF_IDS) {
    if (!seen.has(key)) {
      seen.add(key);
      result.push(key);
    }
  }
  for (const key of customKeys) {
    if (!seen.has(key)) {
      seen.add(key);
      result.push(key);
    }
  }

  return result;
}

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

  // 4. Six Homepage Shelves / Categories
  newArrivalsIds: number[];
  newArrivalsTitle?: string;

  bestsellersIds: number[]; // Children books shelf
  bestsellersTitle?: string;
  bestsellersMode?: ShelfDisplayMode;

  bibleSpeaksTodayIds: number[];
  bibleSpeaksTodayTitle?: string;

  christianLivingIds: number[];
  christianLivingTitle?: string;
  christianLivingMode?: ShelfDisplayMode;

  ministryIds: number[];
  ministryTitle?: string;
  ministryMode?: ShelfDisplayMode;

  theologyIds: number[];
  theologyTitle?: string;
  theologyMode?: ShelfDisplayMode;

  // Dynamic extra category shelves (7th, 8th, 9th, ...)
  extraCategoryShelves?: CustomCategoryShelf[];
  categoryShelfOrder?: string[];

  // 5. Testimonials / Reviews
  reviews: TestimonialItem[];
}

export const DEFAULT_REVIEWS: TestimonialItem[] = [
  {
    id: "rev-1",
    quote:
      "The devotionals I ordered changed how I approach my quiet time. Genuinely thoughtful curation — not the usual shelf filler.",
    name: "Priya M.",
    role: "Reader · Chennai",
    rating: 5,
    audience: "reader",
  },
  {
    id: "rev-2",
    quote:
      "We ordered copies for our small groups. Honest, transparent pricing made it affordable for every family, and delivery was quick.",
    name: "Pastor James",
    role: "Grace Church · Bangalore",
    rating: 5,
    audience: "church",
  },
  {
    id: "rev-3",
    quote:
      "Sound theology, fair prices, no gimmicks. This is the bookstore I recommend to everyone in our community.",
    name: "Rev. Maria",
    role: "Youth Ministry · Chennai",
    rating: 5,
    audience: "church",
  },
  {
    id: "rev-4",
    quote:
      "Finding faithful reformed books in India used to be so difficult. For The Truth has made these treasures accessible and affordable.",
    name: "Dr. Samuel K.",
    role: "Theologian · New Delhi",
    rating: 5,
    audience: "reader",
  },
  {
    id: "rev-5",
    quote:
      "Prompt dispatch and great book condition. The children's books have been a huge blessing to our Sunday school kids.",
    name: "Rachel Thomas",
    role: "Sunday School Director · Mumbai",
    rating: 5,
    audience: "church",
  },
];
