"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { useCartStore } from "@/store/cartStore";
import type { WCCategory } from "@/types/product";
import { CHURCH_LINKS, COLLECTIONS, NAV_LINKS } from "@/utils/constants";
import { triggerHaptic } from "@/utils/haptics";

/**
 * Mobile/tablet navigation: a floating "dynamic island" bottom bar
 * plus a slide-in sidebar with the full menu. Hidden on desktop (lg+).
 */
export function MobileNav({ categories }: { categories: WCCategory[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.getCount());

  useEffect(() => setMounted(true), []);
  useEffect(() => setDrawerOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  if (pathname?.startsWith("/admin")) return null;

  const isHome = pathname === "/";
  const isShop = pathname.startsWith("/products") && !pathname.startsWith("/products/search");
  const isSearch = pathname.startsWith("/products/search");
  const isCart = pathname.startsWith("/cart");

  return (
    <>
      {/* Redesigned Full-Width Bottom Nav Bar */}
      <nav
        aria-label="Mobile bottom navigation"
        className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-between bg-[#FBF9F6] border-t border-charcoal/30 px-2 pt-2 h-[68px] lg:hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
      >
        {/* 1. Home */}
        <Link
          href="/"
          onClick={() => triggerHaptic("tap")}
          aria-current={isHome ? "page" : undefined}
          className={`flex flex-col items-center justify-center w-[20%] transition-all duration-200 active:scale-95 ${
            isHome ? "text-charcoal" : "text-charcoal/40 hover:text-charcoal/70"
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isHome ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isHome ? "0" : "2"} className="mb-1">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span className="text-[9px] font-extrabold tracking-widest uppercase mt-0.5">
            Home
          </span>
        </Link>

        {/* 2. Shop */}
        <Link
          href="/products"
          onClick={() => triggerHaptic("tap")}
          aria-current={isShop ? "page" : undefined}
          className={`flex flex-col items-center justify-center w-[20%] transition-all duration-200 active:scale-95 ${
            isShop ? "text-charcoal" : "text-charcoal/40 hover:text-charcoal/70"
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isShop ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isShop ? "0" : "2"} className="mb-1">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          <span className="text-[9px] font-extrabold tracking-widest uppercase mt-0.5">
            Shop
          </span>
        </Link>

        {/* 3. Center Highlighted Search Action Button */}
        <Link
          href="/products/search"
          onClick={() => triggerHaptic("tap")}
          aria-current={isSearch ? "page" : undefined}
          className="group relative flex flex-col items-center justify-start w-[20%] h-full transition-all duration-200 active:scale-95"
        >
          {/* Outer ring masking the top border */}
          <div className="absolute -top-[30px] flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#FBF9F6] border border-charcoal/30">
            {/* Inner dark button */}
            <div className={`flex h-[52px] w-[52px] items-center justify-center rounded-full text-white shadow-md transition-colors ${
              isSearch ? "bg-gold-dark" : "bg-charcoal"
            }`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <span className={`absolute bottom-0 text-[9px] font-extrabold tracking-widest uppercase ${
            isSearch ? "text-charcoal" : "text-charcoal/80"
          }`}>
            Search
          </span>
        </Link>

        {/* 4. Cart */}
        <Link
          href="/cart"
          onClick={() => triggerHaptic("tap")}
          aria-current={isCart ? "page" : undefined}
          className={`relative flex flex-col items-center justify-center w-[20%] transition-all duration-200 active:scale-95 ${
            isCart ? "text-charcoal" : "text-charcoal/40 hover:text-charcoal/70"
          }`}
        >
          <div className="relative mb-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={isCart ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isCart ? "0" : "2"}>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-cta px-1 text-[9px] font-bold text-white shadow-sm">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-extrabold tracking-widest uppercase mt-0.5">
            Cart
          </span>
        </Link>

        {/* 5. Menu Button */}
        <button
          onClick={() => {
            triggerHaptic("tap");
            setDrawerOpen(true);
          }}
          aria-expanded={drawerOpen}
          className={`flex flex-col items-center justify-center w-[20%] transition-all duration-200 active:scale-95 ${
            drawerOpen ? "text-charcoal" : "text-charcoal/40 hover:text-charcoal/70"
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-1">
            <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[9px] font-extrabold tracking-widest uppercase mt-0.5">
            Menu
          </span>
        </button>
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
