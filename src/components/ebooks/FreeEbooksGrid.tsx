"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";

interface Props {
  books: Product[];
}

function EbookCard({ book }: { book: Product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const items = useCartStore((s) => s.items);
  const [added, setAdded] = useState(false);

  const inCart = items.some((i) => i.productId === book.id);
  const cover = book.images?.[0]?.src ?? "/placeholder-book.png";
  const author = book.attributes?.find(
    (a) => a.name.toLowerCase() === "author" || a.name.toLowerCase() === "by"
  )?.options?.[0] ?? "";

  const handleAddToCart = () => {
    addToCart({
      productId: book.id,
      name: book.name,
      price: 0,
      image: cover,
      slug: book.slug,
      isVirtual: true,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="group flex flex-col rounded-3xl border border-sand/60 bg-white shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Cover */}
      <div className="relative h-56 w-full bg-cream overflow-hidden">
        <Link href={`/products/${book.slug}`}>
          <Image
            src={cover}
            alt={book.name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
        {/* Free badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          FREE
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/products/${book.slug}`}>
          <h3 className="font-display text-lg font-bold leading-tight text-charcoal line-clamp-2 hover:text-gold-dark transition-colors">
            {book.name}
          </h3>
        </Link>
        {author && (
          <p className="mt-1 text-sm text-charcoal/60">by {author}</p>
        )}

        {/* Price row */}
        <div className="mt-3 flex items-center gap-2">
          <span className="font-display text-xl font-black text-emerald-600">FREE</span>
          <span className="text-sm text-charcoal/40 line-through">₹0.00</span>
        </div>

        {book.short_description && (
          <p
            className="mt-2 text-sm text-charcoal/70 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: book.short_description }}
          />
        )}

        <div className="mt-auto pt-4 space-y-2">
          {/* In-cart notice */}
          {inCart && !added && (
            <Link
              href="/cart"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gold bg-gold/5 px-4 py-2.5 text-sm font-bold text-gold-dark transition hover:bg-gold/10"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M20 6 9 17l-5-5"/></svg>
              In Cart — View Cart
            </Link>
          )}

          {/* Added animation */}
          {added && (
            <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm font-bold text-emerald-700">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M20 6 9 17l-5-5"/></svg>
              Added to Cart!
            </div>
          )}

          {/* Add to cart */}
          {!inCart && !added && (
            <button
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-dark to-gold px-4 py-3 text-sm font-bold text-navy shadow-sm transition hover:brightness-110 active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Get Free E-Book
            </button>
          )}

          <Link
            href={`/products/${book.slug}`}
            className="block text-center text-xs text-charcoal/50 hover:text-gold-dark transition-colors"
          >
            View details →
          </Link>
        </div>
      </div>
    </article>
  );
}

export function FreeEbooksGrid({ books }: Props) {
  if (books.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-dark" aria-hidden>
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-charcoal">No Free E-Books Yet</h2>
        <p className="mt-2 text-charcoal/60">Check back soon — we&apos;re adding more titles regularly.</p>
        <Link href="/products" className="btn-gold mt-6 inline-flex">Browse All Books</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book) => (
        <EbookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
