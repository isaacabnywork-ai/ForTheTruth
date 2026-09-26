"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/utils/currency";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";

interface BookshelfProps {
  title: string;
  href?: string;
  products: Product[];
}

const MAX_PER_SHELF = 6;

/**
 * A shelf of at most 6 books standing on a white ledge.
 * Every shelf uses identical book dimensions so rows line up across the page.
 * Uses fully responsive padding and touch-friendly overlay visibility on phones and tablets.
 */
export function Bookshelf({ title, href, products }: BookshelfProps) {
  const books = products.slice(0, MAX_PER_SHELF);
  const [addedId, setAddedId] = useState<number | null>(null);
  const addToCart = useCartStore((s) => s.addToCart);

  function handleAdd(e: React.MouseEvent, p: Product) {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      price: parseFloat(p.price || p.regular_price || "0"),
      image: p.images[0]?.src,
      isVirtual: p.categories.some((c) => c.slug === "e-books"),
    });
    setAddedId(p.id);
    setTimeout(() => {
      setAddedId((current) => (current === p.id ? null : current));
    }, 1800);
  }

  return (
    <section className="py-8 md:py-12 w-full max-w-full overflow-hidden">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="section-title text-xl sm:text-2xl md:text-3xl font-black">{title}</h2>
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-gold-dark transition-smooth hover:gap-3 hover:text-charcoal shrink-0 ml-2"
          >
            Full shelf <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      {/* Responsive Horizontal Scroll Container without clipping left edge on tablet */}
      <div className="w-full overflow-x-auto scrollbar-hide py-2 px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto flex w-max items-end justify-start gap-5 sm:gap-7 md:gap-9 lg:gap-11 pb-[22px] pt-6 sm:pt-8">
          {books.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group relative block h-44 w-[118px] shrink-0 origin-bottom overflow-hidden rounded-r-md rounded-l-[3px] shadow-book transition-all duration-500 ease-out hover:z-10 sm:hover:-translate-y-4 sm:hover:rotate-[-1.5deg] hover:shadow-book-lg sm:h-52 sm:w-[140px] md:h-56 md:w-[152px]"
            >
              {p.images[0] ? (
                <Image
                  src={p.images[0].src}
                  alt={p.images[0].alt || p.name}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gold-gradient p-3 text-center">
                  <span className="font-display text-sm italic leading-snug text-white [text-shadow:0_1px_2px_rgba(120,85,40,0.4)]">
                    {p.name}
                  </span>
                </div>
              )}
              {/* spine crease */}
              <div className="absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-black/30 to-transparent" />
              
              {/* Touch-Friendly Caption & Cart: Always visible on mobile/tablet screens (< lg), slide-on-hover on desktop (lg+) */}
              <div className="absolute inset-x-0 bottom-0 translate-y-0 opacity-100 lg:translate-y-2 lg:opacity-0 bg-gradient-to-t from-charcoal/95 via-charcoal/75 to-transparent px-2 sm:px-2.5 pb-2 pt-8 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="line-clamp-1 sm:line-clamp-2 text-[10px] sm:text-[11px] font-semibold leading-tight text-white">
                  {p.name}
                </p>
                <div className="mt-1 flex items-center justify-between gap-1">
                  <p className="text-[10px] sm:text-[11px] font-bold text-gold-light truncate">
                    {formatPrice(p.price)}
                  </p>
                  <button
                    onClick={(e) => handleAdd(e, p)}
                    className={`shrink-0 rounded px-1.5 py-0.5 font-display text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 shadow-xs ${
                      addedId === p.id
                        ? "bg-emerald-600 text-white"
                        : "bg-cta text-white hover:bg-cta-light active:scale-95"
                    }`}
                    title="Add to Cart"
                  >
                    {addedId === p.id ? "Added ✓" : "+ Cart"}
                  </button>
                </div>
              </div>
            </Link>
          ))}

          {/* White ledge */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[18px] rounded-md bg-gradient-to-b from-white via-white to-[#efe9dc] shadow-ledge"
          />
        </div>
      </div>
    </section>
  );
}

export function BookshelfSkeleton({ title }: { title: string }) {
  return (
    <section className="py-8 md:py-12 w-full max-w-full overflow-hidden">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="section-title text-xl sm:text-2xl md:text-3xl font-black">{title}</h2>
      </div>
      <div className="w-full overflow-x-auto scrollbar-hide py-2 px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto flex w-max items-end justify-start gap-5 sm:gap-7 md:gap-9 lg:gap-11 pb-[22px] pt-6 sm:pt-8">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="skeleton h-44 w-[118px] shrink-0 rounded-r-md rounded-l-[3px] sm:h-52 sm:w-[140px] md:h-56 md:w-[152px]"
            />
          ))}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[18px] rounded-md bg-gradient-to-b from-white via-white to-[#efe9dc] shadow-ledge"
          />
        </div>
      </div>
    </section>
  );
}
