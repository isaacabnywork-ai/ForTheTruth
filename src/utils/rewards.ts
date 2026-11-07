export interface RewardTier {
  threshold: number;
  productId: number;
  title: string;
  shortTitle: string;
  image: string;
  slug: string;
}

export const REWARD_TIERS: readonly RewardTier[] = [
  {
    threshold: 700,
    productId: 35470,
    title: "What the Bible teaches about the Trinity",
    shortTitle: "What the Bible teaches about the Trinity",
    image:
      "/wp-content/uploads/2023/06/what-the-bible-teaches-about-the-trinity.jpg",
    slug: "what-the-bible-teaches-about-the-trinity",
  },
  {
    threshold: 1000,
    productId: 35474,
    title: "What the Bible Teaches About the Person of Christ",
    shortTitle: "What the Bible Teaches About the Person of Christ",
    image:
      "/wp-content/uploads/2023/06/what-the-bible-teaches-about-the-person-of-christ.jpg",
    slug: "the-person-of-christ",
  },
  {
    threshold: 1400,
    productId: 35463,
    title: "Preaching Pure and Simple",
    shortTitle: "Preaching Pure and Simple",
    image:
      "/wp-content/uploads/2023/06/preaching.jpg",
    slug: "preaching-pure-and-simple",
  },
  {
    threshold: 2000,
    productId: 54218,
    title:
      "The Nicene Creed: What You Need to Know about the Most Important Creed Ever Written",
    shortTitle: "The Nicene Creed",
    image:
      "/wp-content/uploads/2025/10/The-Nicene-Creed-.jpg",
    slug: "the-nicene-creed",
  },
] as const;

export const MAX_REWARD_THRESHOLD = 2000;

// Offer ended
export const REWARD_OFFER_ACTIVE = false;

export function getUnlockedRewards(subtotal: number): RewardTier[] {
  if (!REWARD_OFFER_ACTIVE) return [];
  return REWARD_TIERS.filter((t) => subtotal >= t.threshold);
}

export function getNextReward(subtotal: number): RewardTier | null {
  if (!REWARD_OFFER_ACTIVE) return null;
  return REWARD_TIERS.find((t) => subtotal < t.threshold) ?? null;
}
