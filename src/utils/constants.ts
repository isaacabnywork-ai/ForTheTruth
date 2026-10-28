export const SITE_NAME = "For The Truth";
export const SITE_DESCRIPTION =
  "Curated Christian books for personal growth and church ministry — Bible study, devotionals, leadership, and more. Fast delivery across India.";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Books", href: "/products", menu: "books" },
  { label: "All Categories", href: "/categories", menu: "categories" },
  { label: "Free E-Books", href: "/free-ebooks" },
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
  { label: "Out of Stock", href: "/products?availability=outofstock" },
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
  { label: "Curriculum Kits", href: "/church-resources#kits" },
  { label: "Small Group Sets", href: "/church-resources#kits" },
  { label: "Study Guides", href: "/products?orderby=popularity" },
  { label: "Invoicing & POs", href: "/church-resources#faq" },
] as const;

export const ANNOUNCEMENT =
  "Free shipping across India on orders over ₹150 · Sound Christian Books";

export const PRODUCTS_PER_PAGE = 20;

/** Trust signals shown above the fold. */
export const READER_TRUST = [
  { title: "Free Shipping over ₹150", detail: "Dispatched within 24 hours" },
  { title: "Verified Reader Reviews", detail: "Honest ratings, no fluff" },
] as const;

export const CHURCH_TRUST = [
  { title: "Curated for Congregations", detail: "Sound doctrine for whole groups" },
  { title: "Invoicing & Purchase Orders", detail: "For churches and schools" },
  { title: "Curriculum & Group Sets", detail: "Ready-made or custom kits" },
] as const;
