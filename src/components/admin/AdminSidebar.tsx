"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  {
    label: "POS Terminal",
    href: "/admin/pos",
    badge: "LIVE",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 7h10" />
        <path d="M7 11h3" />
        <path d="M14 11h3" />
        <path d="M7 15h3" />
        <path d="M14 15h3" />
      </svg>
    ),
  },
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    label: "All Orders",
    href: "/admin/orders",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M15 18a3 3 0 1 0-6 0" />
        <path d="M18 18h-1a6 6 0 0 0-10 0H6V4a2 2 0 0 1 2-2h7l5 5v11Z" />
      </svg>
    ),
  },
  {
    label: "Book Stock & Catalog",
    href: "/admin/products",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        <path d="M6.5 2v20" />
      </svg>
    ),
  },
  {
    label: "Church Quotes",
    href: "/admin/quotes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    label: "Shelf Curator & IDs",
    href: "/admin/curator",
    badge: "NEW",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export function AdminSidebar({ onLock }: { onLock: () => void }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="flex items-center justify-between border-b border-navy-light/20 bg-navy px-4 py-3 text-white lg:hidden">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-white">
            ABNY <span className="text-gold-light">POS &amp; Admin</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen((p) => !p)}
          className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
          aria-label="Toggle admin menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Sidebar Rail */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col bg-navy text-white transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-6">
          <Link href="/admin/pos" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-gold-dark to-gold-light font-display text-lg font-black text-navy shadow-lg">
              A
            </div>
            <div>
              <p className="font-display text-base font-bold tracking-tight text-white">
                ABNY <span className="text-gold-light">Admin</span>
              </p>
              <p className="text-[10px] uppercase tracking-widest text-white/50">
                Retail Command Hub
              </p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-white/50 hover:text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
          <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-light/70">
            Operations
          </div>
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-gold/25 to-gold/10 text-gold-light shadow-[inset_4px_0_0_0_#C89B3C]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? "text-gold-light" : "text-white/50"}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-cta px-2 py-0.5 text-[10px] font-bold tracking-wider text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="my-6 border-t border-white/10" />

          <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Store &amp; Security
          </div>
          <ul className="space-y-1.5">
            <li>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                  <path d="M15 3h6v6" />
                  <path d="M10 14 21 3" />
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                </svg>
                <span>View Live Storefront</span>
              </Link>
            </li>
            <li>
              <button
                onClick={onLock}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-rose-300/80 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Lock POS Station</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Footer Station Info */}
        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center justify-between text-xs font-medium text-white/80">
              <span>Terminal Status</span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Online &amp; Synced
              </span>
            </div>
            <p className="mt-1 text-[11px] text-white/45">
              WooCommerce Backend Active
            </p>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
