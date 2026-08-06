"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/utils/currency";

export function CartNotification() {
  const notification = useCartStore((s) => s.notification);
  const clearNotification = useCartStore((s) => s.clearNotification);
  const totalCount = useCartStore((s) => s.getCount());

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      clearNotification();
    }, 4500);
    return () => clearTimeout(timer);
  }, [notification, clearNotification]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-[calc(100%-3rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl border-2 border-gold/40 bg-white p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Accent gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-gold-dark to-navy" />

        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-black text-xl shadow-sm">
            ✓
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                Added to Cart
              </span>
              <button
                onClick={clearNotification}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-full hover:bg-slate-100 transition-colors"
                title="Close notification"
              >
                ✕
              </button>
            </div>

            <p className="mt-1 font-serif text-base font-bold text-navy truncate">
              {notification.name}
            </p>
            <p className="text-xs font-semibold text-slate-500">
              {formatPrice(notification.price.toString())} • {totalCount} {totalCount === 1 ? "item" : "items"} in cart
            </p>

            <div className="mt-3.5 flex items-center gap-2.5">
              <Link
                href="/cart"
                onClick={clearNotification}
                className="flex-1 rounded-xl bg-navy px-4 py-2 text-center text-xs font-display font-bold text-white hover:bg-gold-dark hover:text-navy transition-all shadow-sm"
              >
                View Cart &amp; Checkout →
              </Link>
              <button
                type="button"
                onClick={clearNotification}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
