"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/utils/currency";
import { getAuthor, type Product, type ProductReview } from "@/types/product";
import { RatingStars } from "./RatingStars";
import { ReviewForm } from "./ReviewForm";

interface ProductDetailProps {
  product: Product;
  reviews?: ProductReview[];
}

export function ProductDetail({ product, reviews = [] }: ProductDetailProps) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");
  const [isDescExpanded, setIsDescExpanded] = useState(false);

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
    addToCart(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: parseFloat(product.price),
        image: currentImage.src,
      },
      qty
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:pt-10 md:pt-12 lg:px-8 lg:py-12">
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
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-sand bg-cream/50 shadow-book-lg transition-transform duration-300 hover:scale-[1.01]">
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

            {currentImage.src ? (
              <Image
                src={currentImage.src}
                alt={currentImage.alt || product.name}
                fill
                priority
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
            
            {discount > 0 && (
              <span className="absolute right-3.5 top-3.5 z-20 rounded-full bg-gold-gradient px-3 py-1 text-xs font-bold text-white shadow-gold lg:left-4 lg:right-auto lg:top-4">
                −{discount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImg(idx)}
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
            <div className="flex items-center gap-3">
              {product.categories.map((cat) => (
                <span key={cat.id} className="overline-label">
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
              <button onClick={handleAddToCart} className="btn-gold flex-1 !py-3.5 shadow-gold hover:scale-[1.01] active:scale-[0.99] font-extrabold tracking-wide">
                {inStock ? "Add to Cart" : "Pre-order Now"}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`rounded-full border p-3.5 transition-smooth ${
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

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <ReviewForm productId={product.id} />
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev.id} className="rounded-xl border border-sand bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-charcoal">{rev.reviewer}</p>
                      <RatingStars rating={rev.rating} />
                    </div>
                    <p className="mt-2 text-xs text-charcoal/70 leading-relaxed">
                      {rev.review.replace(/<[^>]*>?/gm, "")}
                    </p>
                    <p className="mt-2 text-[10px] text-charcoal/40">
                      {new Date(rev.date_created).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-charcoal/50 italic">
                  No reviews yet for this title. Be the first reader to share your thoughts!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
