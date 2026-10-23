"use client";

import Link from "next/link";
import type { WCCategory } from "@/types/product";
import { COLLECTIONS, TOPICS } from "@/utils/constants";
import { RecentlyViewedMegaSection } from "./RecentlyViewedMegaSection";

interface MegaMenuProps {
  open: boolean;
  categories: WCCategory[];
  onNavigate: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const itemCls =
  "group flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-charcoal/70 transition-smooth hover:bg-cream hover:text-gold-dark";

/** 3-column mega menu: Topics · Browse · New & Notable */
export function MegaMenu({ open, categories, onNavigate, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  // Use real WooCommerce categories when available, else the fallback topic list
  const topics =
    categories.length > 0
      ? categories.slice(0, 10).map((c) => ({
          label: c.name,
          href: `/categories/${c.slug}`,
          count: c.count,
        }))
      : TOPICS.map((t) => ({
          label: t.label,
          href: `/categories/${t.slug}`,
          count: undefined,
        }));

  return (
    <div
      className={`fixed left-1/2 top-[96px] z-[100] w-[min(920px,calc(100vw-3rem))] -translate-x-1/2 transition-all duration-300 before:absolute before:-top-5 before:inset-x-0 before:h-5 before:content-[''] ${
        open
          ? "pointer-events-auto visible translate-y-0 opacity-100"
          : "pointer-events-none invisible -translate-y-2 opacity-0"
      }`}
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-panel">
        <div className="grid grid-cols-3">
          {/* Topics */}
          <div className="border-r border-sand p-7">
            <p className="overline-label mb-4">By Topic</p>
            <ul className="space-y-0.5">
              {topics.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} onClick={onNavigate} className={itemCls}>
                    {t.label}
                    {t.count != null && (
                      <span className="text-xs text-charcoal/25 group-hover:text-gold">
                        {t.count}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/categories"
              onClick={onNavigate}
              className="mt-3 inline-flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-widest text-gold-dark transition-smooth hover:gap-2.5"
            >
              All topics <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Browse */}
          <div className="border-r border-sand p-7">
            <p className="overline-label mb-4">Browse</p>
            <ul className="space-y-0.5">
              <li>
                <Link href="/products" onClick={onNavigate} className={itemCls}>
                  All Books
                </Link>
              </li>
              {COLLECTIONS.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} onClick={onNavigate} className={itemCls}>
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/products?price=0-299"
                  onClick={onNavigate}
                  className={itemCls}
                >
                  Under ₹299
                </Link>
              </li>
            </ul>
          </div>

          {/* New & Notable */}
          <div className="p-7">
            <p className="overline-label mb-4">New &amp; Notable</p>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/products?orderby=date"
                  onClick={onNavigate}
                  className={itemCls}
                >
                  New Releases
                </Link>
              </li>
              <li>
                <Link
                  href="/products?availability=preorder"
                  onClick={onNavigate}
                  className={itemCls}
                >
                  Coming Soon
                </Link>
              </li>
              <li>
                <Link
                  href="/products?orderby=rating"
                  onClick={onNavigate}
                  className={itemCls}
                >
                  Staff Picks
                </Link>
              </li>
              <li>
                <Link
                  href="/products?orderby=popularity"
                  onClick={onNavigate}
                  className={itemCls}
                >
                  Most Reviewed
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Recently Viewed Books Section */}
        <RecentlyViewedMegaSection onNavigate={onNavigate} />
      </div>
    </div>
  );
}
