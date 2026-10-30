import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/ProductDetail";
import { Bookshelf } from "@/components/products/Bookshelf";
import { isWooConfigured } from "@/config/env";
import { StoreMaintenancePage } from "@/components/common/StoreMaintenancePage";
import {
  getProductBySlug,
  getProductBySlugWithStatus,
  getProducts,
  getProductReviews,
} from "@/services/woocommerce";
import type { Product, ProductReview } from "@/types/product";

import { cleanExcerpt } from "@/utils/text";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isWooConfigured()) return { title: "Book Details" };

  try {
    const product = await getProductBySlug(slug);
    if (!product) return { title: "Book Not Found" };

    const excerpt = cleanExcerpt(product.short_description || product.description, 160) || `Buy ${product.name} at For The Truth`;
    const image = product.images?.[0]?.src;

    return {
      title: product.name, // Layout template will append " | For The Truth" cleanly without duplication
      description: excerpt,
      openGraph: {
        title: `${product.name} — Buy Online in India`,
        description: excerpt,
        url: `https://forthetruth.in/products/${slug}`,
        siteName: "For The Truth",
        locale: "en_IN",
        type: "book",
        ...(image && {
          images: [
            {
              url: image,
              width: 800,
              height: 1200,
              alt: product.images[0].alt || product.name,
            },
          ],
        }),
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: excerpt,
        ...(image && { images: [image] }),
      },
    };
  } catch {
    return { title: "Book Details" };
  }
}

export default async function SingleProductPage({ params }: PageProps) {
  const { slug } = await params;

  let product: Product | null = null;
  let isOffline = false;
  let reviews: ProductReview[] = [];
  let related: Product[] = [];

  if (isWooConfigured()) {
    try {
      const res = await getProductBySlugWithStatus(slug);
      product = res.product;
      isOffline = res.isOffline;

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
      isOffline = true;
    }
  } else {
    isOffline = true;
  }

  if (isOffline && !product) {
    return (
      <StoreMaintenancePage
        title="Book Details Temporarily Unavailable"
        message="Our book database is currently undergoing synchronization or maintenance. We apologize for the inconvenience — please check back in a few minutes or order directly via WhatsApp or phone."
      />
    );
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
          : "https://schema.org/OutOfStock",
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
