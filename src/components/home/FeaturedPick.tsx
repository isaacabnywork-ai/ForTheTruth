"use client";

import Image from "next/image";
import Link from "next/link";
import { RatingStars } from "@/components/products/RatingStars";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/utils/currency";
import { getAuthor, type Product } from "@/types/product";
import { useState } from "react";

/** "This month's essential read" — one book, with reasons why. */
interface FeaturedPickProps {
  product: Product;
  badge?: string;
  title?: string;
  subtitle?: string;
}

export function FeaturedPick({
  product,
  badge = "Editor's choice",
  title = "This Month's Essential Read",
  subtitle = "One title we think belongs on every shelf this month — and why.",
}: FeaturedPickProps) {
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const wishlisted = useWishlistStore((s) => s.productIds.includes(product.id));

  const author = getAuthor(product);
  const rating = parseFloat(product.average_rating);
  const excerpt = (product.short_description || product.description)
    .replace(/<[^>]+>/g, "")
    .slice(0, 260);

  const reasons = [
    product.rating_count > 0
      ? `${rating.toFixed(1)}/5 from ${product.rating_count} verified readers`
      : "Handpicked by our editors this month",
    product.categories[0]
      ? `Trending in ${product.categories[0].name}`
      : "Trending with our readers",
    parseFloat(product.price) >= 499
      ? "Free shipping on this title"
      : "Dispatched within 24 hours",
  ];

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-10 text-center">
          <p className="overline-label">{badge}</p>
          <h2 className="section-title mt-3">{title}</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-charcoal/50">
            {subtitle}
          </p>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-[300px_1fr]">
          {/* Cover on ledge */}
          <div className="relative flex justify-center pb-[18px]">
            <Link
              href={`/products/${product.slug}`}
              className="group relative block h-[330px] w-[220px] origin-bottom overflow-hidden rounded-lg shadow-book-lg transition-all duration-500 hover:-translate-y-3 hover:rotate-[-1.5deg]"
            >
              {product.images[0] ? (
                <Image
                  src={product.images[0].src}
                  alt={product.images[0].alt || product.name}
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gold-gradient p-6 text-center">
                  <span className="font-display text-xl italic text-white">
                    {product.name}
                  </span>
                </div>
              )}
              <div className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-black/30 to-transparent" />
            </Link>
            <div
              aria-hidden="true"
              className="absolute inset-x-4 bottom-0 h-[16px] rounded-md bg-gradient-to-b from-white via-[#f7f3ea] to-[#ece5d5] shadow-ledge"
            />
          </div>

          {/* Details */}
          <div>
            {product.categories[0] && (
              <p className="overline-label mb-3">{product.categories[0].name}</p>
            )}
            <h3 className="font-display text-2xl font-black leading-tight text-charcoal md:text-3xl">
              {product.name}
            </h3>
            {author && (
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
                by {author}
              </p>
            )}

            <div className="mt-3 flex items-center gap-2">
              <RatingStars rating={rating} />
              {product.rating_count > 0 && (
                <span className="text-sm text-charcoal/50">
                  {rating.toFixed(1)}/5 ({product.rating_count} reviews)
                </span>
              )}
            </div>

            {excerpt && (
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-charcoal/70">
                {excerpt}…
              </p>
            )}

            <ul className="mt-6 space-y-2">
              {reasons.map((r) => (
                <li key={r} className="flex items-center gap-2.5 text-sm text-charcoal/70">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="shrink-0 text-cta" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {r}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="font-display text-2xl font-black text-charcoal">
                {formatPrice(product.price)}
              </span>
              {product.on_sale && (
                <span className="text-base text-charcoal/35 line-through">
                  {formatPrice(product.regular_price)}
                </span>
              )}
              <button
                onClick={() => {
                  addToCart({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: parseFloat(product.price),
                    image: product.images[0]?.src,
                    isVirtual: product.categories.some((c) => c.slug === "e-books"),
                  });
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1800);
                }}
                className="btn-cta"
              >
                {added ? "Added ✓" : "Add to Cart"}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-pressed={wishlisted}
                className={`rounded-full border-2 p-3.5 transition-smooth ${
                  wishlisted
                    ? "border-gold bg-gold text-white"
                    : "border-sand text-charcoal/50 hover:border-gold hover:text-gold-dark"
                }`}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
