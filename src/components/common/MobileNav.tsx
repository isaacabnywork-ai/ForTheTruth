"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import type { WCCategory } from "@/types/product";
import { CHURCH_LINKS, COLLECTIONS, NAV_LINKS } from "@/utils/constants";

/**
 * Mobile/tablet navigation: a floating "dynamic island" bottom bar
 * plus a slide-in sidebar with the full menu. Hidden on desktop (lg+).
 */
export function MobileNav({ categories }: { categories: WCCategory[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.getCount());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  useEffect(() => setMounted(true), []);
  useEffect(() => setDrawerOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  if (pathname?.startsWith("/admin")) return null;

  const leftItems = [
    {
      label: "Home",
      href: "/",
      icon: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    },
    {
      label: "Shop",
      href: "/products",
      icon: (
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      ),
    },
  ];

  const rightItems = [
    {
      label: "Wishlist",
      href: "/account/wishlist",
      badge: mounted ? wishlistCount : 0,
      icon: (
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      ),
    },
    {
      label: "Cart",
      href: "/cart",
      badge: mounted ? cartCount : 0,
      icon: (
        <>
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </>
      ),
    },
  ];

  return (
    <>
      {/* Sleek Slim Dynamic Island Bottom Nav Bar */}
      <nav
        aria-label="Mobile bottom navigation"
        className="fixed bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-0.5 sm:gap-1.5 rounded-full border border-sand/80 bg-white/95 px-2.5 py-1 shadow-[0_8px_30px_rgb(0,0,0,0.14)] backdrop-blur-md transition-all duration-300 max-w-[92vw] lg:hidden"
      >
        {leftItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-w-[50px] flex-col items-center justify-center py-0.5 transition-all duration-200 ${
                isActive ? "text-gold-dark font-bold" : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <span
                className={`relative flex h-6 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                  isActive ? "bg-gold/15" : ""
                }`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={isActive ? 2.2 : 1.7}
                  aria-hidden="true"
                >
                  {item.icon}
                </svg>
              </span>
              <span className="mt-0.5 text-[9px] font-bold tracking-tight uppercase">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Center Highlighted Menu Action Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          className="group relative mx-1 flex flex-col items-center justify-center py-0 transition-all duration-200 active:scale-95"
        >
          <span className="flex h-9 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-gold-dark via-gold to-[#DABB6B] text-white shadow-md shadow-gold/35 transition-transform duration-200 group-hover:scale-105">
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              aria-hidden="true"
            >
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="mt-0.5 text-[9px] font-extrabold tracking-tight uppercase text-gold-dark">
            Menu
          </span>
        </button>

        {rightItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-w-[50px] flex-col items-center justify-center py-0.5 transition-all duration-200 ${
                isActive ? "text-gold-dark font-bold" : "text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <span
                className={`relative flex h-6 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                  isActive ? "bg-gold/15" : ""
                }`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={isActive ? 2.2 : 1.7}
                  aria-hidden="true"
                >
                  {item.icon}
                </svg>
                {item.badge > 0 && (
                  <span className="absolute -top-1 right-0 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-cta px-1 text-[8px] font-bold text-white shadow-sm ring-1 ring-white">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="mt-0.5 text-[9px] font-bold tracking-tight uppercase">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ===== Sidebar drawer ===== */}
      <div
        className={`fixed inset-0 z-[60] bg-charcoal/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[300px] flex-col bg-white text-charcoal shadow-panel transition-transform duration-500 ease-out lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu"
        aria-hidden={!drawerOpen}
      >
        <div className="flex items-center justify-between border-b border-sand px-6 py-5">
          <Link href="/" onClick={() => setDrawerOpen(false)} className="relative h-9 w-9 shrink-0">
            <Image src="/logo.png" alt="For The Truth" fill className="object-contain" priority />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="rounded-full p-2 text-charcoal/50 transition-smooth hover:bg-cream hover:text-gold-dark"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-6">
            <SearchBar />
          </div>

          <nav aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block border-b border-sand/60 py-3 text-sm font-semibold tracking-wide text-charcoal/85 transition-smooth hover:pl-1 hover:text-gold-dark"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {categories.length > 0 && (
            <div className="mt-8">
              <p className="overline-label mb-3">Categories</p>
              {categories.slice(0, 10).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="flex items-center justify-between py-2.5 text-sm text-charcoal/60 transition-smooth hover:pl-1 hover:text-gold-dark"
                >
                  {cat.name}
                  {cat.count != null && (
                    <span className="text-xs text-charcoal/25">{cat.count}</span>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8">
            <p className="overline-label mb-3">Collections</p>
            {COLLECTIONS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="block py-2.5 text-sm text-charcoal/60 transition-smooth hover:pl-1 hover:text-gold-dark"
              >
                {c.label}
              </Link>
            ))}
          </div>

          {/* Church pathway */}
          <div className="mt-8 rounded-2xl bg-navy-gradient p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold-light">
              For Churches
            </p>
            {CHURCH_LINKS.slice(0, 3).map((c) => (
              <Link
                key={`${c.href}-${c.label}`}
                href={c.href}
                className="mt-2 block text-sm text-white/70 transition-smooth hover:text-gold-light"
              >
                {c.label}
              </Link>
            ))}
            <Link
              href="/church-resources#quote"
              className="btn-cta mt-4 w-full !py-2.5 !text-[11px]"
            >
              Request a Quote
            </Link>
          </div>
        </div>

        <div className="border-t border-sand px-6 py-5">
          <Link
            href="/account/dashboard"
            className="flex items-center gap-3 text-sm font-semibold text-charcoal/80 transition-smooth hover:text-gold-dark"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            My Account
          </Link>
        </div>
      </aside>
    </>
  );
}
