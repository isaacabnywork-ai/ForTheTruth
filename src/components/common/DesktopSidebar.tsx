"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import type { WCCategory } from "@/types/product";
import { COLLECTIONS, CHURCH_LINKS } from "@/utils/constants";

/* ── SVG icon paths ────────────────────────────────────────── */
const ICONS = {
  home: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  books: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20",
  categories:
    "M10 3H3v7h7V3zM21 3h-7v7h7V3zM21 14h-7v7h7v-7zM10 14H3v7h7v-7z",
  church: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6",
  heart:
    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  cart: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6",
  user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",
  about: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01",
  contact: "M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.34a2 2 0 0 1-.45 2.11L8.09 9.41a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.74.32 1.53.55 2.34.68a2 2 0 0 1 1.72 2v.55z",
  chevron: "m9 18 6-6-6-6",
  collapse: "M11 19l-7-7 7-7M18 19l-7-7 7-7",
  expand: "M13 5l7 7-7 7M6 5l7 7-7 7",
} as const;

function Icon({
  d,
  size = 18,
  strokeWidth = 1.7,
}: {
  d: string;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

/* ── Primary nav items ─────────────────────────────────────── */
const PRIMARY_NAV = [
  { label: "Home", href: "/", icon: ICONS.home },
  { label: "All Books", href: "/products", icon: ICONS.books },
  { label: "Categories", href: "/categories", icon: ICONS.categories },
  { label: "Church Resources", href: "/church-resources", icon: ICONS.church },
  { label: "About", href: "/about", icon: ICONS.about },
  { label: "Contact", href: "/contact", icon: ICONS.contact },
] as const;

/* ── Component ─────────────────────────────────────────────── */
export function DesktopSidebar({
  categories,
}: {
  categories: WCCategory[];
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [catOpen, setCatOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.getCount());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  useEffect(() => setMounted(true), []);

  if (pathname?.startsWith("/admin")) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const topics =
    categories.length > 0
      ? categories.slice(0, 10).map((c) => ({
          label: c.name,
          href: `/categories/${c.slug}`,
          count: c.count,
        }))
      : [];

  return (
    <aside
      className={`sticky top-0 z-40 self-start hidden h-screen shrink-0 flex-col border-r border-sand bg-white transition-all duration-300 ease-out lg:flex ${
        collapsed ? "w-[68px]" : "w-[260px]"
      }`}
      aria-label="Desktop sidebar"
    >
      {/* ── Brand + collapse toggle ─────────────────────────── */}
      <div className="flex items-center justify-between border-b border-sand px-4 py-4">
        {!collapsed && (
          <Link href="/" className="shrink-0 flex items-center">
            <div className="relative h-9 w-9 shrink-0">
              <Image src="/logo.png" alt="For The Truth" fill className="object-contain" priority />
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((p) => !p)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`rounded-lg p-2 text-charcoal/40 transition-smooth hover:bg-cream hover:text-gold-dark ${
            collapsed ? "mx-auto" : ""
          }`}
        >
          <Icon d={collapsed ? ICONS.expand : ICONS.collapse} size={16} />
        </button>
      </div>

      {/* ── Scrollable nav area ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-hide">
        {/* Primary nav */}
        <nav aria-label="Main">
          <ul className="space-y-0.5">
            {PRIMARY_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-smooth ${
                      active
                        ? "bg-gold/10 text-gold-dark"
                        : "text-charcoal/65 hover:bg-cream hover:text-charcoal"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span
                      className={`shrink-0 ${
                        active ? "text-gold-dark" : "text-charcoal/40 group-hover:text-gold-dark"
                      }`}
                    >
                      <Icon d={item.icon} />
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Divider */}
        <div className="my-4 border-t border-sand/60" />

        {/* Quick actions — wishlist & cart */}
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/account/wishlist"
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-smooth ${
                isActive("/account/wishlist")
                  ? "bg-gold/10 text-gold-dark"
                  : "text-charcoal/65 hover:bg-cream hover:text-charcoal"
              }`}
              title={collapsed ? `Wishlist (${mounted ? wishlistCount : 0})` : undefined}
            >
              <span className="relative shrink-0 text-charcoal/40 group-hover:text-gold-dark">
                <Icon d={ICONS.heart} />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-cta px-0.5 text-[8px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </span>
              {!collapsed && <span className="truncate">Wishlist</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/cart"
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-smooth ${
                isActive("/cart")
                  ? "bg-gold/10 text-gold-dark"
                  : "text-charcoal/65 hover:bg-cream hover:text-charcoal"
              }`}
              title={collapsed ? `Cart (${mounted ? cartCount : 0})` : undefined}
            >
              <span className="relative shrink-0 text-charcoal/40 group-hover:text-gold-dark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d={ICONS.cart} />
                </svg>
                {mounted && cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-cta px-0.5 text-[8px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </span>
              {!collapsed && <span className="truncate">Cart</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/account/dashboard"
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-smooth ${
                isActive("/account/dashboard")
                  ? "bg-gold/10 text-gold-dark"
                  : "text-charcoal/65 hover:bg-cream hover:text-charcoal"
              }`}
              title={collapsed ? "My Account" : undefined}
            >
              <span className="shrink-0 text-charcoal/40 group-hover:text-gold-dark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={ICONS.user} />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              {!collapsed && <span className="truncate">My Account</span>}
            </Link>
          </li>
        </ul>

        {/* Categories accordion — only shown when expanded */}
        {!collapsed && topics.length > 0 && (
          <>
            <div className="my-4 border-t border-sand/60" />
            <button
              onClick={() => setCatOpen((p) => !p)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-charcoal/40 transition-smooth hover:text-charcoal/70"
            >
              Categories
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`transition-transform duration-300 ${
                  catOpen ? "rotate-90" : ""
                }`}
                aria-hidden="true"
              >
                <path d={ICONS.chevron} />
              </svg>
            </button>
            {catOpen && (
              <ul className="mt-1 space-y-0.5">
                {topics.map((t) => (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-[13px] transition-smooth ${
                        isActive(t.href)
                          ? "bg-gold/10 font-semibold text-gold-dark"
                          : "text-charcoal/55 hover:bg-cream hover:text-charcoal"
                      }`}
                    >
                      <span className="truncate">{t.label}</span>
                      {t.count != null && (
                        <span className="ml-2 text-[11px] text-charcoal/25">
                          {t.count}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/categories"
                    className="mt-1 inline-flex items-center gap-1 px-3 text-[11px] font-bold uppercase tracking-widest text-gold-dark transition-smooth hover:gap-2"
                  >
                    View all <span aria-hidden="true">→</span>
                  </Link>
                </li>
              </ul>
            )}
          </>
        )}

        {/* Collections accordion — only shown when expanded */}
        {!collapsed && (
          <>
            <div className="my-4 border-t border-sand/60" />
            <button
              onClick={() => setCollectionsOpen((p) => !p)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-charcoal/40 transition-smooth hover:text-charcoal/70"
            >
              Collections
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`transition-transform duration-300 ${
                  collectionsOpen ? "rotate-90" : ""
                }`}
                aria-hidden="true"
              >
                <path d={ICONS.chevron} />
              </svg>
            </button>
            {collectionsOpen && (
              <ul className="mt-1 space-y-0.5">
                {COLLECTIONS.map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      className="block rounded-lg px-3 py-1.5 text-[13px] text-charcoal/55 transition-smooth hover:bg-cream hover:text-charcoal"
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* Church card — only shown when expanded */}
        {!collapsed && (
          <>
            <div className="my-4 border-t border-sand/60" />
            <div className="rounded-2xl bg-navy-gradient p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold-light">
                For Churches
              </p>
              <p className="mt-2 font-display text-sm font-bold leading-snug text-white">
                Bulk orders up to 30% off
              </p>
              <ul className="mt-3 space-y-1">
                {CHURCH_LINKS.slice(0, 3).map((c) => (
                  <li key={`${c.href}-${c.label}`}>
                    <Link
                      href={c.href}
                      className="block text-[12px] text-white/60 transition-smooth hover:text-gold-light"
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/church-resources#quote"
                className="mt-3 block rounded-full bg-cta px-4 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-white transition-smooth hover:-translate-y-0.5 hover:bg-cta-light"
              >
                Request a Quote
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ── Footer help link ── */}
      <div className="flex items-center justify-between border-t border-sand px-3 py-3">
        <Link
          href="/faq"
          className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-charcoal/50 transition-smooth hover:bg-cream hover:text-charcoal ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Help & FAQ" : undefined}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          {!collapsed && <span>Help &amp; FAQ</span>}
        </Link>
      </div>
    </aside>
  );
}
