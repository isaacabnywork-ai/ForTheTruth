"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { ProductCard } from "@/components/products/ProductCard";
import { useWishlistStore } from "@/store/wishlistStore";
import type { Product } from "@/types/product";

export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const [products, setProducts] = useState<Product[] | null>(null);

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

  return (
    <AccountShell title="Wishlist">
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
