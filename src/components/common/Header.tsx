"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SearchBar } from "./SearchBar";
import { MegaMenu } from "./MegaMenu";
import { ChurchMegaMenu } from "./ChurchMegaMenu";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import type { WCCategory } from "@/types/product";
import { ANNOUNCEMENT, NAV_LINKS, SITE_NAME } from "@/utils/constants";

export function Header({ categories }: { categories: WCCategory[] }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<"books" | "church" | null>(null);
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.getCount());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const { user } = useAuthStore();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useAuth();

  useEffect(() => setMounted(true), []);

  const userName = mounted && user
    ? (user.firstName || user.displayName || (user.email ? user.email.split("@")[0] : "Account"))
    : "Account";

  const openMenuSafe = useCallback((menu: "books" | "church") => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenMenu(menu);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpenMenu(null);
      closeTimer.current = null;
    }, 200);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const badgeCls =
    "absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold-gradient px-1 text-[10px] font-bold text-white shadow-gold";

  const isSingleBookPage =
    pathname?.startsWith("/products/") && !pathname?.startsWith("/products/search");

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-gold-gradient py-1.5 px-2 text-center text-[11px] sm:text-xs font-bold tracking-wide text-white truncate [text-shadow:0_1px_2px_rgba(120,85,40,0.35)]">
        {ANNOUNCEMENT}
      </div>

      <div className={`border-b border-sand bg-white/95 shadow-[0_8px_30px_-12px_rgba(120,95,55,0.15)] backdrop-blur-md supports-[backdrop-filter]:bg-white/85 w-full max-w-full ${isSingleBookPage ? "hidden lg:block" : ""}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 sm:px-6 py-3.5 lg:px-8">
          <Link href="/" className="flex items-center shrink-0 group" aria-label={SITE_NAME}>
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="For The Truth Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>

          <nav className="hidden flex-1 items-center gap-7 lg:flex lg:ml-10 xl:ml-16">
            {NAV_LINKS.map((link) => {
              const menu = "menu" in link ? link.menu : null;
              if (!menu) {
                return (
                  <Link key={link.href} href={link.href} className="nav-link py-2 text-sm font-semibold">
                    {link.label}
                  </Link>
                );
              }
              const isOpen = openMenu === menu;
              return (
                <div
                  key={link.href}
                  onMouseEnter={() => openMenuSafe(menu)}
                  onMouseLeave={scheduleClose}
                >
                  <Link
                    href={link.href}
                    className={`nav-link inline-flex items-center gap-1.5 py-2 text-sm font-semibold ${
                      menu === "church" ? "text-navy hover:text-cta" : ""
                    }`}
                    aria-expanded={isOpen}
                  >
                    {link.label}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </Link>
                  {menu === "books" ? (
                    <MegaMenu
                      open={isOpen}
                      categories={categories}
                      onNavigate={() => setOpenMenu(null)}
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                    />
                  ) : (
                    <ChurchMegaMenu
                      open={isOpen}
                      onNavigate={() => setOpenMenu(null)}
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          <div className="hidden flex-1 max-w-xs md:block lg:w-80 lg:flex-none">
            <SearchBar />
          </div>

          {/* Persistent Action Icons across Mobile, Tablet, and Desktop */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/account/wishlist"
              className="relative rounded-full p-2 text-charcoal/70 transition-smooth hover:bg-cream hover:text-gold-dark sm:p-2.5"
              aria-label={`Wishlist${mounted ? `, ${wishlistCount} items` : ""}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {mounted && wishlistCount > 0 && (
                <span className={badgeCls}>{wishlistCount}</span>
              )}
            </Link>

            <Link
              href="/account/dashboard"
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-charcoal/80 transition-smooth hover:bg-cream hover:text-gold-dark sm:px-3 sm:py-2"
              aria-label="Account"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="shrink-0" aria-hidden="true">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-xs sm:text-sm font-bold tracking-tight truncate max-w-[90px] sm:max-w-[140px]">
                {userName}
              </span>
            </Link>

            <Link
              href="/cart"
              className="relative hidden lg:flex rounded-full p-2 text-charcoal/70 transition-smooth hover:bg-cream hover:text-gold-dark sm:p-2.5"
              aria-label={`Cart${mounted ? `, ${cartCount} items` : ""}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {mounted && cartCount > 0 && <span className={badgeCls}>{cartCount}</span>}
            </Link>
          </div>
        </div>

        {/* Mobile search under the logo row for phones and small tablets */}
        <div className="border-t border-sand/60 px-4 py-2.5 md:hidden">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
