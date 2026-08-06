import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/ProductDetail";
import { Bookshelf } from "@/components/products/Bookshelf";
import { isWooConfigured } from "@/config/env";
import { getProductBySlug, getProducts, getProductReviews } from "@/services/woocommerce";
import type { Product, ProductReview } from "@/types/product";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isWooConfigured()) return { title: "Book Details | For The Truth" };

  try {
    const product = await getProductBySlug(slug);
    if (!product) return { title: "Book Not Found | For The Truth" };

    return {
      title: `${product.name} | For The Truth`,
      description: product.short_description?.replace(/<[^>]*>?/gm, "").slice(0, 160),
    };
  } catch {
    return { title: "Book Details | For The Truth" };
  }
}

export default async function SingleProductPage({ params }: PageProps) {
  const { slug } = await params;

  let product: Product | null = null;
  let reviews: ProductReview[] = [];
  let related: Product[] = [];

  if (isWooConfigured()) {
    try {
      product = await getProductBySlug(slug);
      if (product) {
        [reviews, related] = await Promise.all([
          getProductReviews(product.id).catch(() => []),
          getProducts({
            perPage: 6,
            category: product.categories[0]?.id,
          }).catch(() => []),
        ]);
        // Filter out current product from related
        related = related.filter((p) => p.id !== product!.id).slice(0, 6);
      }
    } catch (err) {
      console.error("SingleProductPage fetch error:", err);
    }
  }

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: product.name,
    isbn: product.sku || undefined,
    image: product.images[0]?.src,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability:
        product.stock_status === "instock"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
    },
    aggregateRating:
      product.rating_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.average_rating,
            reviewCount: product.rating_count,
          }
        : undefined,
  };

  return (
    <main className="bg-offwhite min-h-screen pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} reviews={reviews} />

      {related.length > 0 && (
        <div className="mt-12">
          <Bookshelf
            title="You Might Also Like"
            products={related}
          />
        </div>
      )}
    </main>
  );
}
