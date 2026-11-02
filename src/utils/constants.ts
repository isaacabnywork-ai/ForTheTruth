export const SITE_NAME = "For The Truth";
export const SITE_DESCRIPTION =
  "Curated Christian books for personal growth and church ministry — Bible study, devotionals, leadership, and more. Fast delivery across India.";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/shop", menu: "books" },
  { label: "All Categories", href: "/categories", menu: "categories" },
  { label: "Free E-Books", href: "/free-ebooks" },
  { label: "About", href: "/about" },
] as const;

export const COLLECTIONS = [
  { label: "Bestsellers", href: "/shop?orderby=popularity" },
  { label: "New Arrivals", href: "/shop?orderby=date" },
  { label: "Top Rated", href: "/shop?orderby=rating" },
  { label: "On Sale", href: "/shop?on_sale=true" },
  { label: "Out of Stock", href: "/shop?availability=outofstock" },
] as const;

/** Fallback topic list — real categories from WooCommerce take precedence. */
export const TOPICS = [
  { label: "Bible Study", slug: "bible-study" },
  { label: "Devotionals", slug: "devotionals" },
  { label: "Leadership", slug: "leadership" },
  { label: "Prayer & Spirituality", slug: "prayer" },
  { label: "Marriage & Parenting", slug: "marriage-parenting" },
  { label: "Youth", slug: "youth" },
  { label: "Children", slug: "children" },
  { label: "Theology", slug: "theology" },
  { label: "Commentaries", slug: "commentaries" },
] as const;

export const ANNOUNCEMENT =
  "Free shipping across India on orders over ₹150 · Sound Christian Books";

export const PRODUCTS_PER_PAGE = 20;

/** Trust signals shown above the fold. */
export const READER_TRUST = [
  { title: "Free Shipping over ₹150", detail: "Dispatched within 24 hours" },
  { title: "Verified Reader Reviews", detail: "Honest ratings, no fluff" },
] as const;
