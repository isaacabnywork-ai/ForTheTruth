"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { formatPrice } from "@/utils/currency";

interface RecentlyViewedMegaSectionProps {
  onNavigate: () => void;
  className?: string;
}

function cleanTitle(title: string): string {
  if (!title) return "";
  return title
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/_Damage$/i, "")
    .replace(/_Damage/gi, "")
    .trim();
}

export function RecentlyViewedMegaSection({
  onNavigate,
  className = "",
}: RecentlyViewedMegaSectionProps) {
  const [mounted, setMounted] = useState(false);
  const items = useRecentlyViewedStore((s) => s.items);
  const clear = useRecentlyViewedStore((s) => s.clearRecentlyViewed);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by waiting for client mount
  if (!mounted) {
    return (
      <div className={`flex flex-col justify-between p-6 bg-[#fcfbf9]/60 ${className}`}>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-gold/50" />
            <p className="font-display text-sm font-bold text-charcoal">Recently Viewed</p>
          </div>
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-sand/20 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasItems = items.length > 0;
  // Display up to 3 most recently viewed books in the column
  const displayItems = items.slice(0, 3);

  return (
    <div
      className={`flex flex-col justify-between p-6 bg-[#fcfbf9]/60 ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <p className="font-display text-sm font-bold text-charcoal">Recently Viewed</p>
            {hasItems && (
              <span className="rounded-full bg-gold/15 px-1.5 py-0.2 text-[9px] font-bold text-gold-dark">
                {items.length}
              </span>
            )}
          </div>

          {hasItems && (
            <button
              onClick={clear}
              type="button"
              className="text-[10px] font-medium text-charcoal/40 hover:text-gold-dark transition-colors"
              title="Clear recently viewed history"
            >
              Clear
            </button>
          )}
        </div>

        {/* Books List or Empty State */}
        {hasItems ? (
          <div className="space-y-2.5">
            {displayItems.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                onClick={onNavigate}
                className="group flex items-center gap-3 rounded-xl border border-sand/60 bg-white p-2 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-xs"
              >
                {/* Book cover image */}
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-[2px] bg-sand/30 shadow-xs">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover select-none transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gold-gradient text-[8px] font-bold text-white">
                      FTT
                    </div>
                  )}
                  {/* Book spine crease */}
                  <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
                </div>

                {/* Book details */}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-charcoal transition-colors group-hover:text-gold-dark">
                    {cleanTitle(item.name)}
                  </p>
                  {item.author && (
                    <p className="mt-0.5 truncate text-[10px] text-charcoal/45">
                      {item.author}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] font-bold text-gold-dark">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-sand/80 bg-white/70 p-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-xs font-semibold text-charcoal">No recent books</p>
            <p className="mt-1 text-[11px] leading-relaxed text-charcoal/50">
              Books you view will appear here with cover images for fast return.
            </p>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <Link
        href="/products"
        onClick={onNavigate}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-dark transition-smooth hover:gap-2.5 hover:underline"
      >
        Browse all books <span aria-hidden="true">&rarr;</span>
      </Link>
    </div>
  );
}
