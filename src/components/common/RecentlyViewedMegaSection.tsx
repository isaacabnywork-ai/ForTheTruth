"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRecentlyViewedStore, type RecentlyViewedItem } from "@/store/recentlyViewedStore";
import { formatPrice } from "@/utils/currency";

interface RecentlyViewedMegaSectionProps {
  onNavigate: () => void;
  className?: string;
  columns?: 1 | 2;
  maxPerBlock?: number;
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

function RecentlyViewedCard({
  item,
  onNavigate,
}: {
  item: RecentlyViewedItem;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={`/products/${item.slug}`}
      onClick={onNavigate}
      className="group flex items-center gap-2.5 rounded-xl border border-sand/60 bg-white p-2 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-xs"
    >
      {/* Book cover image */}
      <div className="relative h-13 w-9.5 shrink-0 overflow-hidden rounded-[2px] bg-sand/30 shadow-xs">
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
        <p
          className="line-clamp-2 text-xs font-semibold leading-snug text-charcoal transition-colors group-hover:text-gold-dark"
          title={cleanTitle(item.name)}
        >
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
  );
}

export function RecentlyViewedMegaSection({
  onNavigate,
  className = "",
  columns = 1,
  maxPerBlock = 4,
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
      <div className={`flex flex-col justify-between h-full ${className}`}>
        <div>
          <div className="flex items-center justify-between border-b border-sand pb-1 mb-3">
            <p className="font-display text-sm font-bold tracking-normal text-charcoal">Recently Viewed</p>
          </div>
          {columns === 2 ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-sand/20 animate-pulse" />
                ))}
              </div>
              <div className="space-y-2">
                {[5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-sand/20 animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-sand/20 animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const hasItems = items.length > 0;
  const maxBooks = columns === 2 ? maxPerBlock * 2 : maxPerBlock;
  const displayItems = items.slice(0, maxBooks);

  // Evenly split items between Block 1 and Block 2 when 2 columns requested
  const total = displayItems.length;
  const countInBlock1 = total > 4 ? Math.ceil(total / 2) : total >= 3 ? Math.ceil(total / 2) : total;
  const block1 = total <= 2 && columns === 2 ? displayItems : displayItems.slice(0, countInBlock1);
  const block2 = total <= 2 && columns === 2 ? [] : displayItems.slice(countInBlock1);

  return (
    <div className={`flex flex-col justify-between h-full ${className}`}>
      <div>
        {/* Header — aligned flush with other mega menu column headers */}
        <div className="flex items-center justify-between border-b border-sand pb-1 mb-3">
          <div className="flex items-center gap-1.5">
            <p className="font-display text-sm font-bold tracking-normal text-charcoal">Recently Viewed</p>
            {hasItems && (
              <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold text-gold-dark leading-none">
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
          columns === 2 ? (
            <div className="grid grid-cols-2 gap-3">
              {/* Block 1: 3 to 4 books */}
              <div className="space-y-2">
                {block1.map((item) => (
                  <RecentlyViewedCard key={item.id} item={item} onNavigate={onNavigate} />
                ))}
              </div>

              {/* Block 2: 3 to 4 books */}
              <div className="space-y-2">
                {block2.length > 0 ? (
                  block2.map((item) => (
                    <RecentlyViewedCard key={item.id} item={item} onNavigate={onNavigate} />
                  ))
                ) : (
                  <div className="flex h-full min-h-[110px] flex-col items-center justify-center rounded-xl border border-dashed border-sand/70 bg-cream/30 p-3 text-center">
                    <p className="text-[11px] font-semibold text-charcoal/70">Keep browsing</p>
                    <p className="mt-0.5 text-[10px] text-charcoal/45">More books you open will appear right here</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayItems.map((item) => (
                <RecentlyViewedCard key={item.id} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          )
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
