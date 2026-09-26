"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/utils/currency";
import { getAuthor, type Product, type ProductReview } from "@/types/product";
import { RatingStars } from "./RatingStars";
import { ReviewForm } from "./ReviewForm";
import { triggerHaptic } from "@/utils/haptics";
import { useWishlistSync } from "@/hooks/useWishlistSync";

interface ProductDetailProps {
  product: Product;
  reviews?: ProductReview[];
}

export function ProductDetail({ product, reviews = [] }: ProductDetailProps) {
  const [selectedImg, setSelectedImg] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Sync wishlist with server for logged-in users (no-op for guests)
  useWishlistSync();

  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const wishlisted = useWishlistStore((s) => s.productIds.includes(product.id));

  const author = getAuthor(product);
  const inStock = product.stock_status === "instock";
  const images = product.images.length > 0 ? product.images : [{ id: 0, src: "", alt: product.name }];
  const currentImage = images[selectedImg] || images[0];

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
      },
      qty
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-28 sm:pt-10 md:pt-12 lg:px-8 lg:py-12">
      {/* Breadcrumb Navigation (Desktop Only) */}
      <nav aria-label="Breadcrumb" className="mb-6 hidden items-center gap-2 text-xs text-charcoal/60 lg:flex">
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
      <div className="grid gap-8 md:grid-cols-12 lg:gap-12 items-start">
        {/* Left: Image Gallery (Compact / Medium Cover Size) */}
        <div className="flex flex-col gap-4 md:col-span-5 lg:col-span-5 w-full max-w-[350px] mx-auto md:mx-0">
          <div 
            ref={scrollContainerRef}
            className="relative flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-2xl border border-sand bg-cream/50 shadow-book-lg"
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const width = e.currentTarget.clientWidth;
              const newIndex = Math.round(scrollLeft / width);
              if (newIndex !== selectedImg) {
                setSelectedImg(newIndex);
              }
            }}
          >
            {/* Native App-Style Mobile/Tablet Back Button */}
            <button
              onClick={() => window.history.back()}
              aria-label="Go back"
              className="absolute left-3.5 top-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-md backdrop-blur-md transition-transform active:scale-95 lg:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {images.map((img, idx) => (
              <div 
                key={img.id || idx}
                className="relative min-w-full aspect-[3/4] snap-center snap-always transition-transform duration-300 hover:scale-[1.01]"
              >
                {img.src ? (
                  <Image
                    src={img.src}
                    alt={img.alt || product.name}
                    fill
                    priority={idx === 0}
                    fetchPriority={idx === 0 ? "high" : "auto"}
                    sizes="(max-width: 768px) 100vw, 350px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gold-gradient p-8 text-center">
                    <span className="font-display text-2xl italic text-white">{product.name}</span>
                  </div>
                )}
                {/* Spine shadow line */}
                <div className="absolute inset-y-0 left-0 w-[8px] bg-gradient-to-r from-black/30 to-transparent" />
                
                {discount > 0 && idx === 0 && (
                  <span className="absolute right-3.5 top-3.5 z-20 rounded-full bg-gold-gradient px-3 py-1 text-xs font-bold text-white shadow-gold lg:left-4 lg:right-auto lg:top-4">
                    −{discount}%
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => {
                    setSelectedImg(idx);
                    if (scrollContainerRef.current) {
                      scrollContainerRef.current.scrollTo({
                        left: scrollContainerRef.current.clientWidth * idx,
                        behavior: "smooth"
                      });
                    }
                  }}
                  className={`relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImg === idx ? "border-gold shadow-md scale-105" : "border-sand/60 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img.src} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Controls */}
        <div className="flex flex-col justify-start md:col-span-7 lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {product.categories.map((cat) => (
                <span key={cat.id} className="rounded-full border border-sand bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-charcoal/70">
                  {cat.name}
                </span>
              ))}
              {inStock ? (
                <span className="ml-auto rounded-full bg-gold/15 px-3 py-0.5 text-xs font-bold text-gold-deep">
                  In Stock
                </span>
              ) : (
                <span className="ml-auto rounded-full bg-royal/15 px-3 py-0.5 text-xs font-bold text-royal">
                  Pre-order
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-charcoal md:text-4xl">
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
            <div
              className="prose prose-sm mt-4 line-clamp-3 text-charcoal/75 leading-relaxed text-sm"
              dangerouslySetInnerHTML={{
                __html: product.short_description || product.description,
              }}
            />
          </div>

          {/* Action Row - Placed directly below description without empty gap */}
          <div className="mt-6 border-t border-sand/80 pt-6">
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
              <button onClick={handleAddToCart} className="btn-gold flex-1 !py-3.5 shadow-gold hover:scale-[1.01] active:scale-95 font-extrabold tracking-wide transition-transform">
                {inStock ? "Add to Cart" : "Pre-order Now"}
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

            {/* Extra Trust Badges */}
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-charcoal/70 bg-sand/20 rounded-2xl p-3.5 border border-sand/50">
              <div className="flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold-dark text-sm">🚚</span>
                <span>Free shipping over ₹499</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy/10 text-navy text-sm">🔒</span>
                <span>Razorpay Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Overview & Reviews */}
      <div className="mt-14 border-t border-sand pt-8">
        <div className="flex gap-8 border-b border-sand pb-3">
          <button
            onClick={() => setActiveTab("description")}
            className={`font-serif text-lg font-bold transition-colors ${
              activeTab === "description" ? "text-gold-dark border-b-2 border-gold pb-3 -mb-3.5" : "text-charcoal/50 hover:text-charcoal"
            }`}
          >
            Synopsis &amp; Description
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`font-serif text-lg font-bold transition-colors ${
              activeTab === "details" ? "text-gold-dark border-b-2 border-gold pb-3 -mb-3.5" : "text-charcoal/50 hover:text-charcoal"
            }`}
          >
            Additional Information
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`font-serif text-lg font-bold transition-colors ${
              activeTab === "reviews" ? "text-gold-dark border-b-2 border-gold pb-3 -mb-3.5" : "text-charcoal/50 hover:text-charcoal"
            }`}
          >
            Reader Reviews ({reviews.length})
          </button>
        </div>

        <div className="mt-6">
          {activeTab === "description" && (
            <div className="relative rounded-3xl border border-sand/80 bg-white/70 p-6 md:p-8 shadow-sm">
              <div
                className={`prose max-w-none text-sm text-charcoal/80 leading-relaxed transition-all duration-300 ${
                  isDescExpanded ? "" : "line-clamp-3 max-h-[5.5rem] overflow-hidden"
                }`}
                dangerouslySetInnerHTML={{ __html: product.description || product.short_description }}
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
          onClick={handleAddToCart}
          className="btn-gold !px-6 !py-2.5 !text-xs font-black tracking-wide shadow-md active:scale-95 shrink-0 transition-transform"
        >
          {inStock ? "Add to Cart" : "Pre-order"}
        </button>
      </div>
    </div>
  );
}
