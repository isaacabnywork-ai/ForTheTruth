"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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
    label: "AIPC POS",
    href: "/admin/pos/aipc",
    badge: "EVENT",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
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
    label: "Analytics & Reports",
    href: "/admin/analytics",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

const NavLink = ({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[0];
  active: boolean;
  onClick: () => void;
}) => (
  <Link
    href={item.href}
    onClick={onClick}
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

export function AdminSidebar({ onLock }: { onLock: () => void }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close dropdown on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const close = () => setMobileOpen(false);

  return (
    <>
      {/* ── Mobile / Tablet Top Bar (hidden on xl+) ─────────────────────── */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-navy px-4 py-3 text-white xl:hidden">
        <Link href="/admin/pos" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-gold-dark to-gold-light font-display text-base font-black text-navy shadow">
            A
          </div>
          <div>
            <p className="font-display text-sm font-bold tracking-tight text-white">
              ABNY <span className="text-gold-light">Admin</span>
            </p>
            <p className="text-[9px] uppercase tracking-widest text-white/50">
              Retail Command Hub
            </p>
          </div>
        </Link>

        <button
          onClick={() => setMobileOpen((p) => !p)}
          className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20"
          aria-label="Toggle admin menu"
          aria-expanded={mobileOpen}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {mobileOpen
              ? <path d="M18 6 6 18M6 6l12 12" />
              : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
          <span>{mobileOpen ? "Close" : "Menu"}</span>
        </button>
      </div>

      {/* ── Mobile / Tablet Dropdown Panel ──────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm xl:hidden"
            onClick={close}
            aria-hidden="true"
          />

          {/* Dropdown panel — slides down from top bar */}
          <div className="fixed left-0 right-0 top-[57px] z-50 max-h-[calc(100dvh-57px)] overflow-y-auto bg-navy shadow-2xl xl:hidden">
            <div className="px-4 py-4">
              {/* Operations */}
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-light/70">
                Operations
              </p>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const active =
                    item.href === "/admin/pos"
                      ? pathname === "/admin/pos"
                      : pathname.startsWith(item.href);
                  return (
                    <NavLink key={item.href} item={item} active={active} onClick={close} />
                  );
                })}
              </nav>

              <div className="my-4 border-t border-white/10" />

              {/* Store & Security */}
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Store &amp; Security
              </p>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/admin/staff"
                    onClick={close}
                    className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                      pathname.startsWith("/admin/staff")
                        ? "bg-gradient-to-r from-gold/25 to-gold/10 text-gold-light shadow-[inset_4px_0_0_0_#C89B3C]"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/40 group-hover:text-white/70">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                    Staff &amp; Access
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    target="_blank"
                    onClick={close}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                      <path d="M15 3h6v6" />
                      <path d="M10 14 21 3" />
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    </svg>
                    View Live Storefront
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => { close(); onLock(); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-rose-300/80 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Lock POS Station
                  </button>
                </li>
              </ul>

              {/* Terminal Status */}
              <div className="mt-4 rounded-xl bg-white/5 p-3">
                <div className="flex items-center justify-between text-xs font-medium text-white/80">
                  <span>Terminal Status</span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    Online &amp; Synced
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-white/45">WooCommerce Backend Active</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Desktop Sidebar (xl+ only) ──────────────────────────────────── */}
      <aside className="hidden xl:flex xl:h-[100dvh] xl:w-[260px] xl:shrink-0 xl:flex-col xl:bg-navy xl:text-white">
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
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
          <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-light/70">
            Operations
          </div>
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/admin/pos"
                  ? pathname === "/admin/pos"
                  : pathname.startsWith(item.href);
              return (
                <NavLink key={item.href} item={item} active={active} onClick={() => {}} />
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
                href="/admin/staff"
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  pathname.startsWith("/admin/staff")
                    ? "bg-gradient-to-r from-gold/25 to-gold/10 text-gold-light shadow-[inset_4px_0_0_0_#C89B3C]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/40 group-hover:text-white/70">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                <span>Staff &amp; Access</span>
              </Link>
            </li>
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

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center justify-between text-xs font-medium text-white/80">
              <span>Terminal Status</span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Online &amp; Synced
              </span>
            </div>
            <p className="mt-1 text-[11px] text-white/45">WooCommerce Backend Active</p>
          </div>
        </div>
      </aside>
    </>
  );
}
