"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { ProductCard } from "@/components/products/ProductCard";
import { useWishlistStore } from "@/store/wishlistStore";
import { useWishlistSync } from "@/hooks/useWishlistSync";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@/types/product";

export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const [products, setProducts] = useState<Product[] | null>(null);
  const { user, loading: authLoading } = useAuth();

  // Activate cloud sync on the wishlist page as well
  useWishlistSync();

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/products?include=${productIds.join(",")}`)
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]));
  }, [productIds]);

  const isLoggedIn = !authLoading && !!user;

  return (
    <AccountShell title="Wishlist">
      {/* Cloud sync status badge */}
      {isLoggedIn && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-gold-dark/20 bg-amber-50 px-4 py-2.5 text-sm text-gold-dark shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 shrink-0 text-gold-dark"
          >
            <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
          </svg>
          <span className="font-medium">Synced across your devices</span>
          <span className="text-charcoal/50">— your wishlist is saved to your account</span>
        </div>
      )}

      {products === null ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[2/3] rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand bg-white p-16 text-center">
          <p className="font-display text-xl text-charcoal/60">
            Your wishlist is empty.
          </p>
          <p className="mt-2 text-sm text-charcoal/45">
            Tap the heart on any book to save it here.
          </p>
          <Link href="/products" className="btn-gold mt-6 inline-flex">
            Browse the Shelves
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </AccountShell>
  );
}
