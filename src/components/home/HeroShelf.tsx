"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RatingStars } from "@/components/products/RatingStars";
import { formatPrice } from "@/utils/currency";
import { READER_TRUST } from "@/utils/constants";
import { getAuthor, getFormat, type Product } from "@/types/product";
import { cleanExcerpt, decodeHtmlEntities } from "@/utils/text";

/**
 * Hero panel in a reading-dashboard layout:
 * left — headline, search, CTAs · centre — floating 3D book · right — book details & slider controls.
 */
interface HeroShelfProps {
  products: Product[];
  badge?: string;
  title?: string;
  subtitle?: string;
  autoPlayInterval?: number; // ms, default 5500
}

export function HeroShelf({
  products = [],
  badge = "",
  title = "Buy Christian Books Online in India for Spiritual Growth",
  subtitle = "",
  autoPlayInterval = 5500,
}: HeroShelfProps) {
  const validProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = validProducts.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Automatic slide rotation (pauses on hover or touch)
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, total, nextSlide, autoPlayInterval]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 45) {
      prevSlide();
    } else if (deltaX < -45) {
      nextSlide();
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  const hero = validProducts[currentIndex] || validProducts[0];
  const author = hero ? getAuthor(hero) : undefined;
  const format = hero ? getFormat(hero) : undefined;

  const rawDescription = hero ? (hero.short_description || hero.description || "") : "";
  const excerpt = cleanExcerpt(rawDescription, 150);

  const heroName = hero
    ? decodeHtmlEntities(
        hero.id === 48904 && !hero.name.toLowerCase().includes("hardback")
          ? `${hero.name} - Hardback Book`
          : hero.name
      )
    : "";

  const titleParts = title.includes(",") ? title.split(",") : [title, ""];

  return (
    <section
      className="relative z-0 isolate px-3 sm:px-6 md:pt-8 lg:px-8 w-full max-w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Books Hero Slider"
    >
      <div className="mx-auto max-w-6xl relative overflow-hidden rounded-3xl md:rounded-[2.5rem] border border-sand bg-white shadow-panel group/hero">
        <div className="pointer-events-none absolute inset-0 bg-cream-mesh opacity-80" />
        <div className="pointer-events-none absolute inset-0 bg-paper-texture opacity-50" />

        <div className="relative grid items-center gap-8 sm:gap-10 px-5 sm:px-8 py-8 sm:py-12 md:px-10 grid-cols-1 lg:grid-cols-[1.1fr_auto_1fr] lg:gap-8 lg:px-12 lg:py-14">
          {/* ---------- LEFT: Headline & Actions ---------- */}
          <div className="hidden lg:block text-left max-w-md">
            {badge && (
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-dark">
                {badge}
              </p>
            )}

            <h1 className="mt-5 font-display text-xl sm:text-2xl lg:text-[1.65rem] xl:text-[1.85rem] font-bold leading-normal sm:leading-relaxed lg:leading-[1.55] text-charcoal">
              {titleParts[0]}
              {titleParts[1] ? (
                <>
                  ,<br />
                  <em className="text-gradient-gold"> {titleParts[1].trim()}</em>
                </>
              ) : (
                ""
              )}
            </h1>

            {subtitle && (
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-charcoal/65">
                {subtitle}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3 justify-start">
              <Link href="/products" className="btn-cta text-sm px-8 py-3.5">
                Start Browsing <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/products?orderby=popularity" className="btn-outline text-sm px-8 py-3.5">
                Bestsellers
              </Link>
            </div>

            <ul className="mt-8 space-y-2 max-w-sm">
              {READER_TRUST.map((t) => (
                <li
                  key={t.title}
                  className="flex items-center gap-2.5 justify-start"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    className="shrink-0 text-cta"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className="text-[13px] font-semibold text-charcoal/70">
                    {t.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- CENTRE: Book Cover Image (as-is, original aspect ratio, no animation) ---------- */}
          <div className="relative flex justify-center items-center py-2 sm:py-4 lg:col-span-1 min-h-[340px] md:min-h-[420px]">
            {hero ? (
              <HeroBookImage product={hero} />
            ) : (
              <BookSkeleton />
            )}
          </div>

          {/* ---------- RIGHT: Featured Book Summary & Slide Controls ---------- */}
          {hero && (
            <div className="text-center lg:text-left lg:col-span-1 flex flex-col justify-between min-h-[340px] max-w-md mx-auto lg:mx-0">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={hero.id}
                  custom={direction}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mb-2.5">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-dark">
                      Featuring books this week
                    </p>
                  </div>

                  <Link href={`/products/${hero.slug}`} className="block group">
                    <h2 className="font-display text-lg sm:text-xl md:text-2xl lg:text-[26px] font-bold leading-normal sm:leading-relaxed lg:leading-[1.5] text-charcoal transition-colors group-hover:text-gold-dark line-clamp-2">
                      {heroName}
                    </h2>
                  </Link>

                  <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                    <span className="font-display text-xl sm:text-2xl font-black text-gold-dark">
                      {formatPrice(hero.price)}
                    </span>
                    {hero.on_sale && hero.regular_price && (
                      <span className="text-sm text-charcoal/45 line-through">
                        {formatPrice(hero.regular_price)}
                      </span>
                    )}
                    {hero.on_sale && (
                      <span className="rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-0.5">
                        Save
                      </span>
                    )}
                    {format && (
                      <span className="rounded-full bg-amber-50 text-amber-900 border border-amber-300/70 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5">
                        {format}
                      </span>
                    )}
                  </div>

                  {hero.rating_count > 0 && (
                    <div className="mt-2 flex items-center justify-center lg:justify-start gap-2">
                      <RatingStars rating={parseFloat(hero.average_rating)} />
                      <span className="text-xs text-charcoal/55 font-semibold">
                        {parseFloat(hero.average_rating).toFixed(1)} ({hero.rating_count})
                      </span>
                    </div>
                  )}

                  {excerpt && (
                    <p className="mx-auto lg:mx-0 mt-3.5 max-w-sm text-xs sm:text-sm leading-relaxed text-charcoal/70 line-clamp-3">
                      {excerpt}…
                    </p>
                  )}

                  {author && (
                    <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-bold italic text-charcoal/60 line-clamp-1">
                      — {author}
                    </p>
                  )}

                  <div className="mt-4">
                    <Link
                      href={`/products/${hero.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-gold-dark transition-smooth hover:gap-3.5"
                    >
                      View this book <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* ---------- Slider Navigation Dots ---------- */}
              {total > 1 && (
                <div className="mt-6 pt-4 border-t border-charcoal/10 flex items-center justify-center lg:justify-start">
                  <div className="flex items-center gap-2" role="tablist" aria-label="Hero slider pagination">
                    {validProducts.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => goToSlide(idx)}
                        aria-label={`Jump to book ${idx + 1}: ${p.name}`}
                        aria-selected={currentIndex === idx}
                        role="tab"
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          currentIndex === idx
                            ? "w-8 bg-gold shadow-xs"
                            : "w-2 bg-charcoal/20 hover:bg-charcoal/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Cover rendered as-is with its authentic aspect ratio, no 3D tilt, no artificial shrink. */
function HeroBookImage({ product }: { product: Product }) {
  const image = product.images && product.images[0];
  const title = decodeHtmlEntities(product.name);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex items-center justify-center p-2"
      aria-label={product.name}
    >
      {image ? (
        <img
          src={image.src}
          alt={decodeHtmlEntities(image.alt || product.name)}
          className="max-h-[320px] sm:max-h-[380px] md:max-h-[420px] w-auto h-auto max-w-[280px] sm:max-w-[340px] md:max-w-[400px] object-contain rounded-lg shadow-book-lg select-none"
        />
      ) : (
        <div className="flex h-[320px] w-[220px] items-center justify-center rounded-lg bg-gold-gradient p-6 text-center shadow-book-lg">
          <span className="font-display text-xl italic text-white">{title}</span>
        </div>
      )}
    </Link>
  );
}

function BookSkeleton() {
  return (
    <div className="relative">
      <div className="skeleton h-[320px] w-[220px] rounded-[3px] rounded-r-md md:h-[400px] md:w-[275px]" />
      <span
        aria-hidden="true"
        className="absolute -bottom-6 left-1/2 h-6 w-[78%] -translate-x-1/2 rounded-[50%] bg-charcoal/15 blur-xl"
      />
    </div>
  );
}
