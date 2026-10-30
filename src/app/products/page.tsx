import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Pagination } from "@/components/products/Pagination";
import { isWooConfigured } from "@/config/env";
import { StoreMaintenancePage } from "@/components/common/StoreMaintenancePage";
import { parseProductQuery, type SearchParamsMap } from "@/lib/productQuery";
import { getCategories, getProductsPaged } from "@/services/woocommerce";
import { pruneProductForClient } from "@/utils/pruneProduct";
import type { WCCategory } from "@/types/product";

export const metadata: Metadata = {
  title: "All Books & Curated Library",
  description:
    "Browse handpicked sound theological books, Bestsellers, and New Arrivals.",
};

export default async function ProductsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsMap>;
}) {
  const sp = await searchParams;
  const { query, page, plain } = parseProductQuery(sp, 25);

  let result: Awaited<ReturnType<typeof getProductsPaged>> = {
    products: [],
    total: 0,
    totalPages: 1,
  };
  let categories: WCCategory[] = [];
  let selectedCategory: WCCategory | undefined;

  if (isWooConfigured()) {
    try {
      categories = await getCategories().catch(() => []);
      // Category in the URL is a slug (nicer URLs) — resolve to an id
      const categorySlug =
        typeof sp.category === "string" ? sp.category : undefined;
      if (categorySlug) {
        selectedCategory = categories.find((c) => c.slug === categorySlug);
      }
      result = await getProductsPaged({
        ...query,
        category: selectedCategory?.id,
      });
    } catch (err) {
      console.error("ProductsCatalogPage fetch error:", err);
    }
  }

  const isDefaultBrowse =
    !sp.q &&
    !sp.category &&
    !sp.minPrice &&
    !sp.maxPrice &&
    !sp.availability &&
    !sp.tag &&
    !sp.author &&
    !sp.orderby;

  if (
    !isWooConfigured() ||
    (isDefaultBrowse && result.products.length === 0 && categories.length === 0)
  ) {
    return <StoreMaintenancePage />;
  }

  return (
    <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 py-8 sm:py-10 lg:px-8">
      {/* Catalog Header bar */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-sand pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
            {selectedCategory ? selectedCategory.name : "All Books"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal/60">
            {result.total > 0
              ? `Showing ${result.products.length} of ${result.total} ${
                  result.total === 1 ? "book" : "books"
                }`
              : "No books found"}
            {selectedCategory?.description && (
              <span className="hidden sm:inline">
                {" "}
                — {selectedCategory.description.replace(/<[^>]+>/g, "")}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 2-Column Catalog Layout: Products on Left, Filters on Right */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Content Area (Products Grid on the Left) */}
        <main className="flex-1 min-w-0 w-full order-2 lg:order-1">
          {result.products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {result.products.map((product) => (
                  <ProductCard key={product.id} product={pruneProductForClient(product)} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={result.totalPages}
                basePath="/products"
                searchParams={{ ...plain, category: selectedCategory?.slug }}
              />
            </>
          ) : (
            <div className="py-20 text-center rounded-2xl border border-dashed border-sand bg-white/50 p-8">
              <h2 className="font-display text-2xl font-bold text-charcoal">
                No Books Found
              </h2>
              <p className="mt-2 text-sm text-charcoal/50">
                Try selecting another category or clearing a filter.
              </p>
              <Link href="/products" className="btn-gold mt-6 inline-block">
                View All Books
              </Link>
            </div>
          )}
        </main>

        {/* Right Sidebar Filters */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-24 order-1 lg:order-2">
          <Suspense>
            <ProductFilters
              categories={categories}
              layout="sidebar"
              totalCount={result.total}
            />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
