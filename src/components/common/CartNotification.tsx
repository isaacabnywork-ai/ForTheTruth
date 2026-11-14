"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { triggerHaptic } from "@/utils/haptics";
import { toCdnImageUrl } from "@/utils/imageUrl";

export function CartNotification() {
  const notification = useCartStore((s) => s.notification);
  const clearNotification = useCartStore((s) => s.clearNotification);
  const totalCount = useCartStore((s) => s.getCount());
  const pathname = usePathname();

  // On mobile (< lg), ProductDetail has its own bottom sticky bar.
  // On desktop (lg+), we ALWAYS show this notification!
  const isSingleBookPage =
    Boolean(pathname?.startsWith("/products/")) &&
    !pathname?.startsWith("/products/search");

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      clearNotification();
    }, 4500);
    return () => clearTimeout(timer);
  }, [notification, clearNotification]);

  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[100] transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
        isSingleBookPage ? "hidden lg:block" : "block"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-sand/80 bg-white/95 p-3 pr-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-md">
        {/* Product Thumbnail */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-sand bg-cream/40 shadow-2xs">
          {notification.image ? (
            <img
              src={toCdnImageUrl(notification.image)}
              alt={notification.name}
              decoding="async"
              className="h-full w-full object-cover select-none"
            />
          ) : (
            <div className="h-full w-full bg-sand/30" />
          )}
        </div>

        {/* Content & Feedback */}
        <div className="flex flex-col text-left max-w-[200px] sm:max-w-[240px]">
          <div className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px]">
              ✓
            </span>
            <span className="text-xs font-bold text-emerald-700">Added to Cart</span>
          </div>
          <span className="text-xs font-bold text-charcoal truncate mt-0.5" title={notification.name}>
            {notification.name}
          </span>
          <span className="text-[11px] text-charcoal/60">
            {totalCount} {totalCount === 1 ? "item" : "items"} in cart
          </span>
        </div>

        {/* Action Button: View Cart */}
        <Link
          href="/cart"
          onClick={() => {
            triggerHaptic("tap");
            clearNotification();
          }}
          className="ml-2 btn-gold !py-2 !px-3.5 !text-xs font-bold shrink-0 !rounded-xl shadow-xs hover:scale-105 active:scale-95"
        >
          View Cart
        </Link>

        {/* Dismiss close button */}
        <button
          type="button"
          onClick={() => clearNotification()}
          className="text-charcoal/40 hover:text-charcoal p-1 transition-colors -mr-1"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
