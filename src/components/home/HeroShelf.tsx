"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RatingStars } from "@/components/products/RatingStars";
import { formatPrice } from "@/utils/currency";
import { READER_TRUST } from "@/utils/constants";
import { getAuthor, type Product } from "@/types/product";

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
  badge = "Independent Christian Bookstore",
  title = "Happy reading, friend",
  subtitle = "600+ handpicked titles on Bible study, devotion, prayer, and Christian living. Sound doctrine, honest prices, delivered across India.",
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

  const excerpt = hero
    ? (hero.short_description || hero.description)
        .replace(/<[^>]+>/g, "")
        .slice(0, 150)
    : "";

  const titleParts = title.includes(",") ? title.split(",") : [title, ""];

  return (
    <section
      className="px-3 sm:px-6 md:pt-8 lg:px-8 w-full max-w-full overflow-hidden"
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
      <div className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-white shadow-panel group/hero">
        <div className="pointer-events-none absolute inset-0 bg-cream-mesh opacity-80" />
        <div className="pointer-events-none absolute inset-0 bg-paper-texture opacity-50" />

        <div className="relative grid items-center gap-8 sm:gap-10 px-5 sm:px-8 py-8 sm:py-12 md:px-12 grid-cols-1 lg:grid-cols-[1.05fr_auto_0.95fr] lg:gap-8 lg:px-14 lg:py-16">
          {/* ---------- LEFT: Headline & Actions ---------- */}
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-dark">
              {badge}
            </p>

            <h1 className="mt-5 font-display text-display-md font-black leading-tight text-charcoal">
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

            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-charcoal/65">
              {subtitle}
            </p>

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

          {/* ---------- CENTRE: Floating 3D Book with Slider Transition ---------- */}
          <div className="relative flex justify-center items-center py-2 sm:py-4 lg:col-span-1 min-h-[340px] md:min-h-[420px]">
            {hero ? (
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={hero.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -direction * 40, scale: 0.95 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex justify-center w-full"
                >
                  <FloatingBook product={hero} />
                </motion.div>
              </AnimatePresence>
            ) : (
              <BookSkeleton />
            )}

            {/* Quick floating arrow buttons on desktop hover */}
            {total > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  aria-label="Previous book"
                  className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 bg-white/95 text-charcoal shadow-md opacity-0 group-hover/hero:opacity-100 transition-all hover:scale-110 hover:bg-gold hover:text-white cursor-pointer z-20"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next book"
                  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 bg-white/95 text-charcoal shadow-md opacity-0 group-hover/hero:opacity-100 transition-all hover:scale-110 hover:bg-gold hover:text-white cursor-pointer z-20"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* ---------- RIGHT: Featured Book Summary & Slide Controls ---------- */}
          {hero && (
            <div className="text-center lg:text-left lg:col-span-1 flex flex-col justify-between min-h-[340px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={hero.id}
                  custom={direction}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center justify-center lg:justify-between gap-2 mb-2.5">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-dark">
                      Featuring books this week
                    </p>
                    {total > 1 && (
                      <span className="hidden lg:inline-flex items-center font-mono text-xs font-black text-charcoal/50 bg-charcoal/5 px-2.5 py-0.5 rounded-full">
                        {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  <Link href={`/products/${hero.slug}`} className="block group">
                    <h2 className="font-display text-xl sm:text-2xl md:text-[28px] lg:text-[32px] font-black leading-tight text-charcoal transition-colors group-hover:text-gold-dark line-clamp-2">
                      {hero.name}
                    </h2>
                  </Link>

                  <div className="mt-3 flex items-center justify-center lg:justify-start gap-2.5">
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

              {/* ---------- Slider Navigation Controls & Indicators ---------- */}
              {total > 1 && (
                <div className="mt-6 pt-4 border-t border-charcoal/10 flex items-center justify-center lg:justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    {/* Previous Button */}
                    <button
                      onClick={prevSlide}
                      aria-label="Previous book"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 bg-white/90 text-charcoal shadow-sm transition-all hover:bg-gold hover:border-gold hover:text-white active:scale-95 cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>

                    {/* Pagination Dots */}
                    <div className="flex items-center gap-1.5" role="tablist" aria-label="Hero slider pagination">
                      {validProducts.map((p, idx) => (
                        <button
                          key={p.id}
                          onClick={() => goToSlide(idx)}
                          aria-label={`Jump to book ${idx + 1}: ${p.name}`}
                          aria-selected={currentIndex === idx}
                          role="tab"
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            currentIndex === idx
                              ? "w-7 bg-gold shadow-xs"
                              : "w-2 bg-charcoal/20 hover:bg-charcoal/40"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={nextSlide}
                      aria-label="Next book"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 bg-white/90 text-charcoal shadow-sm transition-all hover:bg-gold hover:border-gold hover:text-white active:scale-95 cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>

                  {/* Auto-sliding indicator with pause status */}
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-charcoal/50">
                    <span
                      className={`inline-block h-2 w-2 rounded-full transition-colors ${
                        isPaused ? "bg-amber-400" : "bg-emerald-500 animate-pulse"
                      }`}
                    />
                    <span>{isPaused ? "Paused" : "Auto-playing"}</span>
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

/** Cover rendered as a physical 3D book with page edges and a soft floor shadow. */
function FloatingBook({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative block [perspective:1400px]"
      aria-label={product.name}
    >
      <span
        aria-hidden="true"
        className="absolute -bottom-6 left-1/2 h-6 w-[78%] -translate-x-1/2 rounded-[50%] bg-charcoal/25 blur-xl transition-all duration-700 group-hover:w-[68%] group-hover:opacity-70"
      />

      <span className="relative block transition-transform duration-700 ease-out group-hover:-translate-y-3 [transform-style:preserve-3d]">
        <span className="relative block h-[320px] w-[220px] [transform:rotateY(-16deg)_rotateX(3deg)] transition-transform duration-700 group-hover:[transform:rotateY(-6deg)_rotateX(1deg)] md:h-[400px] md:w-[275px]">
          {/* page edges */}
          <span
            aria-hidden="true"
            className="absolute -right-[13px] bottom-[5px] top-[5px] w-[15px] rounded-r-sm bg-[repeating-linear-gradient(to_right,#fdfbf6_0px,#fdfbf6_1px,#e6dcc8_1px,#e6dcc8_2px)] shadow-[2px_2px_6px_rgba(90,70,40,0.25)] [transform:rotateY(22deg)] [transform-origin:left_center]"
          />
          {/* cover */}
          <span className="relative block h-full w-full overflow-hidden rounded-[3px] rounded-r-md shadow-book-lg">
            {product.images && product.images[0] ? (
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt || product.name}
                fill
                sizes="(max-width: 768px) 220px, 275px"
                priority
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-gold-gradient p-6 text-center">
                <span className="font-display text-xl italic text-white">
                  {product.name}
                </span>
              </span>
            )}
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-[14px] bg-gradient-to-r from-black/45 via-black/15 to-transparent"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/25 opacity-60"
            />
          </span>
        </span>
      </span>
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
