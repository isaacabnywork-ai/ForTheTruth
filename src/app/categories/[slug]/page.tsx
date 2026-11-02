import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Pagination } from "@/components/products/Pagination";
import { isWooConfigured } from "@/config/env";
import { StoreMaintenancePage } from "@/components/common/StoreMaintenancePage";
import { parseProductQuery, type SearchParamsMap } from "@/lib/productQuery";
import {
  getCategoryBySlug,
  getProductsPaged,
  isWooCommerceOffline,
} from "@/services/woocommerce";
import { formatCategoryName } from "@/utils/text";
import { pruneProductForClient } from "@/utils/pruneProduct";

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

  const cleanName = formatCategoryName(category.name);
  const excerpt =
    category.description?.replace(/<[^>]+>/g, "").slice(0, 160) ||
    `Browse curated ${cleanName} books at For The Truth. Fast shipping across India.`;

  return {
    title: `${cleanName} Books`,
    description: excerpt,
    alternates: {
      canonical: `/categories/${slug}`,
    },
    openGraph: {
      title: `${cleanName} Christian Books — For The Truth`,
      description: excerpt,
      url: `https://forthetruth.in/categories/${slug}`,
      siteName: "For The Truth",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${cleanName} Christian Books`,
      description: excerpt,
    },
    keywords: [
      `${cleanName} Christian books`,
      `${cleanName} books India`,
      `${cleanName} theology`,
      "Christian books India",
    ],
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  if (!isWooConfigured() || isWooCommerceOffline()) {
    return <StoreMaintenancePage title="Category Temporarily Unavailable" />;
  }
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) {
    if (isWooCommerceOffline()) {
      return <StoreMaintenancePage title="Category Temporarily Unavailable" />;
    }
    notFound();
  }

  const { query, page, plain } = parseProductQuery(sp, 30);
  const result = await getProductsPaged({
    ...query,
    category: category.id,
  }).catch(() => ({ products: [], total: 0, totalPages: 1 }));

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forthetruth.in";
  const cleanCategoryName = formatCategoryName(category.name);

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
      {
        "@type": "ListItem",
        position: 3,
        name: cleanCategoryName,
        item: `${baseUrl}/categories/${slug}`,
      },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cleanCategoryName} Christian Books`,
    description:
      category.description?.replace(/<[^>]+>/g, "").slice(0, 200) ||
      `Browse curated ${cleanCategoryName} books at For The Truth.`,
    url: `${baseUrl}/categories/${slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: result.products.slice(0, 20).map((prod, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${baseUrl}/products/${prod.slug}`,
        name: prod.name,
      })),
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-charcoal/50">
        <Link href="/" className="hover:text-gold-dark">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/categories" className="hover:text-gold-dark">Categories</Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal/80">{formatCategoryName(category.name)}</span>
      </nav>

      <div className="mb-8 border-b border-sand pb-6">
        <p className="overline-label">Category</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          {formatCategoryName(category.name)}
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
          <ProductFilters categories={[]} layout="topbar" />
        </Suspense>
      </div>

      {result.products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {result.products.map((p) => (
              <ProductCard key={p.id} product={pruneProductForClient(p)} />
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
          <Link href="/shop" className="btn-gold mt-6 inline-block">
            Browse All Books
          </Link>
        </div>
      )}
    </div>
  );
}
