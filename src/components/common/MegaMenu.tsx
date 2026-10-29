"use client";

import Link from "next/link";
import type { WCCategory } from "@/types/product";
import { COLLECTIONS } from "@/utils/constants";
import { RecentlyViewedMegaSection } from "./RecentlyViewedMegaSection";

interface MegaMenuProps {
  open: boolean;
  categories: WCCategory[];
  onNavigate: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const itemCls =
  "group flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-charcoal/75 transition-smooth hover:bg-cream hover:text-gold-dark hover:pl-4";
const sectionHeaderCls =
  "font-display text-sm font-bold tracking-normal text-charcoal border-b border-sand pb-1 mb-3";
const subHeaderCls =
  "text-[11px] font-semibold tracking-normal text-gold-dark mt-3 mb-1 px-3";

export function MegaMenu({ open, onNavigate, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  return (
    <div
      className={`fixed left-1/2 top-[88px] z-[100] w-[min(900px,calc(100vw-3rem))] -translate-x-1/2 transition-all duration-300 before:absolute before:-top-5 before:inset-x-0 before:h-5 before:content-[''] ${
        open
          ? "pointer-events-auto visible translate-y-0 opacity-100"
          : "pointer-events-none invisible -translate-y-2 opacity-0"
      }`}
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-2xl p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Column 1: All Books Main Navigation & Publishers */}
          <div className="border-r border-sand pr-6">
            <p className={sectionHeaderCls}>All Books</p>
            <ul className="space-y-0.5">
              <li>
                <Link href="/products" onClick={onNavigate} className={itemCls}>
                  <span className="font-semibold">View All</span>
                  <span aria-hidden="true" className="text-xs text-charcoal/40">↗</span>
                </Link>
              </li>
              <li>
                <Link href="/categories" onClick={onNavigate} className={itemCls}>
                  <span className="font-semibold">All Categories</span>
                  <span aria-hidden="true" className="text-xs text-charcoal/40">→</span>
                </Link>
              </li>
            </ul>

            <p className={subHeaderCls}>Publishers</p>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/products?publisher=248"
                  onClick={onNavigate}
                  className={itemCls}
                >
                  For The Truth
                </Link>
              </li>
              <li>
                <Link
                  href="/products?publisher=1108"
                  onClick={onNavigate}
                  className={itemCls}
                >
                  Shepherd Press
                </Link>
              </li>
              <li>
                <Link
                  href="/products?publisher=1887"
                  onClick={onNavigate}
                  className={itemCls}
                >
                  10 Publishing
                </Link>
              </li>
              <li>
                <Link
                  href="/products?publisher=163"
                  onClick={onNavigate}
                  className={itemCls}
                >
                  The Good Book Company
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Collections */}
          <div className="border-r border-sand pr-6">
            <p className={sectionHeaderCls}>Collections</p>
            <ul className="space-y-0.5">
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

          {/* Column 3: Recently Viewed */}
          <RecentlyViewedMegaSection onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
