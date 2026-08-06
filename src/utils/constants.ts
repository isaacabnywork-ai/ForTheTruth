export const SITE_NAME = "For The Truth";
export const SITE_DESCRIPTION =
  "600+ handpicked Christian books for personal growth and church ministry — Bible study, devotionals, leadership, and more. Fast delivery across India.";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Books", href: "/products", menu: "books" },
  { label: "Authors", href: "/authors" },
  { label: "Church Resources", href: "/church-resources", menu: "church" },
  { label: "About", href: "/about" },
] as const;

/** Church mega menu — "shop by ministry need". */
export const CHURCH_NEEDS = [
  { label: "Small Group Studies", href: "/products?orderby=popularity" },
  { label: "Sunday School & VBS", href: "/products?orderby=date" },
  { label: "Youth Ministry", href: "/categories" },
  { label: "Leadership Training", href: "/categories" },
  { label: "New Believers", href: "/categories" },
  { label: "Sermon Preparation", href: "/categories" },
] as const;

export const CHURCH_SUPPORT = [
  { label: "How Church Orders Work", href: "/church-resources#how" },
  { label: "Delivery Timelines", href: "/church-resources#faq" },
  { label: "Church FAQs", href: "/church-resources#faq" },
  { label: "Talk to Us", href: "/contact" },
] as const;

export const COLLECTIONS = [
  { label: "Bestsellers", href: "/products?orderby=popularity" },
  { label: "New Arrivals", href: "/products?orderby=date" },
  { label: "Top Rated", href: "/products?orderby=rating" },
  { label: "On Sale", href: "/products?on_sale=true" },
  { label: "Pre-orders", href: "/products?availability=preorder" },
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

export const CHURCH_LINKS = [
  { label: "Bulk Orders & Pricing", href: "/church-resources#pricing" },
  { label: "Curriculum Kits", href: "/church-resources#kits" },
  { label: "Small Group Sets", href: "/church-resources#kits" },
  { label: "Request a Quote", href: "/church-resources#quote" },
  { label: "Invoicing & POs", href: "/church-resources#faq" },
] as const;

export const ANNOUNCEMENT =
  "Free shipping over ₹499 · Bulk discounts for churches — up to 30% off";

export const PRODUCTS_PER_PAGE = 20;

/** Trust signals shown above the fold. */
export const READER_TRUST = [
  { title: "600+ Handpicked Titles", detail: "Curated for sound doctrine" },
  { title: "Free Shipping over ₹499", detail: "Dispatched within 24 hours" },
  { title: "Verified Reader Reviews", detail: "Honest ratings, no fluff" },
] as const;

export const CHURCH_TRUST = [
  { title: "Up to 30% Bulk Discount", detail: "On orders of 10+ copies" },
  { title: "Invoicing & Purchase Orders", detail: "For churches and schools" },
  { title: "Curriculum & Group Sets", detail: "Ready-made or custom kits" },
] as const;
