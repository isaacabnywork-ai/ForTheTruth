"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RatingStars } from "@/components/products/RatingStars";
import { formatPrice } from "@/utils/currency";
import { getAuthor, getFormat, type Product } from "@/types/product";
import { cleanExcerpt, decodeHtmlEntities } from "@/utils/text";
import { toCdnImageUrl } from "@/utils/imageUrl";

/**
 * ============================================================================
 * CHRISTMAS SALE HERO BANNER
 * ============================================================================
 * Displays a dedicated festive Christmas Sale banner in the hero position,
 * showcasing the 4 featured holiday books on sale:
 *   - #36828: The Christmas Surprise (Steph Williams)
 *   - #35515: The One True Gift (Tim Chester)
 *   - #38738: A Very Noisy Christmas (Tim Thornborough)
 *   - #36738: Love Came Down at Christmas (Sinclair B. Ferguson)
 *
 * Designed with rich holiday elegance (warm cream/gold palette, subtle festive
 * accents, discount callouts, 4-book interactive thumbnail switcher, and auto-rotation).
 *
 * Note: The default evergreen hero section is preserved in DefaultHeroShelf.tsx.
 * See HERO_BANNER_PRESERVATION.md for full preservation & restoration notes.
 * ============================================================================
 */

export const CHRISTMAS_SALE_BOOK_IDS = [36828, 35515, 38738, 36738] as const;

/** Verified Christmas fallback books with full metadata & CDN covers */
const CHRISTMAS_FALLBACK_BOOKS: Product[] = [
  {
    id: 36828,
    name: "The Christmas Surprise",
    slug: "the-christmas-surprise",
    permalink: "https://admin.forthetruth.in/product/the-christmas-surprise/",
    description: "Steph Williams retells the Christmas story for toddlers with fun illustrations and biblical faithfulness.",
    short_description: "Steph Williams retells the Christmas story for toddlers with fun illustrations & biblical faithfulness. Perfect stocking-filler for little ones.",
    sku: "Imbgchristmas",
    price: "249",
    regular_price: "499",
    sale_price: "249",
    on_sale: true,
    stock_status: "instock",
    stock_quantity: null,
    average_rating: "5.00",
    rating_count: 1,
    images: [
      {
        id: 36829,
        src: "https://admin.forthetruth.in/wp-content/uploads/2023/07/The-Christmas-Surprise-4.jpg",
        alt: "The Christmas Surprise cover",
      },
    ],
    categories: [
      { id: 114, name: "Children", slug: "children" },
      { id: 1838, name: "Christmas Sale!", slug: "christmas-sale" },
    ],
    attributes: [{ id: 1, name: "Author", options: ["Steph Williams"] }],
    meta_data: [],
  },
  {
    id: 35515,
    name: "The One True Gift",
    slug: "the-one-true-gift",
    permalink: "https://admin.forthetruth.in/product/the-one-true-gift/",
    description: "In these 24 short daily readings for Advent, Tim Chester peels back the layers of Philippians 2.",
    short_description: "In these 24 short daily readings for Advent, Tim Chester peels back the layers of Philippians 2, guiding you to marvel at God's ultimate gift.",
    sku: "TGSOnetruegift",
    price: "299",
    regular_price: "549",
    sale_price: "299",
    on_sale: true,
    stock_status: "instock",
    stock_quantity: null,
    average_rating: "5.00",
    rating_count: 1,
    images: [
      {
        id: 35516,
        src: "https://admin.forthetruth.in/wp-content/uploads/2023/06/The-One-True-Gift-2.jpg",
        alt: "The One True Gift cover",
      },
    ],
    categories: [
      { id: 112, name: "Christian Living", slug: "christian-living" },
      { id: 1838, name: "Christmas Sale!", slug: "christmas-sale" },
    ],
    attributes: [{ id: 1, name: "Author", options: ["Tim Chester"] }],
    meta_data: [],
  },
  {
    id: 38738,
    name: "A Very Noisy Christmas",
    slug: "a-very-noisy-christmas",
    permalink: "https://admin.forthetruth.in/product/a-very-noisy-christmas/",
    description: "A fun, delightful retelling of the Christmas story for children aged 2-4.",
    short_description: "A fun, delightful, noisy retelling of the Christmas story for children aged 2-4. Invites children to join in with joyful shouts and sounds of praise.",
    sku: "TGSAverynoisychristmas",
    price: "249",
    regular_price: "499",
    sale_price: "249",
    on_sale: true,
    stock_status: "instock",
    stock_quantity: null,
    average_rating: "5.00",
    rating_count: 1,
    images: [
      {
        id: 38739,
        src: "https://admin.forthetruth.in/wp-content/uploads/2023/08/A-Very-Noisy-Christmas-1.jpg",
        alt: "A Very Noisy Christmas cover",
      },
    ],
    categories: [
      { id: 114, name: "Children", slug: "children" },
      { id: 1838, name: "Christmas Sale!", slug: "christmas-sale" },
    ],
    attributes: [{ id: 1, name: "Author", options: ["Tim Thornborough"] }],
    meta_data: [],
  },
  {
    id: 36738,
    name: "Love Came Down at Christmas",
    slug: "love-came-down-at-christmas",
    permalink: "https://admin.forthetruth.in/product/love-came-down-at-christmas/",
    description: "Sinclair Ferguson offers a warm and enriching 24-day Advent devotional exploring 1 Corinthians 13.",
    short_description: "Sinclair Ferguson offers a warm and enriching 24-day Advent devotional exploring 1 Corinthians 13 to fix our eyes on the incarnate love of Christ.",
    sku: "TGSLovecamedownatchristmas",
    price: "499",
    regular_price: "699",
    sale_price: "499",
    on_sale: true,
    stock_status: "instock",
    stock_quantity: null,
    average_rating: "5.00",
    rating_count: 1,
    images: [
      {
        id: 36739,
        src: "https://admin.forthetruth.in/wp-content/uploads/2023/07/Love-Came-Down-at-Christmas-5.jpg",
        alt: "Love Came Down at Christmas cover",
      },
    ],
    categories: [
      { id: 112, name: "Devotional", slug: "devotional" },
      { id: 1838, name: "Christmas Sale!", slug: "christmas-sale" },
    ],
    attributes: [{ id: 1, name: "Author", options: ["Sinclair B. Ferguson"] }],
    meta_data: [],
  },
];

/** Author fallback resolver for clean metadata */
const KNOWN_AUTHORS: Record<number, string> = {
  36828: "Steph Williams",
  35515: "Tim Chester",
  38738: "Tim Thornborough",
  36738: "Sinclair B. Ferguson",
};

interface ChristmasHeroBannerProps {
  products?: Product[];
  badge?: string;
  title?: string;
  subtitle?: string;
  autoPlayInterval?: number;
}

export function ChristmasHeroBanner({
  products = [],
  badge = "CHRISTMAS BOOK SALE • SPECIAL OFFERS",
  title = "Christmas Sale, Joy & Truth for the Season",
  subtitle = "Celebrate Christ's incarnation with hand-picked advent devotionals, family guides, and delightful children's storybooks.",
  autoPlayInterval = 5500,
}: ChristmasHeroBannerProps) {
  // Merge provided products with guaranteed fallback order for the 4 books
  const finalProducts = useMemo(() => {
    const passedMap = new Map((products || []).filter(Boolean).map((p) => [p.id, p]));
    const fallbackMap = new Map(CHRISTMAS_FALLBACK_BOOKS.map((p) => [p.id, p]));

    return CHRISTMAS_SALE_BOOK_IDS.map((id) => {
      const fromPassed = passedMap.get(id);
      if (fromPassed && fromPassed.name) return fromPassed;
      return fallbackMap.get(id)!;
    }).filter(Boolean);
  }, [products]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = finalProducts.length;

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

  // Auto-play timer
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

  const activeBook = finalProducts[currentIndex] || finalProducts[0];
  const author = activeBook
    ? getAuthor(activeBook) || KNOWN_AUTHORS[activeBook.id] || "For The Truth"
    : undefined;

  const rawDescription = activeBook ? activeBook.short_description || activeBook.description || "" : "";
  const excerpt = cleanExcerpt(rawDescription, 140);
  const bookName = activeBook ? decodeHtmlEntities(activeBook.name) : "";

  // Discount calculations
  const priceNum = activeBook ? parseFloat(activeBook.price || activeBook.sale_price || "0") : 0;
  const regularNum = activeBook
    ? parseFloat(activeBook.regular_price || activeBook.price || "0")
    : 0;
  const hasDiscount = regularNum > priceNum && priceNum > 0;
  const discountPercent = hasDiscount ? Math.round(((regularNum - priceNum) / regularNum) * 100) : 0;
  const savingsAmount = hasDiscount ? Math.round(regularNum - priceNum) : 0;

  const titleParts = title.includes(",") ? title.split(",") : [title, ""];

  return (
    <section
      className="relative z-0 isolate px-3 sm:px-6 pt-2 sm:pt-4 md:pt-8 lg:px-8 w-full max-w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Christmas Sale Hero Banner"
    >
      <div className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-gradient-to-br from-[#FFFDF8] via-[#FAF6ED] to-[#F3EDE0] border border-amber-300/35 shadow-panel group/hero flex flex-col justify-between min-h-[480px] lg:h-auto lg:min-h-0">
        <h1 className="sr-only">
          {title} — For The Truth Online Christian Bookstore India
        </h1>

        {/* Subtle festive background layers */}
        <div className="pointer-events-none absolute inset-0 bg-cream-mesh opacity-90" />
        <div className="pointer-events-none absolute inset-0 bg-paper-texture opacity-40" />

        {/* Ambient festive holiday glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-red-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial from-amber-400/5 via-transparent to-transparent pointer-events-none" />

        {/* Elegant decorative holiday stars in corners */}
        <span
          className="pointer-events-none absolute top-4 right-6 text-amber-500/35 text-xl select-none"
          aria-hidden="true"
        >
          ✦
        </span>
        <span
          className="pointer-events-none absolute top-12 right-24 text-red-500/25 text-sm select-none"
          aria-hidden="true"
        >
          ✦
        </span>
        <span
          className="pointer-events-none absolute bottom-6 left-8 text-emerald-600/30 text-lg select-none"
          aria-hidden="true"
        >
          ✦
        </span>

        <div className="relative flex-1 min-h-0 flex flex-col justify-center items-center px-4 sm:px-8 py-5 sm:py-8 md:px-12 lg:grid lg:grid-cols-[1.1fr_auto_0.9fr] lg:items-center lg:gap-8 lg:px-14 lg:py-14">
          {/* ---------- LEFT: Headline, Festive Badges & Actions (Only on Desktop, hidden on Mobile & Tablet) ---------- */}
          <div className="hidden lg:block w-full text-center lg:text-left lg:max-w-md xl:max-w-lg">
            {/* Festive Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-800/10 border border-emerald-700/25 text-emerald-900 text-xs font-bold uppercase tracking-wider shadow-xs mb-3">
              <span>{badge}</span>
            </div>

            <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-[2rem] xl:text-[2.2rem] font-black leading-[1.25] text-charcoal [text-wrap:balance]">
              {titleParts[0]}
              {titleParts[1] ? (
                <>
                  ,<br className="hidden sm:inline" />
                  <em className="text-gradient-gold block sm:inline mt-1 sm:mt-0 font-italic">
                    {" "}
                    {titleParts[1].trim()}
                  </em>
                </>
              ) : (
                ""
              )}
            </h2>

            {subtitle && (
              <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-charcoal/70 max-w-md mx-auto lg:mx-0">
                {subtitle}
              </p>
            )}

            {/* CTAs */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link
                href="/categories/christmas-sale"
                className="btn-cta text-sm px-7 py-3.5 shadow-md flex items-center gap-2 group"
              >
                <span>Shop Christmas Sale</span>
                <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </Link>
              <Link
                href="/shop?orderby=popularity"
                className="btn-outline text-sm px-7 py-3.5"
              >
                Bestsellers
              </Link>
            </div>

            {/* Holiday Value Perks */}
            <ul className="mt-6 sm:mt-8 space-y-2 max-w-sm mx-auto lg:mx-0 text-left">
              <li className="flex items-center gap-2.5 text-[13px] font-semibold text-charcoal/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A67C1F] shrink-0" aria-hidden="true" />
                <span>Free Express Shipping across India over ₹150</span>
              </li>
              <li className="flex items-center gap-2.5 text-[13px] font-semibold text-charcoal/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A67C1F] shrink-0" aria-hidden="true" />
                <span>100% Biblically Sound Literature Guaranteed</span>
              </li>
            </ul>
          </div>

          {/* ---------- CENTRE: Book Cover Image ---------- */}
          <div className="relative flex justify-center items-center py-4 lg:py-2 lg:col-span-1 md:min-h-[420px]">
            {activeBook ? (
              <div className="relative group">
                <ChristmasBookImage product={activeBook} />
              </div>
            ) : (
              <ChristmasBookSkeleton />
            )}
          </div>

          {/* ---------- RIGHT: Active Book Details & 4-Book Interactive Switcher ---------- */}
          {activeBook && (
            <div className="w-full text-center lg:text-left lg:col-span-1 flex flex-col justify-between shrink-0 lg:min-h-[360px] mt-4 sm:mt-0">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeBook.id}
                  custom={direction}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mb-2">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A67C1F]">
                      CHRISTMAS BOOKS SALE
                    </p>
                  </div>

                  <Link href={`/products/${activeBook.slug}`} className="block group">
                    <h3 className="font-display text-xl sm:text-2xl lg:text-[26px] font-bold leading-snug text-charcoal transition-colors group-hover:text-gold-dark line-clamp-2">
                      {bookName}
                    </h3>
                  </Link>

                  {/* Pricing with Regular Price */}
                  <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                    <span className="font-display text-2xl sm:text-3xl font-black text-[#A67C1F]">
                      {formatPrice(activeBook.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm sm:text-base text-charcoal/40 line-through">
                        {formatPrice(activeBook.regular_price)}
                      </span>
                    )}
                  </div>

                  {author && (
                    <p className="mt-2 text-xs sm:text-sm font-bold italic text-charcoal/70 line-clamp-1">
                      — {author}
                    </p>
                  )}

                  {/* View Book CTA */}
                  <div className="mt-4">
                    <Link
                      href={`/products/${activeBook.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#A67C1F] transition-smooth hover:gap-3.5 hover:text-[#8a6516]"
                    >
                      <span>View this book</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>

                  {/* ---------- 4-Book Interactive Thumbnail Switcher ---------- */}
                  <div className="mt-6 pt-4 border-t border-charcoal/10">
                    <div
                      className="grid grid-cols-4 gap-2"
                      role="tablist"
                      aria-label="Christmas Sale books pagination"
                    >
                      {finalProducts.map((p, idx) => {
                        const isActive = currentIndex === idx;
                        const img = p.images?.[0];
                        const pPrice = p.price || p.sale_price;

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => goToSlide(idx)}
                            aria-label={`View ${p.name}`}
                            aria-selected={isActive}
                            role="tab"
                            className={`group/thumb relative flex flex-col items-center p-1.5 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                              isActive
                                ? "bg-white border-amber-500 shadow-md ring-2 ring-amber-400/30 -translate-y-0.5"
                                : "bg-white/60 hover:bg-white border-charcoal/10 hover:border-amber-300"
                            }`}
                          >
                            <div className="relative h-12 w-9 sm:h-14 sm:w-10 overflow-hidden rounded shadow-xs bg-cream shrink-0">
                              {img?.src ? (
                                <img
                                  src={toCdnImageUrl(img.src)}
                                  alt={p.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[9px] font-bold bg-amber-100 text-amber-900">
                                  Book
                                </div>
                              )}
                            </div>
                            <span className="mt-1 font-display text-sm font-black text-[#A67C1F] line-clamp-1">
                              {formatPrice(pPrice)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* ---------- Slide Indicator Dots ---------- */}
              {total > 1 && (
                <div className="mt-4 flex items-center justify-center lg:justify-start gap-1.5">
                  {finalProducts.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => goToSlide(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        currentIndex === idx ? "w-6 bg-amber-600" : "w-1.5 bg-charcoal/20"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ChristmasBookImage({ product }: { product: Product }) {
  const image = product.images && product.images[0];
  const title = decodeHtmlEntities(product.name);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex items-center justify-center p-1 sm:p-2"
      aria-label={product.name}
    >
      {image ? (
        <img
          src={toCdnImageUrl(image.src)}
          alt={decodeHtmlEntities(image.alt || product.name)}
          decoding="async"
          className="max-h-[320px] sm:max-h-[380px] md:max-h-[420px] w-auto max-w-full object-contain rounded-lg shadow-book-lg select-none transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-[320px] sm:h-[380px] w-[220px] sm:w-[260px] items-center justify-center rounded-lg bg-gold-gradient p-6 text-center shadow-book-lg">
          <span className="font-display text-xl italic text-white">{title}</span>
        </div>
      )}
    </Link>
  );
}

function ChristmasBookSkeleton() {
  return (
    <div className="relative">
      <div className="skeleton h-[320px] sm:h-[380px] w-[220px] sm:w-[260px] rounded-[3px] rounded-r-md md:h-[400px] md:w-[275px]" />
      <span
        aria-hidden="true"
        className="absolute -bottom-6 left-1/2 h-6 w-[78%] -translate-x-1/2 rounded-[50%] bg-charcoal/15 blur-xl"
      />
    </div>
  );
}
