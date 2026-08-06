import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Pagination } from "@/components/products/Pagination";
import { isWooConfigured } from "@/config/env";
import { parseProductQuery, type SearchParamsMap } from "@/lib/productQuery";
import { getProductsPaged } from "@/services/woocommerce";
import { sortProductsByRelevance } from "@/utils/search";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsMap>;
}) {
  const sp = await searchParams;
  const { query, page, plain } = parseProductQuery(sp);
  const q = query.search ?? "";

  let results: Awaited<ReturnType<typeof getProductsPaged>> = {
    products: [],
    total: 0,
    totalPages: 1,
  };

  if (q && isWooConfigured()) {
    try {
      const paged = await getProductsPaged({ ...query, revalidate: 60 });
      results = {
        ...paged,
        products: sortProductsByRelevance(paged.products, q),
      };
    } catch (err) {
      console.error("Search fetch failed", err);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8">
        <p className="overline-label mb-3">Search</p>
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          {q ? (
            <>
              Results for <em className="text-gradient-gold">“{q}”</em>
            </>
          ) : (
            "Search the shelves"
          )}
        </h1>
        {q && (
          <p className="mt-2 text-sm text-charcoal/50">
            {results.total} {results.total === 1 ? "match" : "matches"}
          </p>
        )}
      </div>

      {q && (
        <div className="mb-10">
          <Suspense>
            <ProductFilters categories={[]} />
          </Suspense>
        </div>
      )}

      {results.products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {results.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={results.totalPages}
            basePath="/products/search"
            searchParams={plain}
          />
        </>
      ) : q ? (
        <div className="rounded-2xl border border-dashed border-sand bg-white p-16 text-center">
          <p className="font-display text-xl text-charcoal/60">
            Nothing on the shelf for “{q}”.
          </p>
          <p className="mt-2 text-sm text-charcoal/40">
            Check the spelling, or try a broader term — author, title, or topic.
          </p>
        </div>
      ) : (
        <p className="text-sm text-charcoal/50">
          Use the search bar above to find books by title, author, or topic.
        </p>
      )}
    </div>
  );
}
