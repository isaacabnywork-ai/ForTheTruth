"use client";

import Link from "next/link";
import type { WCCategory } from "@/types/product";
import { CHURCH_LINKS, COLLECTIONS, TOPICS } from "@/utils/constants";

interface MegaMenuProps {
  open: boolean;
  categories: WCCategory[];
  onNavigate: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const itemCls =
  "group flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-charcoal/70 transition-smooth hover:bg-cream hover:text-gold-dark";

/** 4-column mega menu: Topics · Browse · New & Notable · Church Resources */
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
      className={`fixed left-1/2 top-[108px] w-[min(1120px,calc(100vw-3rem))] -translate-x-1/2 transition-all duration-300 ${
        open
          ? "pointer-events-auto visible translate-y-0 opacity-100"
          : "pointer-events-none invisible -translate-y-2 opacity-0"
      }`}
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-panel">
        <div className="grid grid-cols-4">
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
          <div className="border-r border-sand p-7">
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

          {/* Church panel — navy */}
          <div className="flex flex-col justify-between bg-navy-gradient p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-light">
                For Churches
              </p>
              <p className="mt-3 font-display text-xl font-bold leading-snug text-white">
                Equip your congregation
              </p>
              <ul className="mt-4 space-y-1.5">
                {CHURCH_LINKS.slice(0, 4).map((c) => (
                  <li key={`${c.href}-${c.label}`}>
                    <Link
                      href={c.href}
                      onClick={onNavigate}
                      className="block text-sm text-white/65 transition-smooth hover:text-gold-light"
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/church-resources"
              onClick={onNavigate}
              className="btn-cta mt-6 !px-5 !py-2.5 !text-xs"
            >
              Bulk Pricing <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
