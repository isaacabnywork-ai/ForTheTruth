"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/utils/currency";
import { getAuthor, type Product } from "@/types/product";
import { RatingStars } from "./RatingStars";
import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";

const FREE_SHIPPING_THRESHOLD = 499;

export function ProductCard({
  product,
  rank,
}: {
  product: Product;
  /** Optional bestseller rank badge (1-3 get medals) */
  rank?: number;
}) {
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const wishlisted = useWishlistStore((s) => s.productIds.includes(product.id));

  const author = getAuthor(product);
  const image = product.images[0];
  const inStock = product.stock_status === "instock";
  const price = parseFloat(product.price);
  const discount =
    product.on_sale && product.regular_price
      ? Math.round(
          (1 -
            parseFloat(product.sale_price || product.price) /
              parseFloat(product.regular_price)) *
            100
        )
      : 0;

  // "New" if created within the last 30 days isn't in the API subset,
  // so we treat top-rated + high review count as Bestseller instead.
  const isBestseller = product.rating_count >= 25;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    triggerHaptic("success");
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price,
      image: image?.src,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group relative flex flex-col"
    >
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-sand/60 to-cream shadow-card transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-card-hover">
        <Link href={`/products/${product.slug}`} className="relative block aspect-[2/3]">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt || product.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1200px) 30vw, 22vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gold-gradient p-4 text-center">
              <span className="font-display text-base italic leading-snug text-white">
                {product.name}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </Link>

        {/* Badges — top left, stacked */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {rank != null && rank <= 3 && (
            <span className="badge bg-navy text-white">
              {rank === 1 ? "🥇 #1" : rank === 2 ? "🥈 #2" : "🥉 #3"} Bestseller
            </span>
          )}
          {discount > 0 && (
            <span className="badge bg-gold-gradient text-white [text-shadow:0_1px_2px_rgba(120,85,40,0.35)]">
              −{discount}% off
            </span>
          )}
          {!inStock && <span className="badge bg-navy text-white">Pre-order</span>}
          {rank == null && isBestseller && inStock && discount === 0 && (
            <span className="badge bg-white/90 text-gold-deep">Bestseller</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            triggerHaptic("tap");
            toggleWishlist(product.id);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className={`absolute right-3 top-3 rounded-full p-2 shadow-md backdrop-blur transition-all duration-300 active:scale-90 ${
            wishlisted
              ? "bg-gold text-white"
              : "bg-white/90 text-charcoal/60 opacity-0 hover:bg-gold hover:text-white focus:opacity-100 group-hover:opacity-100"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>

        {/* Quick actions — slide up on hover */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 space-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleAdd}
            className="w-full rounded-full bg-cta py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-cta transition-smooth hover:bg-cta-light"
          >
            {added ? "Added ✓" : inStock ? "Add to Cart" : "Pre-order"}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="block w-full rounded-full bg-white/95 py-2 text-center text-[11px] font-bold uppercase tracking-widest text-charcoal/75 backdrop-blur transition-smooth hover:text-gold-dark"
          >
            Quick View
          </Link>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-1 px-1 pt-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-charcoal transition-colors group-hover:text-gold-dark">
            {product.name}
          </h3>
        </Link>
        {author && (
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
            {author}
          </p>
        )}

        <div className="flex items-center gap-1.5">
          <RatingStars rating={parseFloat(product.average_rating)} />
          {product.rating_count > 0 && (
            <span className="text-[11px] text-charcoal/45">
              {parseFloat(product.average_rating).toFixed(1)} ({product.rating_count})
            </span>
          )}
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-base font-bold text-charcoal">
              {formatPrice(product.price)}
            </span>
            {product.on_sale && (
              <span className="text-xs text-charcoal/35 line-through">
                {formatPrice(product.regular_price)}
              </span>
            )}
          </div>
          {price >= FREE_SHIPPING_THRESHOLD && (
            <p className="mt-1 text-[11px] font-semibold text-cta">
              Free shipping
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
