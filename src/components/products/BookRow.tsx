"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/utils/currency";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import { triggerHaptic } from "@/utils/haptics";
import { decodeHtmlEntities } from "@/utils/text";

interface BookRowProps {
  title: string;
  href?: string;
  badge?: string;
  products: Product[];
}

const MAX_PER_ROW = 6;

function cleanTitle(title: string): string {
  if (!title) return "";
  return decodeHtmlEntities(title)
    .replace(/_Damage$/i, "")
    .replace(/_Damage/gi, "")
    .trim();
}

/**
 * Cleanly restricts title to concise main title:
 * - Strips verbose secondary subtitles after a colon when total title is long (> 32 chars)
 *   e.g. "How to Lead Your Family: A Guide for Men Wanting to Be More" -> "How to Lead Your Family"
 * - Restricts word count so titles fit gracefully in 2 lines without overflowing into 3+ lines.
 */
function formatCardTitle(rawTitle: string): { displayTitle: string; fullTitle: string } {
  const fullTitle = cleanTitle(rawTitle);
  if (!fullTitle) return { displayTitle: "", fullTitle: "" };

  let displayTitle = fullTitle;

  // 1. Strip secondary explanation after colon if the first part is substantial and total is long
  if (displayTitle.includes(":") && displayTitle.length > 32) {
    const parts = displayTitle.split(":");
    const mainPart = parts[0].trim();
    if (mainPart.length >= 10) {
      displayTitle = mainPart;
    }
  }

  // 2. Word & character restriction to ensure a disciplined, elegant 2-line maximum
  const words = displayTitle.split(/\s+/);
  if (words.length > 8 && displayTitle.length > 38) {
    displayTitle = words.slice(0, 8).join(" ") + "…";
  } else if (displayTitle.length > 44) {
    displayTitle = displayTitle.slice(0, 42).trim() + "…";
  }

  return { displayTitle, fullTitle };
}

function getSectionBadge(title: string): string {
  const t = title.trim().toLowerCase();
  if (t.includes("new arrival")) return "NEW ARRIVAL";
  if (t.includes("bible speaks today")) return "BIBLE SPEAKS TODAY";
  if (t.includes("christian living")) return "CHRISTIAN LIVING";
  if (t.includes("ministry")) return "MINISTRY";
  if (t.includes("theology")) return "THEOLOGY";
  if (t.includes("children")) return "CHILDREN'S BOOKS";
  return title.toUpperCase();
}

export function BookRow({ title, href, badge, products }: BookRowProps) {
  const books = products.slice(0, MAX_PER_ROW);
  const rowBadge = badge || getSectionBadge(title);

  return (
    <section className="py-8 md:py-12 w-full max-w-full overflow-hidden">
      {/* Section Header */}
      <div className="mx-auto flex max-w-6xl items-baseline justify-between px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <h2 className="section-title text-xl sm:text-2xl md:text-3xl font-black text-charcoal">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-gold-dark transition-smooth hover:gap-2.5 hover:text-charcoal shrink-0 ml-2"
          >
            View all <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      {/* Books Display */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-4 pt-1 lg:grid lg:grid-cols-6 lg:gap-6 lg:overflow-visible lg:pb-0">
          {books.map((p) => (
            <BookRowCard
              key={p.id}
              product={p}
              badge={rowBadge}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function BookRowSkeleton({ title }: { title: string }) {
  return (
    <section className="py-8 md:py-12 w-full max-w-full overflow-hidden">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <h2 className="section-title text-xl sm:text-2xl md:text-3xl font-black text-charcoal">
          {title}
        </h2>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-4 pt-1 lg:grid lg:grid-cols-6 lg:gap-6 lg:overflow-visible lg:pb-0">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col w-[148px] sm:w-[165px] md:w-[175px] lg:w-auto shrink-0 lg:shrink"
            >
              <div className="skeleton aspect-[2/3] w-full rounded-[3px]" />
              <div className="mt-2.5 sm:mt-3 flex items-center justify-center gap-2.5 sm:gap-3">
                <div className="flex flex-col gap-1 items-start">
                  <div className="skeleton h-3.5 w-12 rounded" />
                  <div className="skeleton h-2.5 w-8 rounded" />
                </div>
                <div className="skeleton h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-full shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BookRowCard({
  product,
}: {
  product: Product;
  badge?: string;
}) {
  const [isAdded, setIsAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  const imageSrc =
    product.images?.[0]?.src ||
    (product as unknown as { image?: string }).image ||
    "";
  const imageAlt = product.images?.[0]?.alt || product.name;
  const inStock = product.stock_status !== "outofstock";

  const { displayTitle, fullTitle } = formatCardTitle(product.name);

  const currentPrice = parseFloat(product.price || product.sale_price || product.regular_price || "0");
  const regularPrice = parseFloat(product.regular_price || "0");
  const hasDiscount = regularPrice > currentPrice && currentPrice > 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;

    triggerHaptic("tap");
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

  return (
    <article className="group flex flex-col w-[148px] sm:w-[165px] md:w-[175px] lg:w-auto shrink-0 lg:shrink select-none">
      {/* Book Cover */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-[2/3] w-full overflow-hidden rounded-[3px] bg-neutral-100 shadow-xs border border-black/[0.06] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-md"
        title={fullTitle}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt || fullTitle}
            loading="lazy"
            className="h-full w-full object-cover object-center block"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gold-gradient p-3 text-center">
            <span className="font-serif text-xs italic leading-snug text-white [text-shadow:0_1px_2px_rgba(120,85,40,0.4)]">
              {displayTitle}
            </span>
          </div>
        )}

        {/* Book spine crease */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-black/20 via-black/5 to-transparent" />

        {/* Subtle sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-30" />

        {!inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-charcoal/90 text-white text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Bottom Row: Price & Add to Cart — Centered and brought close together */}
      <div className="mt-2.5 sm:mt-3 flex items-center justify-center gap-2.5 sm:gap-3 w-full">
        <Link
          href={`/products/${product.slug}`}
          className="flex flex-col text-left justify-center min-h-[30px] group/price"
          title={fullTitle}
        >
          <span className="font-sans text-[13.5px] sm:text-[14px] font-normal text-charcoal leading-tight group-hover/price:text-gold-dark transition-colors">
            {formatPrice(currentPrice)}
          </span>
          {hasDiscount ? (
            <span className="font-sans text-[11px] font-normal text-charcoal/45 line-through leading-none mt-0.5">
              {formatPrice(regularPrice)}
            </span>
          ) : null}
        </Link>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Add ${fullTitle} to cart`}
          title={inStock ? (isAdded ? "Added to cart" : `Add ${fullTitle} to cart`) : "Out of stock"}
          disabled={!inStock}
          className={`group/btn relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 shadow-2xs active:scale-95 ${
            !inStock
              ? "border-neutral-200 bg-neutral-100 text-neutral-300 cursor-not-allowed"
              : isAdded
              ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
              : "border-sand bg-white text-charcoal hover:bg-cta hover:border-cta hover:text-white hover:shadow-xs hover:scale-105"
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
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover/btn:scale-110"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          )}
        </button>
      </div>
    </article>
  );
}
