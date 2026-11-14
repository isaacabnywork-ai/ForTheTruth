import type { Metadata } from "next";
import Link from "next/link";
import { isWooConfigured } from "@/config/env";
import { StoreMaintenancePage } from "@/components/common/StoreMaintenancePage";
import { getCategories, getAllProducts } from "@/services/woocommerce";
import type { WCCategory, Product } from "@/types/product";
import { formatCategoryName } from "@/utils/text";
import { toCdnImageUrl } from "@/utils/imageUrl";

export const revalidate = 3600;

/**
 * =============================================================================
 * CHRISTMAS CATEGORY HIGHLIGHT TOGGLE:
 * - Set SHOW_CHRISTMAS_CATEGORY_HIGHLIGHT = true during the holiday sale
 *   to make the Christmas Sale! category box 4x size (2x2 square) with a rich
 *   festive holiday gradient and elevated styling.
 * - Set SHOW_CHRISTMAS_CATEGORY_HIGHLIGHT = false to restore the default
 *   uniform grid (also preserved in src/app/categories/DefaultCategoriesPage.tsx).
 * =============================================================================
 */
const SHOW_CHRISTMAS_CATEGORY_HIGHLIGHT = true;

export const metadata: Metadata = {
  title: "All Categories — Christian Books by Topic",
  description:
    "Explore Christian books organized by biblical topic: Bible Study, Theology, Devotionals, Commentaries, Christian Living, Leadership, Youth, and Children.",
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    title: "All Categories — Christian Books by Topic | For The Truth",
    description:
      "Explore Christian books organized by biblical topic: Bible Study, Theology, Devotionals, Commentaries, and more.",
    url: "https://forthetruth.in/categories",
    siteName: "For The Truth",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "All Categories — Christian Books by Topic",
    description:
      "Explore Christian books organized by biblical topic: Bible Study, Theology, Devotionals, Commentaries, and more.",
  },
};

export default async function CategoriesPage() {
  let categories: WCCategory[] = [];
  let allProducts: Product[] = [];

  if (isWooConfigured()) {
    const results = await Promise.all([
      getCategories().catch(() => []),
      getAllProducts().catch(() => []),
    ]);
    categories = results[0].filter(
      (c) =>
        c.slug !== "gift-wrap" &&
        !/gift\s*wrap/i.test(c.name) &&
        !/gift\s*wrap/i.test(c.slug)
    );
    allProducts = results[1];
  }

  if (!isWooConfigured() || (categories.length === 0 && allProducts.length === 0)) {
    return <StoreMaintenancePage title="Categories Temporarily Unavailable" />;
  }

  // Pre-index up to 3 book cover images per category
  const coversByCategory: Record<number, string[]> = {};
  for (const product of allProducts) {
    const src = product.images?.[0]?.src;
    if (!src) continue;
    for (const cat of product.categories ?? []) {
      if (!coversByCategory[cat.id]) {
        coversByCategory[cat.id] = [];
      }
      if (coversByCategory[cat.id].length < 3) {
        coversByCategory[cat.id].push(src);
      }
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forthetruth.in";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: `${baseUrl}/categories`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mb-10 text-center">
        <p className="overline-label mb-3">Find your genre</p>
        <h1 className="font-display text-4xl font-bold">Browse by Category</h1>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => {
            const covers =
              coversByCategory[cat.id] && coversByCategory[cat.id].length > 0
                ? coversByCategory[cat.id]
                : cat.image?.src
                ? [cat.image.src]
                : [];

            const isChristmas =
              SHOW_CHRISTMAS_CATEGORY_HIGHLIGHT &&
              (cat.id === 1838 ||
                cat.slug === "christmas-sale" ||
                /christmas/i.test(cat.name));

            if (isChristmas) {
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group relative col-span-2 row-span-2 flex flex-col justify-between overflow-hidden rounded-3xl border border-rose-100/90 bg-gradient-to-br from-white via-white to-rose-50/40 p-6 sm:p-8 md:p-10 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-rose-200 hover:shadow-card-hover min-h-[340px] sm:min-h-[420px]"
                >
                  {/* Very subtle ambient warm glow in corner */}
                  <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rose-100/25 blur-3xl" />

                  {/* Top: Book Count */}
                  <div className="relative z-10 flex items-center justify-end">
                    {cat.count != null && (
                      <span className="rounded-full bg-charcoal/5 px-3 py-1 text-xs font-semibold tracking-wide text-charcoal/60">
                        {cat.count} {cat.count === 1 ? "Book" : "Books"}
                      </span>
                    )}
                  </div>

                  {/* Center: Overlapping Book Covers */}
                  <div className="relative z-10 my-4 flex h-36 sm:h-44 md:h-52 items-end justify-center">
                    {covers.length > 0 ? (
                      covers.slice(0, 4).map((src, i, arr) => (
                        <span
                          key={i}
                          className="relative block h-28 w-20 sm:h-36 sm:w-24 md:h-44 md:w-28 overflow-hidden rounded-md shadow-book transition-transform duration-500 group-hover:-translate-y-1.5"
                          style={{
                            marginLeft: i === 0 ? 0 : -22,
                            zIndex: arr.length - i,
                            transform: `rotate(${(i - (arr.length - 1) / 2) * 7}deg)`,
                          }}
                        >
                          <img
                            src={toCdnImageUrl(src)}
                            alt=""
                            decoding="async"
                            className="h-full w-full object-contain p-0.5 select-none"
                          />
                        </span>
                      ))
                    ) : (
                      <span className="block h-36 w-24 rounded bg-gold-gradient shadow-book" />
                    )}
                  </div>

                  {/* Bottom: Title & Action */}
                  <div className="relative z-10 text-center">
                    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal transition-colors group-hover:text-gold-dark">
                      {formatCategoryName(cat.name)}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-charcoal/60 font-medium max-w-sm mx-auto">
                      Explore our hand-picked collection of sound Christian books, advent readings & devotionals.
                    </p>
                    <div className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gold-dark transition-smooth group-hover:gap-2.5">
                      <span>Explore Christmas Sale</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-sand bg-white p-5 sm:p-6 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-card-hover"
              >
                {/* Overlapping book covers identical to home page Find Your Categories */}
                <div className="flex h-20 items-end justify-center mb-4">
                  {covers.length > 0 ? (
                    covers.map((src, i) => (
                      <span
                        key={i}
                        className="relative block h-[72px] w-12 overflow-hidden rounded shadow-book transition-transform duration-500 group-hover:-translate-y-1"
                        style={{
                          marginLeft: i === 0 ? 0 : -14,
                          zIndex: covers.length - i,
                          transform: `rotate(${(i - (covers.length - 1) / 2) * 6}deg)`,
                        }}
                      >
                        <img
                          src={toCdnImageUrl(src)}
                          alt=""
                          decoding="async"
                          className="h-full w-full object-contain p-0.5 select-none"
                        />
                      </span>
                    ))
                  ) : (
                    <span className="block h-[72px] w-12 rounded bg-gold-gradient shadow-book" />
                  )}
                </div>

                <div className="text-center">
                  <p className="font-display text-base font-bold text-charcoal transition-colors group-hover:text-gold-dark line-clamp-2">
                    {formatCategoryName(cat.name)}
                  </p>
                  {cat.count != null && (
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-charcoal/40">
                      {cat.count} {cat.count === 1 ? "book" : "books"}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-sand bg-white p-16 text-center text-charcoal/50">
          Categories will appear once the store is connected.
        </p>
      )}
    </div>
  );
}
