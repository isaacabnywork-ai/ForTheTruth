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

  // On the single book page on mobile, ProductDetail already handles the bottom island
  const isSingleBookPage =
    Boolean(pathname?.startsWith("/products/")) &&
    !pathname?.startsWith("/products/search");

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      clearNotification();
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification, clearNotification]);

  if (!notification) return null;
  if (isSingleBookPage) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[100] transition-all duration-300 animate-in fade-in slide-in-from-bottom-3">
      <Link
        href="/cart"
        onClick={() => {
          triggerHaptic("tap");
          clearNotification();
        }}
        className="flex items-center justify-between gap-4 rounded-full bg-[#B98D2F] py-2 pl-2 pr-4.5 text-white shadow-[0_8px_30px_rgba(185,141,47,0.45)] transition-all active:scale-95"
        style={{ minWidth: "210px" }}
      >
        <div className="flex items-center gap-3">
          {/* Product Thumbnail */}
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/60 bg-white/20 shadow-xs flex items-center justify-center">
            {notification.image ? (
              <img
                src={toCdnImageUrl(notification.image)}
                alt={notification.name}
                decoding="async"
                className="h-full w-full object-cover select-none"
              />
            ) : (
              <div className="h-full w-full bg-white/20" />
            )}
          </div>

          {/* View Cart Text */}
          <div className="flex flex-col text-left">
            <span className="text-sm font-black text-white leading-tight">
              View cart
            </span>
            <span className="text-[11px] font-semibold text-white/90 leading-tight">
              {totalCount} {totalCount === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        {/* Right Chevron */}
        <svg
          className="h-5 w-5 text-white shrink-0 stroke-[2.5]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
