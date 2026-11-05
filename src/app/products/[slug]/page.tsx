import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/ProductDetail";
import { BookRow } from "@/components/products/BookRow";
import { isWooConfigured } from "@/config/env";
import { StoreMaintenancePage } from "@/components/common/StoreMaintenancePage";
import {
  getProductBySlug,
  getProductBySlugWithStatus,
  getProducts,
  getProductReviews,
} from "@/services/woocommerce";
import { getAuthor, getFormat, type Product, type ProductReview } from "@/types/product";
import { cleanExcerpt } from "@/utils/text";
import { toCdnImageUrl, toAbsoluteCdnImageUrl } from "@/utils/imageUrl";

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
    const authorName = getAuthor(product);

    return {
      title: product.name,
      description: excerpt,
      alternates: {
        canonical: `/products/${slug}`,
      },
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
              url: toAbsoluteCdnImageUrl(image),
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
        ...(image && { images: [toAbsoluteCdnImageUrl(image)] }),
      },
      keywords: [
        product.name,
        ...(authorName ? [authorName, `books by ${authorName}`] : []),
        "Christian books India",
        "sound Christian doctrine",
        ...(product.categories?.map((c) => c.name) || []),
      ],
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
            perPage: 14,
            category: product.categories[0]?.id,
          }).catch(() => []),
        ]);
        // Filter out current product from related
        related = related.filter((p) => p.id !== product!.id);
        if (related.length < 12) {
          const fallbackBooks = await getProducts({
            perPage: 14,
            orderby: "popularity",
          }).catch(() => []);
          const existingIds = new Set([product.id, ...related.map((p) => p.id)]);
          for (const fb of fallbackBooks) {
            if (!existingIds.has(fb.id)) {
              related.push(fb);
              existingIds.add(fb.id);
            }
            if (related.length >= 12) break;
          }
        }
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forthetruth.in";
  const authorName = getAuthor(product);
  const format = getFormat(product);
  const primaryCategory = product.categories?.[0];

  const canonicalUrl = `${baseUrl}/products/${slug}`;
  const productImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.src)
      : undefined;
  const productDescription =
    cleanExcerpt(product.short_description || product.description, 400) || undefined;

  // Validate price: must exist, not be empty, not be "0" or <= 0
  const rawPrice = product.price || "";
  const numericPrice = parseFloat(rawPrice);
  const hasValidPrice = !isNaN(numericPrice) && numericPrice > 0;

  // Map stock status to Schema.org ItemAvailability
  const availabilityMap: Record<string, string> = {
    instock: "https://schema.org/InStock",
    outofstock: "https://schema.org/OutOfStock",
    onbackorder: "https://schema.org/BackOrder",
  };
  const availability = availabilityMap[product.stock_status];

  // Build Offer if valid price and known stock status are available
  const productOffer =
    hasValidPrice && availability
      ? {
          "@type": "Offer",
          url: canonicalUrl,
          price: rawPrice,
          priceCurrency: "INR",
          availability,
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: "For The Truth",
          },
        }
      : undefined;

  const aggregateRating =
    product.rating_count > 0 && parseFloat(product.average_rating) > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: product.average_rating,
          reviewCount: product.rating_count,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined;

  const reviewList =
    reviews.length > 0
      ? reviews.slice(0, 5).map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.reviewer },
          datePublished: r.date_created,
          reviewBody: cleanExcerpt(r.review, 400),
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: 5,
            worstRating: 1,
          },
        }))
      : undefined;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${canonicalUrl}#product`,
    name: product.name,
    ...(productDescription && { description: productDescription }),
    url: canonicalUrl,
    ...(productImages && { image: productImages }),
    ...(product.sku && { sku: product.sku }),
    brand: {
      "@type": "Brand",
      name: "For The Truth",
    },
    ...(productOffer && { offers: productOffer }),
    ...(aggregateRating && { aggregateRating }),
    ...(reviewList && { review: reviewList }),
  };

  const bookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${baseUrl}/products/${slug}#book`,
    name: product.name,
    description: productDescription,
    url: canonicalUrl,
    image: productImages,
    sku: product.sku || String(product.id),
    isbn: product.sku && /^[0-9-]{10,17}$/.test(product.sku) ? product.sku.replace(/-/g, "") : undefined,
    author: authorName ? { "@type": "Person", name: authorName } : undefined,
    publisher: {
      "@type": "Organization",
      name: "For The Truth",
    },
    bookFormat: format?.toLowerCase().includes("hardback")
      ? "https://schema.org/Hardcover"
      : format?.toLowerCase().includes("paperback")
      ? "https://schema.org/Paperback"
      : format?.toLowerCase().includes("ebook")
      ? "https://schema.org/EBook"
      : undefined,
    ...(productOffer && { offers: productOffer }),
    aggregateRating,
    review: reviewList,
  };

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
        name: "Shop",
        item: `${baseUrl}/shop`,
      },
      ...(primaryCategory
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: primaryCategory.name,
              item: `${baseUrl}/categories/${primaryCategory.slug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: product.name,
              item: `${baseUrl}/products/${slug}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: product.name,
              item: `${baseUrl}/products/${slug}`,
            },
          ]),
    ],
  };

  return (
    <div className="w-full bg-cream">
      {/* High-priority preload for hero image in HTML head */}
      {product.images?.[0]?.src && (
        <link rel="preload" as="image" href={toCdnImageUrl(product.images[0].src)} fetchPriority="high" />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetail product={product} reviews={reviews} />

      {related.length > 0 && (
        <div className="pb-4 sm:pb-8">
          <BookRow
            title="Recommended Products"
            products={related}
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
