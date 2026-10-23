"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { formatPrice } from "@/utils/currency";

interface RecentlyViewedMegaSectionProps {
  onNavigate: () => void;
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

export function RecentlyViewedMegaSection({ onNavigate }: RecentlyViewedMegaSectionProps) {
  const [mounted, setMounted] = useState(false);
  const items = useRecentlyViewedStore((s) => s.items);
  const clear = useRecentlyViewedStore((s) => s.clearRecentlyViewed);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by waiting for client mount
  if (!mounted) {
    return (
      <div className="border-t border-sand/70 bg-[#faf7f0]/70 px-6 py-3 min-h-[56px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gold/50" />
          <span className="overline-label !text-[10px] !tracking-wider text-charcoal/50">
            Recently Viewed
          </span>
        </div>
      </div>
    );
  }

  const hasItems = items.length > 0;
  // Display up to 4 most recently viewed books
  const displayItems = items.slice(0, 4);

  return (
    <div className="border-t border-sand/70 bg-gradient-to-r from-[#fcfbf8] via-[#faf6ee] to-[#fcfbf8] px-6 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5 text-gold-dark"
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
          <span className="overline-label !text-[10px] !tracking-widest text-charcoal/70">
            Recently Viewed
          </span>
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
            className="text-[11px] font-medium text-charcoal/40 hover:text-gold-dark transition-colors"
          >
            Clear history
          </button>
        )}
      </div>

      {hasItems ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {displayItems.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.slug}`}
              onClick={onNavigate}
              className="group flex items-center gap-2.5 rounded-lg border border-sand/60 bg-white/80 p-1.5 shadow-2xs transition-all duration-200 hover:border-gold/40 hover:bg-white hover:shadow-xs min-w-0"
            >
              {/* Thumbnail */}
              <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-r-[3px] rounded-l-[1px] bg-sand/30 shadow-xs">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover select-none"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gold-gradient text-[8px] text-white font-bold">
                    FTT
                  </div>
                )}
                {/* Book spine crease */}
                <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
              </div>

              {/* Text metadata */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold leading-tight text-charcoal group-hover:text-gold-dark transition-colors">
                  {cleanTitle(item.name)}
                </p>
                {item.author && (
                  <p className="truncate text-[10px] text-charcoal/45 mt-0.5">
                    {item.author}
                  </p>
                )}
                <p className="text-[11px] font-bold text-gold-dark mt-0.5">
                  {formatPrice(item.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-between py-1 text-xs text-charcoal/55">
          <p className="italic text-[11px]">
            No recently viewed books yet. Books you view while browsing will appear here.
          </p>
          <Link
            href="/products"
            onClick={onNavigate}
            className="text-[11px] font-bold text-gold-dark hover:underline inline-flex items-center gap-1 shrink-0 ml-3"
          >
            Browse all books <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      )}
    </div>
  );
}
