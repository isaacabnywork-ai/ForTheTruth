export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  rating: number;
  audience?: "reader" | "church";
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

  bibleSpeaksTodayIds: number[];
  bibleSpeaksTodayTitle?: string;

  christianLivingIds: number[];
  christianLivingTitle?: string;

  ministryIds: number[];
  ministryTitle?: string;

  theologyIds: number[];
  theologyTitle?: string;

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
