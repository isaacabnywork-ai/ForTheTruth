"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { WCCategory } from "@/types/product";
import { COLLECTIONS } from "@/utils/constants";
import { SOCIAL_LINKS } from "./SocialIcons";

/* ── SVG icon paths ────────────────────────────────────────── */
const ICONS = {
  categories:
    "M10 3H3v7h7V3zM21 3h-7v7h7V3zM21 14h-7v7h7v-7zM10 14H3v7h7v-7z",
  bible:
    "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  children:
    "M12 2a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5zm0 12c4.418 0 8 2.239 8 5v3H4v-3c0-2.761 3.582-5 8-5z",
  heart:
    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  church: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6",
  theology: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20",
  building:
    "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  sparkles:
    "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.857L13 21l-2.286-6.857L5 12l5.714-2.857L13 3z",
  scroll:
    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  contact:
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.34a2 2 0 0 1-.45 2.11L8.09 9.41a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.74.32 1.53.55 2.34.68a2 2 0 0 1 1.72 2v.55z",
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

/* ── Curated Catalog Categories for Sidebar ─────────────────── */
const SIDEBAR_CATEGORIES = [
  { label: "Bible Study", slug: "bible-study", href: "/categories/bible-study" },
  { label: "Children", slug: "children", href: "/categories/children" },
  { label: "Christian Living", slug: "christian-living", href: "/categories/christian-living" },
  { label: "Ministry", slug: "ministry", href: "/categories/ministry" },
  { label: "Theology", slug: "theology", href: "/categories/theology" },
  { label: "Apologetics", slug: "apologetics", href: "/categories/apologetics" },
  { label: "Bible Commentary", slug: "bible-commentary", href: "/categories/bible-commentary" },
  { label: "Counselling", slug: "counselling", href: "/categories/counselling" },
  { label: "Devotional", slug: "devotional", href: "/categories/devotional" },
  { label: "Marriage & Family", slug: "marriage-family", href: "/categories/marriage-family" },
  { label: "Parenting", slug: "parenting", href: "/categories/parenting" },
  { label: "Prayer", slug: "prayer", href: "/categories/prayer" },
  { label: "Upcoming Titles", slug: "upcoming", href: "/products?availability=outofstock" },
];

/* ── Publishers ────────────────────────────────────────────── */
const SIDEBAR_PUBLISHERS = [
  { label: "For The Truth", href: "/products?publisher=248" },
  { label: "Shepherd Press", href: "/products?publisher=1108" },
  { label: "10 Publishing", href: "/products?publisher=1887" },
  { label: "The Good Book Company", href: "/products?publisher=163" },
];

/* ── Other Resources & Useful Links ────────────────────────── */
const SIDEBAR_MORE = [
  { label: "Statement of Faith", href: "/statement-of-faith" },
  { label: "Church Resources", href: "/church-resources" },
  { label: "Contact Us", href: "/contact" },
];

/* ── Component ─────────────────────────────────────────────── */
export function DesktopSidebar({
  categories,
}: {
  categories: WCCategory[];
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [catOpen, setCatOpen] = useState(true);
  const [publishersOpen, setPublishersOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  if (pathname?.startsWith("/admin")) return null;

  const isActive = (href: string) => {
    const basePath = href.split("?")[0];
    return pathname === basePath;
  };

  const getCategoryCount = (slug: string) => {
    const match = categories.find((c) => c.slug === slug);
    return match && typeof match.count === "number" && match.count > 0 ? match.count : null;
  };

  return (
    <aside
      className={`sticky top-0 z-40 self-start hidden h-screen shrink-0 flex-col border-r border-sand bg-white transition-all duration-300 ease-out lg:flex ${
        collapsed ? "w-[68px]" : "w-[260px]"
      }`}
      aria-label="Desktop sidebar"
    >
      {/* ── Brand + collapse toggle ─────────────────────────── */}
      <div className="flex items-center justify-between border-b border-sand px-4 py-4">
        {!collapsed ? (
          <Link href="/" className="shrink-0 flex items-center gap-2.5">
            <div className="relative h-9 w-9 shrink-0">
              <Image src="/logo.png" alt="For The Truth" fill className="object-contain" priority />
            </div>
            <span className="font-display text-base font-bold text-charcoal">
              For The Truth
            </span>
          </Link>
        ) : (
          <Link href="/" className="mx-auto block" title="For The Truth">
            <div className="relative h-8 w-8 shrink-0">
              <Image src="/logo.png" alt="For The Truth" fill className="object-contain" priority />
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((p) => !p)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`rounded-lg p-2 text-charcoal/40 transition-smooth hover:bg-cream hover:text-gold-dark ${
            collapsed ? "mt-2 mx-auto" : ""
          }`}
        >
          <Icon d={collapsed ? ICONS.expand : ICONS.collapse} size={16} />
        </button>
      </div>

      {/* ── Scrollable area ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-hide">
        {collapsed ? (
          /* Collapsed Icon-Only Navigation */
          <div className="flex flex-col items-center space-y-2">
            <Link
              href="/categories"
              className={`p-2.5 rounded-xl transition-smooth hover:bg-cream hover:text-gold-dark ${
                isActive("/categories") ? "bg-gold/10 text-gold-dark" : "text-charcoal/60"
              }`}
              title="All Categories"
            >
              <Icon d={ICONS.categories} size={18} />
            </Link>
            <Link
              href="/categories/bible-study"
              className={`p-2.5 rounded-xl transition-smooth hover:bg-cream hover:text-gold-dark ${
                isActive("/categories/bible-study") ? "bg-gold/10 text-gold-dark" : "text-charcoal/60"
              }`}
              title="Bible Study"
            >
              <Icon d={ICONS.bible} size={18} />
            </Link>
            <Link
              href="/categories/children"
              className={`p-2.5 rounded-xl transition-smooth hover:bg-cream hover:text-gold-dark ${
                isActive("/categories/children") ? "bg-gold/10 text-gold-dark" : "text-charcoal/60"
              }`}
              title="Children Books"
            >
              <Icon d={ICONS.children} size={18} />
            </Link>
            <Link
              href="/categories/christian-living"
              className={`p-2.5 rounded-xl transition-smooth hover:bg-cream hover:text-gold-dark ${
                isActive("/categories/christian-living") ? "bg-gold/10 text-gold-dark" : "text-charcoal/60"
              }`}
              title="Christian Living"
            >
              <Icon d={ICONS.heart} size={18} />
            </Link>
            <Link
              href="/categories/theology"
              className={`p-2.5 rounded-xl transition-smooth hover:bg-cream hover:text-gold-dark ${
                isActive("/categories/theology") ? "bg-gold/10 text-gold-dark" : "text-charcoal/60"
              }`}
              title="Theology"
            >
              <Icon d={ICONS.theology} size={18} />
            </Link>
            <Link
              href="/products"
              className={`p-2.5 rounded-xl transition-smooth hover:bg-cream hover:text-gold-dark ${
                isActive("/products") ? "bg-gold/10 text-gold-dark" : "text-charcoal/60"
              }`}
              title="Publishers & Catalog"
            >
              <Icon d={ICONS.building} size={18} />
            </Link>
            <Link
              href="/products?orderby=popularity"
              className="p-2.5 rounded-xl text-charcoal/60 transition-smooth hover:bg-cream hover:text-gold-dark"
              title="Collections"
            >
              <Icon d={ICONS.sparkles} size={18} />
            </Link>
            <Link
              href="/statement-of-faith"
              className={`p-2.5 rounded-xl transition-smooth hover:bg-cream hover:text-gold-dark ${
                isActive("/statement-of-faith") ? "bg-gold/10 text-gold-dark" : "text-charcoal/60"
              }`}
              title="Statement of Faith"
            >
              <Icon d={ICONS.scroll} size={18} />
            </Link>
            <Link
              href="/contact"
              className={`p-2.5 rounded-xl transition-smooth hover:bg-cream hover:text-gold-dark ${
                isActive("/contact") ? "bg-gold/10 text-gold-dark" : "text-charcoal/60"
              }`}
              title="Contact Us"
            >
              <Icon d={ICONS.contact} size={18} />
            </Link>
          </div>
        ) : (
          /* Expanded Full Catalog Sidebar */
          <div className="space-y-4">
            {/* 1. CATEGORIES */}
            <div>
              <button
                onClick={() => setCatOpen((p) => !p)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-bold text-charcoal/70 transition-smooth hover:text-gold-dark"
              >
                <span>Categories</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`transition-transform duration-300 ${catOpen ? "rotate-90" : ""}`}
                  aria-hidden="true"
                >
                  <path d={ICONS.chevron} />
                </svg>
              </button>
              {catOpen && (
                <ul className="mt-1 space-y-0.5">
                  {SIDEBAR_CATEGORIES.map((cat) => {
                    const count = getCategoryCount(cat.slug);
                    const active = isActive(cat.href);
                    return (
                      <li key={cat.slug}>
                        <Link
                          href={cat.href}
                          className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-[13px] transition-smooth ${
                            active
                              ? "bg-gold/10 font-semibold text-gold-dark"
                              : "text-charcoal/65 hover:bg-cream hover:text-charcoal"
                          }`}
                        >
                          <span className="truncate">{cat.label}</span>
                          {count != null && (
                            <span className="ml-2 text-[11px] font-medium text-charcoal/30">
                              {count}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                  <li>
                    <Link
                      href="/categories"
                      className="mt-1.5 inline-flex items-center gap-1 px-3 text-xs font-bold text-gold-dark hover:underline transition-smooth hover:gap-2"
                    >
                      View all categories <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            <div className="border-t border-sand/60" />

            {/* 2. PUBLISHERS */}
            <div>
              <button
                onClick={() => setPublishersOpen((p) => !p)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-bold text-charcoal/70 transition-smooth hover:text-gold-dark"
              >
                <span>Publishers</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`transition-transform duration-300 ${publishersOpen ? "rotate-90" : ""}`}
                  aria-hidden="true"
                >
                  <path d={ICONS.chevron} />
                </svg>
              </button>
              {publishersOpen && (
                <ul className="mt-1 space-y-0.5">
                  {SIDEBAR_PUBLISHERS.map((pub) => (
                    <li key={pub.label}>
                      <Link
                        href={pub.href}
                        className="block rounded-lg px-3 py-1.5 text-[13px] text-charcoal/65 transition-smooth hover:bg-cream hover:text-charcoal"
                      >
                        {pub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-sand/60" />

            {/* 3. COLLECTIONS */}
            <div>
              <button
                onClick={() => setCollectionsOpen((p) => !p)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-bold text-charcoal/70 transition-smooth hover:text-gold-dark"
              >
                <span>Collections</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`transition-transform duration-300 ${collectionsOpen ? "rotate-90" : ""}`}
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
                        className="block rounded-lg px-3 py-1.5 text-[13px] text-charcoal/65 transition-smooth hover:bg-cream hover:text-charcoal"
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/products?price=0-299"
                      className="block rounded-lg px-3 py-1.5 text-[13px] text-charcoal/65 transition-smooth hover:bg-cream hover:text-charcoal"
                    >
                      Under ₹299
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/free-ebooks"
                      className="block rounded-lg px-3 py-1.5 text-[13px] text-charcoal/65 transition-smooth hover:bg-cream hover:text-charcoal"
                    >
                      Free E-Books
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            <div className="border-t border-sand/60" />

            {/* 4. MORE LINKS */}
            <div>
              <button
                onClick={() => setMoreOpen((p) => !p)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-bold text-charcoal/70 transition-smooth hover:text-gold-dark"
              >
                <span>More</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`transition-transform duration-300 ${moreOpen ? "rotate-90" : ""}`}
                  aria-hidden="true"
                >
                  <path d={ICONS.chevron} />
                </svg>
              </button>
              {moreOpen && (
                <ul className="mt-1 space-y-0.5">
                  {SIDEBAR_MORE.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block rounded-lg px-3 py-1.5 text-[13px] transition-smooth ${
                          isActive(item.href)
                            ? "bg-gold/10 font-semibold text-gold-dark"
                            : "text-charcoal/65 hover:bg-cream hover:text-charcoal"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer: Social icons ────────────────────────────── */}
      <div className="border-t border-sand p-3">
        {!collapsed ? (
          <div className="px-1 pt-0.5">
            <p className="mb-2 text-[11px] font-semibold text-charcoal/50">
              Follow Us
            </p>
            <div className="flex items-center justify-between">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 ${s.bgClass}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 ${s.bgClass}`}
              >
                {s.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
