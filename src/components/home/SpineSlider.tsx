"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/utils/currency";
import { getAuthor, type Product } from "@/types/product";

/**
 * Shelf slider: books sit as narrow spines; the selected one slides out
 * and faces you as a full cover. Light theme with a white ledge.
 */
interface SpineSliderProps {
  products: Product[];
  badge?: string;
  title?: string;
  subtitle?: string;
}

export function SpineSlider({
  products,
  badge = "Browse the shelf",
  title = "Explore Children Books",
  subtitle = "Tap any spine to pull the book off the shelf and see its cover, author, and price — just like browsing in store.",
}: SpineSliderProps) {
  const [active, setActive] = useState(Math.floor(products.length / 2));

  if (products.length === 0) return null;
  const current = products[active];
  const author = getAuthor(current);

  const prev = () =>
    setActive((a) => (a - 1 + products.length) % products.length);
  const next = () => setActive((a) => (a + 1) % products.length);

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-10 text-center">
          <p className="overline-label">{badge}</p>
          <h2 className="section-title mt-3">{title}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-charcoal/50">
            {subtitle}
          </p>
        </div>

        <div className="relative">
          {/* Arrows */}
          <button
            onClick={prev}
            aria-label="Previous book"
            className="absolute -left-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-sand bg-white/90 p-3 text-charcoal/60 shadow-card backdrop-blur transition-smooth hover:border-gold hover:text-gold-dark md:left-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button
            onClick={next}
            aria-label="Next book"
            className="absolute -right-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-sand bg-white/90 p-3 text-charcoal/60 shadow-card backdrop-blur transition-smooth hover:border-gold hover:text-gold-dark md:right-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>

          {/* Shelf */}
          <div className="overflow-x-auto scrollbar-hide w-full">
            <div className="relative mx-auto flex w-max min-w-full items-end justify-start lg:justify-center gap-2 sm:gap-[10px] px-6 sm:px-10 pb-[20px] pt-10">
              {products.map((p, i) => (
                <SpineBookItem
                  key={p.id}
                  product={p}
                  index={i}
                  isActive={i === active}
                  onSelect={() => setActive(i)}
                />
              ))}

              {/* White ledge */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[16px] rounded-md bg-gradient-to-b from-white via-[#f7f3ea] to-[#ece5d5] shadow-ledge"
              />
            </div>
          </div>

          {/* Active book details */}
          <div key={current.id} className="mt-8 animate-fade-up text-center">
            <h3 className="mx-auto max-w-lg font-display text-xl font-bold text-charcoal md:text-2xl">
              {current.name}
            </h3>
            {author && (
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-gold-dark">
                {author}
              </p>
            )}
            <div className="mt-4 flex items-center justify-center gap-5">
              <span className="font-display text-lg font-bold text-charcoal">
                {formatPrice(current.price)}
              </span>
              <Link
                href={`/products/${current.slug}`}
                className="btn-gold !px-6 !py-2.5 !text-xs"
              >
                View this book
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpineBookItem({
  product,
  isActive,
  index,
  onSelect,
}: {
  product: Product;
  isActive: boolean;
  index: number;
  onSelect: () => void;
}) {
  const image = product.images?.[0];

  return (
    <button
      onClick={onSelect}
      type="button"
      aria-label={isActive ? undefined : `Select ${product.name}`}
      aria-pressed={isActive}
      className={`relative shrink-0 origin-bottom overflow-hidden text-left transition-all duration-500 ease-out ${
        isActive
          ? "z-10 h-72 md:h-80 w-auto -translate-y-8 rotate-[-2deg] rounded-lg shadow-book-lg"
          : "h-56 w-9 rounded-[3px] shadow-book hover:-translate-y-2 md:h-64 md:w-10"
      }`}
    >
      {image ? (
        isActive ? (
          <img
            src={image.src}
            alt={image.alt || product.name}
            className="h-72 md:h-80 w-auto max-w-[240px] md:max-w-[280px] object-contain block select-none rounded-lg"
          />
        ) : (
          <Image
            src={image.src}
            alt=""
            fill
            sizes="48px"
            className="object-cover select-none"
          />
        )
      ) : (
        <div
          className={`h-full w-full ${
            index % 3 === 0
              ? "bg-royal-gradient"
              : index % 3 === 1
                ? "bg-gold-gradient"
                : "bg-gradient-to-b from-charcoal to-[#4a4a4a]"
          }`}
        />
      )}
      {!isActive && (
        <>
          <div className="absolute inset-0 bg-charcoal/40" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="max-h-full overflow-hidden whitespace-nowrap text-[10px] font-semibold tracking-wide text-white/90 [writing-mode:vertical-rl]">
              {product.name.length > 28 ? `${product.name.slice(0, 28)}…` : product.name}
            </span>
          </span>
        </>
      )}
      {isActive && (
        <div className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-black/25 to-transparent pointer-events-none rounded-l-lg" />
      )}
    </button>
  );
}

