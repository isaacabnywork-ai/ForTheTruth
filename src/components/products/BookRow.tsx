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

const CARD_THEMES = [
  {
    btn: "bg-[#2D4436] hover:bg-[#22352A]", // Deep forest green
    badgeBg: "bg-[#E6EFE5]",
    badgeText: "text-[#2D4E35]",
  },
  {
    btn: "bg-[#6E5039] hover:bg-[#583E2B]", // Warm leather brown
    badgeBg: "bg-[#EFE9E0]",
    badgeText: "text-[#6E4F35]",
  },
  {
    btn: "bg-[#354332] hover:bg-[#283425]", // Deep olive
    badgeBg: "bg-[#ECEFE4]",
    badgeText: "text-[#3D4C2F]",
  },
  {
    btn: "bg-[#A24632] hover:bg-[#8A3725]", // Terracotta / rust red
    badgeBg: "bg-[#F8EAE5]",
    badgeText: "text-[#9E3E2A]",
  },
  {
    btn: "bg-[#4D3652] hover:bg-[#3D2942]", // Deep plum / aubergine
    badgeBg: "bg-[#EFEAF4]",
    badgeText: "text-[#4E3454]",
  },
  {
    btn: "bg-[#283C4D] hover:bg-[#1D2E3D]", // Deep slate navy
    badgeBg: "bg-[#E6ECF2]",
    badgeText: "text-[#283B4C]",
  },
];

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
          {books.map((p, idx) => (
            <BookRowCard
              key={p.id}
              product={p}
              colorIndex={idx}
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
              <div className="mt-2.5 flex items-center justify-between w-full pt-0.5">
                <div className="flex flex-col gap-1.5">
                  <div className="skeleton h-4 w-20 rounded" />
                  <div className="skeleton h-3.5 w-14 rounded" />
                </div>
                <div className="skeleton h-9 w-9 rounded-lg shrink-0" />
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
  colorIndex = 0,
}: {
  product: Product;
  colorIndex?: number;
  badge?: string;
}) {
  const [isAdded, setIsAdded] = useState(false);
  const [isNotified, setIsNotified] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  const theme = CARD_THEMES[colorIndex % CARD_THEMES.length];

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
                  <span
                    className={`inline-block text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] ${theme.badgeBg} ${theme.badgeText}`}
                  >
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
            className={`group/btn relative flex h-9 w-9 sm:h-9.5 sm:w-9.5 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs transition-all duration-200 active:scale-95 hover:shadow-xs ${
              isAdded ? "bg-emerald-600" : theme.btn
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
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
