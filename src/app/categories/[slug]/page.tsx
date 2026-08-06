import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Pagination } from "@/components/products/Pagination";
import { isWooConfigured } from "@/config/env";
import { parseProductQuery, type SearchParamsMap } from "@/lib/productQuery";
import { getCategoryBySlug, getProductsPaged } from "@/services/woocommerce";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParamsMap>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isWooConfigured()) return {};
  const { slug } = await params;
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) return {};
  return {
    title: category.name,
    description:
      category.description?.replace(/<[^>]+>/g, "").slice(0, 160) ||
      `Browse ${category.name} books.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  if (!isWooConfigured()) notFound();
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) notFound();

  const { query, page, plain } = parseProductQuery(sp, 24);
  const result = await getProductsPaged({
    ...query,
    category: category.id,
  }).catch(() => ({ products: [], total: 0, totalPages: 1 }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-charcoal/50">
        <Link href="/" className="hover:text-gold-dark">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/categories" className="hover:text-gold-dark">Categories</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal/80">{category.name}</span>
      </nav>

      <div className="mb-8 border-b border-sand pb-6">
        <p className="overline-label">Category</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          {category.name}
        </h1>
        <p className="mt-2 text-sm text-charcoal/60">
          {result.total} {result.total === 1 ? "title" : "titles"}
          {category.description && (
            <span
              className="ml-1"
              dangerouslySetInnerHTML={{
                __html: ` — ${category.description.replace(/<[^>]+>/g, "")}`,
              }}
            />
          )}
        </p>
      </div>

      <div className="mb-10">
        <Suspense>
          <ProductFilters categories={[]} />
        </Suspense>
      </div>

      {result.products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {result.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={result.totalPages}
            basePath={`/categories/${category.slug}`}
            searchParams={plain}
          />
        </>
      ) : (
        <div className="py-20 text-center">
          <h2 className="font-display text-2xl font-bold">
            Nothing on this shelf yet
          </h2>
          <Link href="/products" className="btn-gold mt-6 inline-block">
            Browse All Books
          </Link>
        </div>
      )}
    </div>
  );
}
