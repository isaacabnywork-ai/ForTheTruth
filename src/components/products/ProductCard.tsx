"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/utils/currency";
import { getAuthor, type Product } from "@/types/product";
import { RatingStars } from "./RatingStars";
import { triggerHaptic } from "@/utils/haptics";
import { decodeHtmlEntities } from "@/utils/text";

const FREE_SHIPPING_THRESHOLD = 150;

export function ProductCard({
  product,
  rank,
}: {
  product: Product;
  /** Optional bestseller rank badge (1-3 get medals) */
  rank?: number;
}) {
  const [added, setAdded] = useState(false);
  const [aspect, setAspect] = useState<number | null>(null);
  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const wishlisted = useWishlistStore((s) => s.productIds.includes(product.id));

  const author = getAuthor(product);
  const image = product.images[0];
  const inStock = product.stock_status === "instock";
  const price = parseFloat(product.price);
  const discount =
    product.on_sale && product.regular_price
      ? Math.round(
          (1 -
            parseFloat(product.sale_price || product.price) /
              parseFloat(product.regular_price)) *
            100
        )
      : 0;

  // "New" if created within the last 30 days isn't in the API subset,
  // so we treat top-rated + high review count as Bestseller instead.
  const isBestseller = product.rating_count >= 25;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    triggerHaptic("success");
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price,
      image: image?.src,
      isVirtual: product.categories.some((c) => c.slug === "e-books"),
      weight: product.weight ? parseFloat(product.weight) : 0.4,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article className="group relative flex flex-col transition-all duration-300">
      {/* Book Cover — Clean presentation with NO surrounding box */}
      <div className="relative flex items-end justify-center h-[260px] sm:h-[290px] md:h-[310px] w-full">
        <Link
          href={`/products/${product.slug}`}
          style={{
            aspectRatio: aspect ? `${aspect}` : "2/3",
          }}
          className="relative block h-full max-h-full max-w-full overflow-hidden rounded-r-md rounded-l-[2px] shadow-book transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-book-lg"
        >
          {image ? (
            <Image
              src={image.src}
              alt={image.alt || product.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1200px) 30vw, 22vw"
              onLoad={(e) => {
                const el = e.currentTarget;
                if (el.naturalWidth && el.naturalHeight) {
                  setAspect(el.naturalWidth / el.naturalHeight);
                }
              }}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gold-gradient p-4 text-center">
              <span className="font-display text-base italic leading-snug text-white">
                {product.name}
              </span>
            </div>
          )}

          {/* Book spine crease */}
          <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />

          {/* Subtle glossy sheen */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 opacity-50" />

          {/* Hover overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Badges — top left over the book */}
          <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col gap-1">
            {rank != null && rank <= 3 && (
              <span className="badge bg-navy text-white text-[10px] py-0.5 px-2">
                {rank === 1 ? "🥇 #1" : rank === 2 ? "🥈 #2" : "🥉 #3"} Bestseller
              </span>
            )}
            {discount > 0 && (
              <span className="badge bg-gold-gradient text-white text-[10px] py-0.5 px-2 shadow-xs">
                −{discount}% off
              </span>
            )}
            {!inStock && <span className="badge bg-navy text-white text-[10px] py-0.5 px-2">Pre-order</span>}
            {rank == null && isBestseller && inStock && discount === 0 && (
              <span className="badge bg-white/90 text-gold-deep text-[10px] py-0.5 px-2">Bestseller</span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              triggerHaptic("tap");
              toggleWishlist(product.id);
            }}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            className={`absolute right-2 top-2 z-10 rounded-full p-1.5 shadow-md backdrop-blur transition-all duration-300 active:scale-90 ${
              wishlisted
                ? "bg-gold text-white"
                : "bg-white/90 text-charcoal/60 opacity-0 hover:bg-gold hover:text-white focus:opacity-100 group-hover:opacity-100"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>

          {/* Quick actions — slide up on hover */}
          <div className="absolute inset-x-2.5 bottom-2.5 z-10 translate-y-2 space-y-1.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={handleAdd}
              className="w-full rounded-full bg-cta py-2 text-xs font-bold uppercase tracking-widest text-white shadow-cta transition-smooth hover:bg-cta-light"
            >
              {added ? "Added ✓" : inStock ? "Add to Cart" : "Pre-order"}
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="block w-full rounded-full bg-white/95 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-charcoal/75 backdrop-blur transition-smooth hover:text-gold-dark"
            >
              Quick View
            </Link>
          </div>
        </Link>
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-1 px-1 pt-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-charcoal transition-colors group-hover:text-gold-dark">
            {decodeHtmlEntities(product.name)}
          </h3>
        </Link>
        {author && (
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
            {author}
          </p>
        )}

        <div className="flex items-center gap-1.5">
          <RatingStars rating={parseFloat(product.average_rating)} />
          {product.rating_count > 0 && (
            <span className="text-[11px] text-charcoal/45">
              {parseFloat(product.average_rating).toFixed(1)} ({product.rating_count})
            </span>
          )}
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-base font-bold text-charcoal">
              {formatPrice(product.price)}
            </span>
            {product.on_sale && (
              <span className="text-xs text-charcoal/35 line-through">
                {formatPrice(product.regular_price)}
              </span>
            )}
          </div>
          {price >= FREE_SHIPPING_THRESHOLD && (
            <p className="mt-1 text-[11px] font-semibold text-cta">
              Free shipping
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
