"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/utils/currency";

const FREE_SHIPPING_THRESHOLD = 499;
const FLAT_SHIPPING = 49;

export default function CartPage() {
  const { items, updateQuantity, removeFromCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="font-display text-3xl font-bold text-charcoal/70">
          Your cart is empty
        </p>
        <p className="mt-3 text-sm text-charcoal/45">
          The shelves are full though — go take a look.
        </p>
        <Link href="/products" className="btn-gold mt-8 inline-flex">
          Browse the Shelves
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <p className="overline-label mb-2">Almost there</p>
      <h1 className="font-display text-3xl font-bold md:text-4xl">Your Cart</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-5 rounded-2xl border border-sand bg-white p-4 shadow-card"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative block h-28 w-20 shrink-0 overflow-hidden rounded-lg shadow-book"
              >
                {item.image ? (
                  <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-gold-gradient" />
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-serif font-bold leading-snug hover:text-gold-dark"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-charcoal/50">
                  {formatPrice(item.price)} each
                </p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-sand bg-cream/50">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="px-3 py-1.5 text-charcoal/60 hover:text-gold-dark"
                    >
                      −
                    </button>
                    <span className="min-w-7 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="px-3 py-1.5 text-charcoal/60 hover:text-gold-dark"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      aria-label={`Remove ${item.name}`}
                      className="text-charcoal/35 transition-smooth hover:text-red-500"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-sand bg-white p-6 shadow-card lg:sticky lg:top-32">
          <h2 className="font-serif text-lg font-bold">Order Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-charcoal/55">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-charcoal/55">Shipping</dt>
              <dd className="font-semibold">
                {shipping === 0 ? (
                  <span className="text-gold-deep">Free</span>
                ) : (
                  formatPrice(shipping)
                )}
              </dd>
            </div>
            {shipping > 0 ? (
              <p className="rounded-lg bg-gold/10 px-3 py-2 text-xs text-gold-deep">
                Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free delivery, or select <strong>Store Pickup (Free)</strong> at checkout.
              </p>
            ) : (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                ✓ Free Shipping applied! Or select Store Pickup at checkout.
              </p>
            )}
            <div className="flex justify-between border-t border-sand pt-4">
              <dt className="font-bold">Total</dt>
              <dd className="font-display text-xl font-bold text-gold-dark">
                {formatPrice(subtotal + shipping)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] text-charcoal/40">
            Final total (including any coupon) is confirmed at checkout.
          </p>
          <Link href="/checkout" className="btn-gold mt-6 w-full justify-center">
            Proceed to Checkout
          </Link>
          <Link
            href="/products"
            className="mt-3 block text-center text-xs font-semibold uppercase tracking-widest text-charcoal/45 hover:text-gold-dark"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
