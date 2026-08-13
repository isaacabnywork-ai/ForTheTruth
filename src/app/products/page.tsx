import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Pagination } from "@/components/products/Pagination";
import { isWooConfigured } from "@/config/env";
import { parseProductQuery, type SearchParamsMap } from "@/lib/productQuery";
import { getCategories, getProductsPaged } from "@/services/woocommerce";
import type { WCCategory } from "@/types/product";

export const metadata: Metadata = {
  title: "All Books & Curated Library",
  description:
    "Browse 600+ handpicked sound theological books, Bestsellers, and New Arrivals.",
};

export default async function ProductsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsMap>;
}) {
  const sp = await searchParams;
  const { query, page, plain } = parseProductQuery(sp, 24);

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Suspense>
        <ProductFilters categories={categories} />
      </Suspense>

      {/* Grid */}
      {result.products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {result.products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
        <div className="py-20 text-center">
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
    </div>
  );
}
