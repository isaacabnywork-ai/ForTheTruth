"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { RatingStars } from "@/components/products/RatingStars";
import { formatPrice } from "@/utils/currency";
import { READER_TRUST } from "@/utils/constants";
import { getAuthor, type Product } from "@/types/product";

/**
 * Hero panel in a reading-dashboard layout:
 * left — headline, search, CTAs · centre — floating 3D book · right — book details.
 */
interface HeroShelfProps {
  products: Product[];
  badge?: string;
  title?: string;
  subtitle?: string;
}

export function HeroShelf({
  products,
  badge = "Independent Christian Bookstore",
  title = "Happy reading, friend",
  subtitle = "600+ handpicked titles on Bible study, devotion, prayer, and Christian living. Sound doctrine, honest prices, delivered across India.",
}: HeroShelfProps) {
  const hero = products[0];
  const author = hero ? getAuthor(hero) : undefined;

  const excerpt = hero
    ? (hero.short_description || hero.description)
        .replace(/<[^>]+>/g, "")
        .slice(0, 150)
    : "";

  const titleParts = title.includes(",") ? title.split(",") : [title, ""];

  return (
    <section className="px-3 sm:px-6 md:pt-8 lg:px-8 w-full max-w-full overflow-hidden">
      <div className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-white shadow-panel">
        <div className="pointer-events-none absolute inset-0 bg-cream-mesh opacity-80" />
        <div className="pointer-events-none absolute inset-0 bg-paper-texture opacity-50" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative grid items-center gap-8 sm:gap-10 px-5 sm:px-8 py-8 sm:py-12 md:px-12 md:grid-cols-2 lg:grid-cols-[1.05fr_auto_0.95fr] lg:gap-8 lg:px-14 lg:py-16"
        >
          {/* ---------- LEFT: Headline & Actions (spans full width on phone & tablet top row) ---------- */}
          <div className="text-center md:col-span-2 lg:col-span-1 lg:text-left">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.28em] text-gold-dark">
              {badge}
            </p>

            <h1 className="mt-4 sm:mt-5 font-display text-3xl sm:text-4xl md:text-display-sm lg:text-display-md font-black leading-tight text-charcoal">
              {titleParts[0]}
              {titleParts[1] ? (
                <>
                  ,<br className="hidden sm:inline" />
                  <em className="text-gradient-gold"> {titleParts[1].trim()}</em>
                </>
              ) : (
                ""
              )}
            </h1>

            <p className="mx-auto mt-4 sm:mt-5 max-w-md sm:text-[15px] leading-relaxed text-charcoal/65 lg:mx-0 text-xs sm:text-sm">
              {subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link href="/products" className="btn-cta text-xs sm:text-sm px-6 py-3 sm:px-8 sm:py-3.5">
                Start Browsing <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/products?orderby=popularity" className="btn-outline text-xs sm:text-sm px-6 py-3 sm:px-8 sm:py-3.5">
                Bestsellers
              </Link>
            </div>

            <ul className="mt-6 sm:mt-8 space-y-2 max-w-sm mx-auto lg:mx-0">
              {READER_TRUST.map((t) => (
                <li
                  key={t.title}
                  className="flex items-center justify-center gap-2.5 lg:justify-start"
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
                  <span className="text-xs sm:text-[13px] font-semibold text-charcoal/70">
                    {t.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- CENTRE: Floating 3D Book (sits side-by-side on tablet with book details) ---------- */}
          <div className="flex justify-center py-2 sm:py-4 md:col-span-1 lg:col-span-1">
            {hero ? <FloatingBook product={hero} /> : <BookSkeleton />}
          </div>

          {/* ---------- RIGHT: Featured Book Summary ---------- */}
          {hero && (
            <div className="text-center md:text-left md:col-span-1 lg:col-span-1">
              <Link href={`/products/${hero.slug}`}>
                <h2 className="font-display text-xl sm:text-2xl md:text-[28px] lg:text-[32px] font-black leading-tight text-charcoal transition-colors hover:text-gold-dark">
                  {hero.name}
                </h2>
              </Link>

              <div className="mt-3 flex items-center justify-center md:justify-start gap-2">
                <span className="font-display text-xl sm:text-2xl font-black text-gold-dark">
                  {formatPrice(hero.price)}
                </span>
                {hero.on_sale && (
                  <span className="text-sm text-charcoal/45 line-through">
                    {formatPrice(hero.regular_price)}
                  </span>
                )}
              </div>

              {hero.rating_count > 0 && (
                <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
                  <RatingStars rating={parseFloat(hero.average_rating)} />
                  <span className="text-xs text-charcoal/55 font-semibold">
                    {parseFloat(hero.average_rating).toFixed(1)} ({hero.rating_count})
                  </span>
                </div>
              )}

              {excerpt && (
                <p className="mx-auto md:mx-0 mt-4 max-w-xs text-xs sm:text-sm leading-relaxed text-charcoal/70">
                  {excerpt}…
                </p>
              )}

              {author && (
                <p className="mt-4 sm:mt-6 text-xs sm:text-sm font-bold italic text-charcoal/60">— {author}</p>
              )}

              <Link
                href={`/products/${hero.slug}`}
                className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-gold-dark transition-smooth hover:gap-3.5"
              >
                View this book <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </motion.div>
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
            {product.images[0] ? (
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt || product.name}
                fill
                sizes="300px"
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
