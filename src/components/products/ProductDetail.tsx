"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { formatPrice } from "@/utils/currency";
import { getAuthor, type Product, type ProductReview } from "@/types/product";
import { RatingStars } from "./RatingStars";
import { ReviewForm } from "./ReviewForm";
import { SingleBookPaymentTrust } from "./SingleBookPaymentTrust";
import { triggerHaptic } from "@/utils/haptics";
import { useWishlistSync } from "@/hooks/useWishlistSync";
import { cleanHtmlDescription } from "@/utils/text";

interface ProductDetailProps {
  product: Product;
  reviews?: ProductReview[];
}

export function ProductDetail({ product, reviews = [] }: ProductDetailProps) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Sync wishlist with server for logged-in users (no-op for guests)
  useWishlistSync();

  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const wishlisted = useWishlistStore((s) => s.productIds.includes(product.id));
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addRecentlyViewed);

  // Track product view in recently viewed store
  useEffect(() => {
    if (product?.id) {
      addRecentlyViewed({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images?.[0]?.src || (product as unknown as { image?: string }).image,
        author: getAuthor(product),
      });
    }
  }, [product, addRecentlyViewed]);

  const author = getAuthor(product);
  const inStock = product.stock_status === "instock";
  const images = product.images.length > 0 ? product.images : [{ id: 0, src: "", alt: product.name }];
  const currentImage = images[selectedImg] || images[0];

  const scrollToIndex = (idx: number) => {
    if (idx < 0 || idx >= images.length) return;
    setSelectedImg(idx);
    const container = scrollContainerRef.current;
    if (container) {
      const targetChild = container.children[idx] as HTMLElement | undefined;
      if (targetChild) {
        targetChild.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      } else {
        container.scrollTo({
          left: container.clientWidth * idx,
          behavior: "smooth",
        });
      }
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newIdx = selectedImg > 0 ? selectedImg - 1 : images.length - 1;
    scrollToIndex(newIdx);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newIdx = selectedImg < images.length - 1 ? selectedImg + 1 : 0;
    scrollToIndex(newIdx);
  };

  // Keyboard navigation & body scroll lock when lightbox is open
  useEffect(() => {
    if (!isZoomOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsZoomOpen(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isZoomOpen, selectedImg, images.length]);

  const discount =
    product.on_sale && product.regular_price
      ? Math.round(
          (1 -
            parseFloat(product.sale_price || product.price) /
              parseFloat(product.regular_price)) *
            100
        )
      : 0;

  const handleAddToCart = () => {
    triggerHaptic("success");
    addToCart(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: parseFloat(product.price),
        image: currentImage.src,
        isVirtual: product.categories.some((c) => c.slug === "e-books"),
        weight: product.weight ? parseFloat(product.weight) : 0.4,
      },
      qty
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-0 pt-0 pb-28 sm:px-4 sm:pt-4 md:pt-6 lg:px-8 lg:py-12">
      {/* Breadcrumb Navigation (Desktop Only) */}
      <nav aria-label="Breadcrumb" className="mb-6 hidden items-center gap-2 text-xs text-charcoal/60 lg:flex px-4 lg:px-0">
        <Link href="/" className="hover:text-gold-dark">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gold-dark">Books</Link>
        {product.categories[0] && (
          <>
            <span>/</span>
            <Link href={`/products?category=${product.categories[0].slug}`} className="hover:text-gold-dark">
              {product.categories[0].name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="font-semibold text-charcoal truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Grid */}
      <div className="grid gap-6 md:grid-cols-12 lg:gap-12 items-start">
        {/* Left: Image Gallery (Full width, sticks to top on mobile/tablet) */}
        <div className="flex flex-col gap-4 md:col-span-5 lg:col-span-5 w-full max-w-none md:max-w-[420px] mx-auto md:mx-0">
          <div className="relative w-full group pt-0">
            {/* Native App-Style Mobile/Tablet Back Button */}
            <button
              onClick={() => window.history.back()}
              aria-label="Go back"
              className="absolute left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-md backdrop-blur-md transition-transform active:scale-95 lg:hidden border border-sand/50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Discount Badge */}
            {discount > 0 && (
              <span className="absolute left-2 top-2 z-20 hidden lg:inline-flex items-center rounded-full bg-gold-gradient px-3 py-1 text-xs font-bold text-white shadow-gold tracking-wide">
                −{discount}%
              </span>
            )}

            {/* Zoom / Lightbox Trigger Button */}
            {currentImage.src && (
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                aria-label="Enlarge image"
                title="Click to zoom"
                className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-md backdrop-blur-md transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95 border border-sand/60 opacity-90 sm:opacity-75"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
            )}

            {/* Prev / Next Carousel Controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous image"
                  className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-md border border-sand/70 backdrop-blur-md transition-all duration-200 active:scale-95"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next image"
                  className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-md border border-sand/70 backdrop-blur-md transition-all duration-200 active:scale-95"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}

            {/* Carousel Container — Full-Width Hardware-Accelerated Swiping */}
            <div 
              ref={scrollContainerRef}
              className="relative flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide items-start justify-start touch-pan-x select-none py-0 sm:py-2"
              style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                if (width > 0) {
                  const newIndex = Math.round(scrollLeft / width);
                  if (newIndex !== selectedImg && newIndex >= 0 && newIndex < images.length) {
                    setSelectedImg(newIndex);
                  }
                }
              }}
            >
              {images.map((img, idx) => (
                <div 
                  key={img.id || idx}
                  className="relative min-w-full w-full shrink-0 flex items-start justify-center snap-center snap-always select-none py-0 sm:py-2"
                  style={{ scrollSnapAlign: "center" }}
                >
                  {img.src ? (
                    <div className="relative flex items-start justify-center w-full px-0 sm:px-4 md:px-0">
                      <img
                        src={img.src}
                        alt={img.alt || product.name}
                        className="w-full h-auto max-h-[75vh] sm:max-h-[500px] md:max-h-[520px] object-contain object-top block drop-shadow-md"
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  ) : (
                    <div className="flex h-[360px] w-[240px] items-center justify-center bg-gold-gradient p-8 text-center rounded-r-md rounded-l-[2px] shadow-book-lg">
                      <span className="font-display text-2xl italic text-white">{product.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Swipe Pagination Dots Indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-black/40 backdrop-blur-md lg:hidden">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      selectedImg === i ? "w-4 bg-white" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto px-4 sm:px-0 pb-1 pt-1 scrollbar-hide justify-center md:justify-start">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={`relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border-2 p-0.5 bg-white/60 transition-all duration-200 ${
                    selectedImg === idx
                      ? "border-gold shadow-md ring-1 ring-gold/30 scale-105"
                      : "border-sand/60 opacity-70 hover:opacity-100 hover:border-gold/50"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    sizes="56px"
                    className="object-contain p-0.5"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Controls */}
        <div className="flex flex-col justify-start md:col-span-7 lg:col-span-7 px-4 sm:px-6 md:px-0">
          <div>
            <h1 className="mt-1 font-display text-3xl font-bold leading-tight text-charcoal md:text-4xl">
              {product.name}
            </h1>

            {author && (
              <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-gold-dark">
                By {author}
              </p>
            )}

            {/* Rating Stars */}
            <div className="mt-4 flex items-center gap-3">
              <RatingStars
                rating={parseFloat(product.average_rating)}
                count={product.rating_count}
              />
              <span className="text-xs text-charcoal/50">
                ({product.rating_count} {product.rating_count === 1 ? "review" : "reviews"})
              </span>
            </div>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-4">
              <span className="font-display text-3xl font-bold text-charcoal">
                {formatPrice(product.price)}
              </span>
              {product.on_sale && product.regular_price && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.regular_price)}
                </span>
              )}
            </div>

            {/* Short Excerpt Description - Clamped to 3 lines so Cart controls remain visible immediately */}
            {(product.short_description || product.description) && (
              <div
                className="prose prose-sm mt-4 line-clamp-3 text-charcoal/75 leading-relaxed text-sm"
                dangerouslySetInnerHTML={{
                  __html: product.short_description || product.description,
                }}
              />
            )}

            {/* Category Badges & Stock Status — Placed below description */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {product.categories.map((cat) => (
                <span key={cat.id} className="rounded-full border border-sand bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-charcoal/70">
                  {cat.name}
                </span>
              ))}
              {inStock ? (
                <span className="ml-auto rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                  In Stock
                </span>
              ) : (
                <span className="ml-auto rounded-full bg-charcoal/10 px-3 py-0.5 text-xs font-bold text-charcoal/60">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Action Row - Hidden on mobile & tablet preview per user instruction (keeps only the sticky add to cart bar) */}
          <div className="mt-6 border-t border-sand/80 pt-6 hidden lg:block">
            <div className="flex flex-wrap items-center gap-4">
              {/* Quantity selector */}
              <div className="flex items-center rounded-full border border-sand bg-cream/50 px-4 py-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-2 text-base font-bold text-charcoal/70 hover:text-gold-dark"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-bold text-charcoal">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-2 text-base font-bold text-charcoal/70 hover:text-gold-dark"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={inStock ? handleAddToCart : undefined}
                disabled={!inStock}
                className={`flex-1 !py-3.5 font-extrabold tracking-wide transition-all ${
                  inStock
                    ? "btn-gold shadow-gold hover:scale-[1.01] active:scale-95"
                    : "rounded-full bg-charcoal/15 text-charcoal/40 cursor-not-allowed"
                }`}
              >
                {inStock ? "Add to Cart" : "Out of Stock"}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => {
                  triggerHaptic("tap");
                  toggleWishlist(product.id);
                }}
                className={`rounded-full border p-3.5 transition-all duration-200 active:scale-95 ${
                  wishlisted
                    ? "border-gold bg-gold text-white shadow-gold"
                    : "border-sand bg-white text-charcoal/70 hover:border-gold hover:text-gold-dark"
                }`}
                aria-label="Toggle Wishlist"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={wishlisted ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>
            </div>

            {/* Guaranteed Safe Checkout & Secured by Razorpay */}
            <SingleBookPaymentTrust />
          </div>
        </div>
      </div>

      {/* Tabs: Overview & Reviews with Modern Icons & 1-Line Resilient Layout */}
      <div className="mt-12 border-t border-sand pt-6 px-4 sm:px-6 md:px-0">
        <div className="flex items-center gap-2 sm:gap-4 border-b border-sand pb-1 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("description")}
            className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 ${
              activeTab === "description"
                ? "bg-gold/15 text-gold-dark border border-gold/30 shadow-2xs"
                : "text-charcoal/60 hover:text-charcoal hover:bg-sand/30"
            }`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <span><span className="hidden sm:inline">Synopsis &amp; </span>Description</span>
          </button>

          <button
            onClick={() => setActiveTab("details")}
            className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 ${
              activeTab === "details"
                ? "bg-gold/15 text-gold-dark border border-gold/30 shadow-2xs"
                : "text-charcoal/60 hover:text-charcoal hover:bg-sand/30"
            }`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span><span className="hidden sm:inline">Additional </span>Information</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 ${
              activeTab === "reviews"
                ? "bg-gold/15 text-gold-dark border border-gold/30 shadow-2xs"
                : "text-charcoal/60 hover:text-charcoal hover:bg-sand/30"
            }`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Reviews ({reviews.length})</span>
          </button>
        </div>

        <div className="mt-6">
          {activeTab === "description" && (
            <div className="relative rounded-3xl border border-sand/80 bg-white/70 p-6 md:p-8 shadow-sm">
              <div
                className={`prose max-w-none text-sm text-charcoal/80 leading-relaxed transition-all duration-300 ${
                  isDescExpanded ? "" : "line-clamp-3 max-h-[5.5rem] overflow-hidden"
                }`}
                dangerouslySetInnerHTML={{
                  __html: cleanHtmlDescription(product.description || product.short_description),
                }}
              />

              {/* Fading overlay when collapsed */}
              {!isDescExpanded && (
                <div className="pointer-events-none absolute inset-x-0 bottom-16 h-12 bg-gradient-to-t from-white via-white/80 to-transparent" />
              )}

              {/* Read More / Less Button */}
              <div className="mt-4 pt-2 border-t border-sand/50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="inline-flex items-center gap-2 rounded-xl bg-navy/5 border border-navy/10 px-5 py-2.5 font-display text-xs font-extrabold uppercase tracking-wider text-navy transition-all hover:bg-navy hover:text-white group active:scale-[0.98] shadow-sm"
                >
                  {isDescExpanded ? (
                    <>
                      <span>↑ Show Less Description</span>
                    </>
                  ) : (
                    <>
                      <span>📖 Read More About This Book</span>
                      <span className="transition-transform group-hover:translate-y-0.5">↓</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-charcoal/40 font-medium hidden sm:inline-block">
                  {isDescExpanded ? "Full book overview shown" : "Showing preview summary"}
                </span>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="rounded-3xl border border-sand/80 bg-white/70 p-6 md:p-8 shadow-sm">
              <ul className="space-y-4 text-sm text-charcoal/80">
                {product.weight && (
                  <li className="flex flex-col sm:flex-row sm:gap-4 border-b border-sand/50 pb-3 last:border-0 last:pb-0">
                    <span className="font-bold text-charcoal min-w-[140px]">Weight</span>
                    <span>{product.weight} kg</span>
                  </li>
                )}
                {product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height) && (
                  <li className="flex flex-col sm:flex-row sm:gap-4 border-b border-sand/50 pb-3 last:border-0 last:pb-0">
                    <span className="font-bold text-charcoal min-w-[140px]">Dimensions</span>
                    <span>
                      {[product.dimensions.length, product.dimensions.width, product.dimensions.height]
                        .filter(Boolean)
                        .join(" × ")}{" "}
                      cm
                    </span>
                  </li>
                )}
                {(product.attributes || []).map((attr) => {
                  // If we already show author near title, we can optionally skip it here. But standard WC shows it. 
                  // We'll show all attributes as requested by the user.
                  return (
                    <li key={attr.id || attr.name} className="flex flex-col sm:flex-row sm:gap-4 border-b border-sand/50 pb-3 last:border-0 last:pb-0">
                      <span className="font-bold text-charcoal min-w-[140px] capitalize">{attr.name}</span>
                      <span>{attr.options.join(", ")}</span>
                    </li>
                  );
                })}
                {product.sku && (
                  <li className="flex flex-col sm:flex-row sm:gap-4 border-b border-sand/50 pb-3 last:border-0 last:pb-0">
                    <span className="font-bold text-charcoal min-w-[140px]">ISBN / SKU</span>
                    <span>{product.sku}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-8">
              {reviews.length > 0 ? (
                <>
                  {/* ── Summary Stats Bar ── */}
                  {(() => {
                    const avg =
                      reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
                    const dist = [5, 4, 3, 2, 1].map((star) => ({
                      star,
                      count: reviews.filter((r) => r.rating === star).length,
                    }));
                    return (
                      <div className="flex flex-col gap-5 rounded-3xl border border-sand bg-white p-6 shadow-card sm:flex-row sm:items-center sm:gap-10">
                        {/* Big average number */}
                        <div className="flex shrink-0 flex-col items-center gap-1">
                          <span className="font-display text-6xl font-black text-charcoal leading-none">
                            {avg.toFixed(1)}
                          </span>
                          {/* filled stars row */}
                          <div className="flex gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <svg key={s} width="18" height="18" viewBox="0 0 24 24"
                                fill={s <= Math.round(avg) ? "#C89B3C" : "#E6DFD1"}>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-charcoal/50 font-medium">
                            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                          </span>
                        </div>

                        {/* Star distribution bars */}
                        <div className="flex flex-1 flex-col gap-2">
                          {dist.map(({ star, count }) => {
                            const pct =
                              reviews.length > 0
                                ? Math.round((count / reviews.length) * 100)
                                : 0;
                            return (
                              <div key={star} className="flex items-center gap-3">
                                <span className="w-4 shrink-0 text-right text-xs font-semibold text-charcoal/60">
                                  {star}
                                </span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="#C89B3C" className="shrink-0">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-sand/60">
                                  <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold to-gold-dark transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="w-8 shrink-0 text-xs text-charcoal/50">
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── Individual Review Cards ── */}
                  <div className="space-y-4">
                    {reviews.map((rev) => {
                      // Format date as "August 2026"
                      const formattedDate = new Date(rev.date_created).toLocaleDateString(
                        "en-US",
                        { month: "long", year: "numeric" }
                      );

                      return (
                        <div
                          key={rev.id}
                          className="rounded-2xl bg-white border border-sand shadow-card p-5 transition-smooth hover:shadow-md"
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {/* Avatar circle with initials */}
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 font-display text-sm font-bold text-navy">
                                {rev.reviewer.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-charcoal text-sm">
                                    {rev.reviewer}
                                  </span>
                                  {rev.verified && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 border border-gold/25 px-2 py-0.5 text-[10px] font-bold text-gold-deep">
                                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                      </svg>
                                      Verified
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-charcoal/50">{formattedDate}</span>
                              </div>
                            </div>

                            {/* Star rating */}
                            <div className="flex shrink-0 gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <svg key={s} width="15" height="15" viewBox="0 0 24 24"
                                  fill={s <= rev.rating ? "#C89B3C" : "#E6DFD1"}>
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              ))}
                            </div>
                          </div>

                          {/* Review Text */}
                          <p className="mt-3 text-sm text-charcoal/75 leading-relaxed">
                            {rev.review.replace(/<[^>]*>?/gm, "")}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Share Your Thoughts ── */}
                  <div className="rounded-3xl border border-sand/80 bg-cream/40 p-6">
                    <h3 className="font-display text-xl font-bold text-charcoal mb-4">
                      Share Your Thoughts
                    </h3>
                    <ReviewForm productId={product.id} />
                  </div>
                </>
              ) : (
                /* ── Empty State ── */
                <div className="flex flex-col items-center gap-6 rounded-3xl border border-sand bg-white py-14 px-6 text-center shadow-card">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#C89B3C" opacity="0.8">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-charcoal">
                      Be the first to review this book
                    </h3>
                    <p className="mt-2 text-sm text-charcoal/55 max-w-sm mx-auto leading-relaxed">
                      Your review helps other readers discover great Christian literature. Share what moved you.
                    </p>
                  </div>
                  <div className="w-full max-w-lg">
                    <ReviewForm productId={product.id} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Quick Action Footer (Native App Experience) */}
      <div className="fixed bottom-[92px] left-1/2 -translate-x-1/2 z-40 flex w-[92vw] max-w-[440px] items-center justify-between gap-3 rounded-2xl border border-sand/80 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md transition-all duration-300 lg:hidden">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase text-charcoal/60 truncate max-w-[150px] sm:max-w-[220px]">
            {product.name}
          </span>
          <span className="font-display text-lg font-black text-charcoal">
            {formatPrice(product.price)}
          </span>
        </div>
        <button
          onClick={inStock ? handleAddToCart : undefined}
          disabled={!inStock}
          className={`!px-6 !py-2.5 !text-xs font-black tracking-wide shrink-0 transition-transform ${
            inStock
              ? "btn-gold shadow-md active:scale-95"
              : "rounded-full bg-charcoal/15 text-charcoal/40 cursor-not-allowed"
          }`}
        >
          {inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>

      {/* Lightbox / Zoom Modal */}
      {isZoomOpen && currentImage.src && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-charcoal/90 backdrop-blur-md p-4 sm:p-8 animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            aria-label="Close zoom preview"
            className="absolute top-4 right-4 z-[210] flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 backdrop-blur-md transition-all active:scale-95"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Lightbox Prev / Next Controls */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[210] flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 backdrop-blur-md transition-all active:scale-95"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[210] flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 backdrop-blur-md transition-all active:scale-95"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          {/* Active Image */}
          <div 
            className="relative flex items-center justify-center max-h-[88vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage.src}
              alt={currentImage.alt || product.name}
              className="max-h-[85vh] max-w-[88vw] object-contain drop-shadow-2xl rounded-lg select-none"
            />
          </div>

          {/* Counter in Lightbox */}
          {images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 backdrop-blur-md px-4 py-1 text-xs font-semibold text-white tracking-widest tabular-nums">
              {selectedImg + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
