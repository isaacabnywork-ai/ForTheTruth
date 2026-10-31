"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/utils/currency";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { triggerHaptic } from "@/utils/haptics";
import { formatCardTitle } from "./BookRow";

export function ProductCard({
  product,
  rank,
}: {
  product: Product;
  /** Optional bestseller rank badge (1-3 get medals) */
  rank?: number;
}) {
  const [isAdded, setIsAdded] = useState(false);
  const [isNotified, setIsNotified] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const wishlisted = useWishlistStore((s) => s.productIds.includes(product.id));

  const imageSrc =
    product.images?.[0]?.src ||
    (product as unknown as { image?: string }).image ||
    "";
  const imageAlt = product.images?.[0]?.alt || product.name;

  const inStock =
    product.stock_status !== "outofstock" &&
    product.stock_status !== "onbackorder" &&
    !(product.manage_stock && typeof product.stock_quantity === "number" && product.stock_quantity <= 0);

  const { displayTitle, fullTitle } = formatCardTitle(product.name);

  const currentPrice = parseFloat(product.price || product.sale_price || product.regular_price || "0");
  const regularPrice = parseFloat(product.regular_price || "0");
  const hasDiscount = regularPrice > currentPrice && currentPrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
    : 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    triggerHaptic("success");

    addToCart({
      productId: product.id,
      slug: product.slug,
      name: fullTitle,
      price: currentPrice,
      image: imageSrc,
      isVirtual: product.categories?.some((c) => c.slug === "e-books"),
      weight: product.weight ? parseFloat(product.weight) : 0.4,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  }

  function handleNotify(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    triggerHaptic("tap");
    setIsNotified(true);
    setTimeout(() => {
      setIsNotified(false);
    }, 2400);
  }

  return (
    <article className="group flex flex-col w-full select-none">
      {/* Book Cover Container with Natural Aspect Ratio & Bottom Baseline Alignment */}
      <Link
        href={`/products/${product.slug}`}
        className="relative flex items-end justify-center h-[210px] sm:h-[235px] md:h-[250px] lg:h-[260px] w-full"
        title={fullTitle}
      >
        <div className="relative inline-block max-h-full max-w-full transition-all duration-300 group-hover:-translate-y-1.5 overflow-hidden rounded-[3px]">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt || fullTitle}
              loading="lazy"
              className={`max-h-[210px] sm:max-h-[235px] md:max-h-[250px] lg:max-h-[260px] w-auto max-w-full rounded-[3px] shadow-xs border border-black/[0.06] object-contain block group-hover:shadow-md transition-all duration-300 ${
                !inStock ? "opacity-40" : ""
              }`}
            />
          ) : (
            <div className={`flex aspect-[2/3] h-[210px] sm:h-[235px] md:h-[250px] lg:h-[260px] items-center justify-center bg-gold-gradient p-3 text-center rounded-[3px] ${
              !inStock ? "opacity-40" : ""
            }`}>
              <span className="font-serif text-xs italic leading-snug text-white [text-shadow:0_1px_2px_rgba(120,85,40,0.4)]">
                {displayTitle}
              </span>
            </div>
          )}

          {/* Book spine crease */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-black/20 via-black/5 to-transparent rounded-l-[3px]" />

          {/* Subtle sheen */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-30 rounded-[3px]" />

          {/* Rank Badge if provided */}
          {rank != null && rank <= 3 && (
            <div className="absolute top-2 left-2 z-10 pointer-events-none">
              <span className="bg-navy text-white text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                {rank === 1 ? "🥇 #1" : rank === 2 ? "🥈 #2" : "🥉 #3"}
              </span>
            </div>
          )}

          {/* Out of Stock / Sold Out Badge */}
          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none z-10">
              <span className="bg-[#212121]/90 text-white text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md backdrop-blur-xs whitespace-nowrap">
                SOLD OUT
              </span>
            </div>
          )}

          {/* Subtle Wishlist heart button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              triggerHaptic("tap");
              toggleWishlist(product.id);
            }}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            className={`absolute right-1.5 top-1.5 z-10 rounded-full p-1.5 shadow-xs backdrop-blur-xs transition-all duration-200 active:scale-90 ${
              wishlisted
                ? "bg-gold text-white"
                : "bg-white/85 text-charcoal/60 opacity-0 group-hover:opacity-100 hover:bg-gold hover:text-white"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        </div>
      </Link>

      {/* Bottom Row: Price, Discount Badge & Squircle Cart / Notify Button */}
      <div className="mt-2.5 flex items-center justify-between w-full pt-0.5">
        <Link
          href={`/products/${product.slug}`}
          className="flex flex-col text-left justify-center group/price min-h-[36px]"
          title={fullTitle}
        >
          {!inStock ? (
            /* Out of Stock: Stacked price so "Notify me" button has room */
            <div className="flex flex-col leading-tight">
              <span className="font-sans text-[15px] sm:text-[16px] font-bold text-charcoal tracking-tight group-hover/price:text-gold-dark transition-colors">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="font-sans text-[11px] sm:text-[12px] font-normal text-charcoal/45 line-through leading-none mt-0.5">
                  {formatPrice(regularPrice)}
                </span>
              )}
            </div>
          ) : (
            /* In Stock: Price + Regular Price inline, Discount % Badge below */
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5 leading-tight">
                <span className="font-sans text-[15px] sm:text-[16px] font-bold text-charcoal tracking-tight group-hover/price:text-gold-dark transition-colors">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="font-sans text-[11px] sm:text-[12px] font-normal text-charcoal/45 line-through">
                    {formatPrice(regularPrice)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <div className="mt-1">
                  <span className="inline-block text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] bg-[#EAF3EA] text-[#22543D]">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}
            </div>
          )}
        </Link>

        {/* Right Action: Squircle Cart Button or Notify Me */}
        {!inStock ? (
          <button
            type="button"
            onClick={handleNotify}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-[11px] font-semibold shadow-2xs transition-all active:scale-95 shrink-0 ${
              isNotified ? "bg-emerald-600" : "bg-[#9EA4A9] hover:bg-[#8B9298]"
            }`}
            title="Notify me when back in stock"
          >
            {isNotified ? (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Notified!</span>
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <span>Notify me</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${fullTitle} to cart`}
            title={isAdded ? "Added to cart" : `Add ${fullTitle} to cart`}
            className={`group/btn relative flex h-9 w-9 sm:h-9.5 sm:w-9.5 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs transition-all duration-200 active:scale-95 hover:shadow-xs hover:scale-105 ${
              isAdded ? "bg-emerald-600" : "bg-[#2D4537] hover:bg-[#22382B]"
            }`}
          >
            {isAdded ? (
              <svg
                className="w-4 h-4 text-white animate-in zoom-in-75 duration-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 transition-transform duration-200 group-hover/btn:scale-110"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
