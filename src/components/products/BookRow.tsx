"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice2Decimals } from "@/utils/currency";
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

function getSectionBadge(title: string): string {
  const t = title.trim().toLowerCase();
  if (t.includes("new arrival")) return "NEW ARRIVAL";
  if (t.includes("bible speaks today")) return "THE BIBLE SPEAKS TODAY";
  if (t.includes("christian living")) return "CHRISTIAN LIVING";
  if (t.includes("ministry")) return "MINISTRY";
  if (t.includes("theology")) return "THEOLOGY";
  if (t.includes("children")) return "CHILDREN BOOKS";
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
              className="flex flex-col h-full w-[148px] sm:w-[165px] md:w-[175px] lg:w-auto shrink-0 lg:shrink"
            >
              <div className="skeleton aspect-[2/3] w-full rounded-[2px]" />
              <div className="flex flex-col items-center pt-3 pb-1">
                <div className="skeleton h-3 w-16 rounded-full mb-2" />
                <div className="skeleton h-4 w-3/4 rounded mb-1" />
                <div className="skeleton h-4 w-1/2 rounded" />
              </div>
              <div className="mt-auto pt-2.5 flex items-center justify-between w-full">
                <div className="flex flex-col gap-1">
                  <div className="skeleton h-4 w-14 rounded" />
                  <div className="skeleton h-3 w-10 rounded" />
                </div>
                <div className="skeleton h-8 w-8 sm:h-9 sm:w-9 rounded-full shrink-0" />
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
  badge,
}: {
  product: Product;
  badge: string;
}) {
  const [isAdded, setIsAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  const imageSrc =
    product.images?.[0]?.src ||
    (product as unknown as { image?: string }).image ||
    "";
  const imageAlt = product.images?.[0]?.alt || product.name;
  const title = cleanTitle(product.name);
  const inStock = product.stock_status !== "outofstock";

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
      name: title,
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
    <article className="group flex flex-col h-full w-[148px] sm:w-[165px] md:w-[175px] lg:w-auto shrink-0 lg:shrink select-none">
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-col flex-1"
      >
        {/* Book Cover */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[2px] bg-neutral-100 shadow-xs border border-black/[0.04] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-md">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt || title}
              loading="lazy"
              className="h-full w-full object-cover object-center block"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gold-gradient p-3 text-center">
              <span className="font-serif text-xs italic leading-snug text-white [text-shadow:0_1px_2px_rgba(120,85,40,0.4)]">
                {title}
              </span>
            </div>
          )}

          {/* Book spine crease */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[4px] bg-gradient-to-r from-black/20 via-black/5 to-transparent" />

          {/* Subtle sheen */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-30" />
        </div>

        {/* Metadata & Title */}
        <div className="flex flex-col flex-1 pt-3 pb-1 text-center">
          {/* Category / Badge Overline */}
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8C7355] line-clamp-1 mb-1">
            {badge}
          </p>

          {/* Title */}
          <h3
            className="font-serif text-[13px] sm:text-[14px] md:text-[15px] font-normal text-charcoal leading-snug line-clamp-3 transition-colors duration-200 group-hover:text-gold-dark"
            title={title}
          >
            {title}
          </h3>
        </div>
      </Link>

      {/* Bottom Row: Price & Add to Cart */}
      <div className="mt-auto pt-2.5 flex items-center justify-between w-full">
        <div className="flex flex-col text-left">
          <span className="font-sans text-[13px] sm:text-[14px] md:text-[15px] font-bold text-charcoal tracking-tight leading-tight">
            {formatPrice2Decimals(currentPrice)}
          </span>
          {hasDiscount && (
            <span className="font-sans text-[11px] sm:text-[12px] text-neutral-400 line-through tracking-tight leading-tight mt-0.5">
              {formatPrice2Decimals(regularPrice)}
            </span>
          )}
        </div>

        {/* Cart circular button */}
        <button
          type="button"
          onClick={handleAdd}
          aria-label={`Add ${title} to cart`}
          title={inStock ? (isAdded ? "Added to cart" : "Add to cart") : "Out of stock"}
          disabled={!inStock}
          className={`relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 shadow-xs active:scale-95 ${
            !inStock
              ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : isAdded
              ? "border-emerald-600 bg-emerald-50 text-emerald-600"
              : "border-neutral-300 bg-white text-neutral-600 hover:border-charcoal hover:text-charcoal hover:bg-neutral-50"
          }`}
        >
          {isAdded ? (
            <svg
              className="w-4 h-4 text-emerald-600 animate-in zoom-in-75 duration-200"
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
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-600 group-hover:text-charcoal"
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
