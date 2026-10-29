"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WCCategory } from "@/types/product";

const SORTS = [
  { value: "date", label: "Newest" },
  { value: "popularity", label: "Bestselling" },
  { value: "rating", label: "Top Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

const PRICES = [
  { value: "", label: "Any price" },
  { value: "0-299", label: "Under ₹299" },
  { value: "300-499", label: "₹300 – ₹499" },
  { value: "500-999", label: "₹500 – ₹999" },
  { value: "1000-", label: "₹1000+" },
] as const;

const selectCls =
  "w-full sm:w-auto truncate rounded-full border border-sand bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-charcoal shadow-sm transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";

export function ProductFilters({
  categories,
  layout = "topbar",
  totalCount,
}: {
  categories: WCCategory[];
  layout?: "sidebar" | "topbar";
  totalCount?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const [authorInput, setAuthorInput] = useState(
    searchParams.get("author") ?? ""
  );
  const authorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAuthorInput(searchParams.get("author") ?? "");
  }, [searchParams]);

  const setParam = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  function handleAuthorChange(value: string) {
    setAuthorInput(value);
    if (authorTimerRef.current) clearTimeout(authorTimerRef.current);
    authorTimerRef.current = setTimeout(() => {
      setParam({ author: value.trim() || null });
    }, 400);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const currentCategorySlug = searchParams.get("category");
  const currentPrice = searchParams.get("price");
  const currentAvailability = searchParams.get("availability");
  const currentOnSale = searchParams.get("on_sale");
  const currentAuthor = searchParams.get("author");
  const currentOrderby = searchParams.get("orderby");

  const hasFilters =
    !!currentCategorySlug ||
    !!currentPrice ||
    !!currentAvailability ||
    !!currentOnSale ||
    !!currentAuthor;

  const isCategoryPage = pathname.startsWith("/categories/");

  // Active filter pills for the sidebar
  const activeCategory = categories.find((c) => c.slug === currentCategorySlug);
  const activePrice = PRICES.find((p) => p.value === currentPrice);

  return (
    <>
      {/* Mobile/Tablet: Floating Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gold-dark border border-sand shadow-xl transition-transform hover:scale-105 active:scale-95 lg:hidden"
        aria-label="Open Filters"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        {hasFilters && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-dark text-[9px] font-bold text-white shadow-xs">
            !
          </span>
        )}
      </button>

      {/* Mobile/Tablet: Filter Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 lg:hidden">
          <div className="w-full max-w-sm rounded-3xl bg-cream p-5 shadow-2xl overflow-y-auto max-h-[85vh] animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-charcoal">
                Filters & Sorting
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-charcoal/60 hover:bg-sand/60 hover:text-charcoal transition-colors"
                aria-label="Close Filters"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Author */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
                  Search Author
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={authorInput}
                    onChange={(e) => handleAuthorChange(e.target.value)}
                    placeholder="Search by author..."
                    className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 pr-10 text-sm font-medium text-charcoal shadow-sm placeholder:text-charcoal/40 transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                  />
                  {authorInput && (
                    <button
                      type="button"
                      onClick={() => handleAuthorChange("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-gold-dark transition-colors"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Category */}
              {!isCategoryPage && categories.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
                    Category
                  </label>
                  <select
                    className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                    value={currentCategorySlug ?? ""}
                    onChange={(e) =>
                      setParam({ category: e.target.value || null })
                    }
                  >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.slug)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
                  Price
                </label>
                <select
                  className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                  value={currentPrice ?? ""}
                  onChange={(e) => setParam({ price: e.target.value || null })}
                >
                  {PRICES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
                  Availability
                </label>
                <select
                  className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                  value={currentAvailability ?? ""}
                  onChange={(e) =>
                    setParam({ availability: e.target.value || null })
                  }
                >
                  <option value="">All availability</option>
                  <option value="instock">In stock</option>
                  <option value="outofstock">Out of stock</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
                  Sort By
                </label>
                <select
                  className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                  value={currentOrderby ?? "date"}
                  onChange={(e) => setParam({ orderby: e.target.value })}
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* On Sale */}
              <label className="mt-2 flex w-full cursor-pointer items-center justify-between rounded-xl border border-sand bg-white px-3 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-smooth hover:border-gold/50 has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:font-bold has-[:checked]:text-gold-dark">
                <span>Show On Sale Only</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-gold rounded cursor-pointer"
                  checked={currentOnSale === "true"}
                  onChange={(e) =>
                    setParam({ on_sale: e.target.checked ? "true" : null })
                  }
                />
              </label>

              <div className="mt-3 flex gap-2 pt-3 border-t border-sand">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 btn-gold py-2.5 text-sm shadow-md"
                >
                  Apply
                </button>
                {hasFilters && (
                  <button
                    onClick={() => {
                      setAuthorInput("");
                      setParam({
                        category: null,
                        price: null,
                        availability: null,
                        on_sale: null,
                        author: null,
                        orderby: null,
                      });
                      setIsOpen(false);
                    }}
                    className="btn-outline py-2.5 px-4 text-sm whitespace-nowrap"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop View */}
      {layout === "sidebar" ? (
        /* Right Sidebar Filters Card */
        <div className="hidden lg:block w-full rounded-2xl border border-sand bg-white p-5 shadow-xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-sand/70">
            <div className="flex items-center gap-2">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gold-dark"
              >
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              <h3 className="font-serif text-base font-bold text-charcoal">
                Filters
              </h3>
              {hasFilters && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold-dark text-[9px] font-bold text-white">
                  ✓
                </span>
              )}
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setAuthorInput("");
                  setParam({
                    category: null,
                    price: null,
                    availability: null,
                    on_sale: null,
                    author: null,
                    orderby: null,
                  });
                }}
                className="text-xs font-semibold text-gold-dark hover:text-charcoal transition-colors hover:underline cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Active Filter Pills */}
          {hasFilters && (
            <div className="flex flex-wrap gap-1.5 pt-3 pb-2 border-b border-sand/40">
              {currentCategorySlug && (
                <button
                  type="button"
                  onClick={() => setParam({ category: null })}
                  className="inline-flex items-center gap-1 rounded-full bg-sand/60 hover:bg-sand px-2 py-0.5 text-[11px] font-medium text-charcoal transition-colors group cursor-pointer"
                  title="Remove category filter"
                >
                  <span className="truncate max-w-[120px]">
                    {activeCategory?.name || currentCategorySlug}
                  </span>
                  <span className="text-charcoal/40 group-hover:text-charcoal font-bold">
                    ×
                  </span>
                </button>
              )}
              {currentAuthor && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthorInput("");
                    setParam({ author: null });
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-sand/60 hover:bg-sand px-2 py-0.5 text-[11px] font-medium text-charcoal transition-colors group cursor-pointer"
                  title="Remove author filter"
                >
                  <span className="truncate max-w-[120px]">
                    Author: {currentAuthor}
                  </span>
                  <span className="text-charcoal/40 group-hover:text-charcoal font-bold">
                    ×
                  </span>
                </button>
              )}
              {currentPrice && (
                <button
                  type="button"
                  onClick={() => setParam({ price: null })}
                  className="inline-flex items-center gap-1 rounded-full bg-sand/60 hover:bg-sand px-2 py-0.5 text-[11px] font-medium text-charcoal transition-colors group cursor-pointer"
                  title="Remove price filter"
                >
                  <span>{activePrice?.label || currentPrice}</span>
                  <span className="text-charcoal/40 group-hover:text-charcoal font-bold">
                    ×
                  </span>
                </button>
              )}
              {currentAvailability && (
                <button
                  type="button"
                  onClick={() => setParam({ availability: null })}
                  className="inline-flex items-center gap-1 rounded-full bg-sand/60 hover:bg-sand px-2 py-0.5 text-[11px] font-medium text-charcoal transition-colors group cursor-pointer"
                  title="Remove availability filter"
                >
                  <span>
                    {currentAvailability === "instock"
                      ? "In Stock"
                      : "Out of Stock"}
                  </span>
                  <span className="text-charcoal/40 group-hover:text-charcoal font-bold">
                    ×
                  </span>
                </button>
              )}
              {currentOnSale === "true" && (
                <button
                  type="button"
                  onClick={() => setParam({ on_sale: null })}
                  className="inline-flex items-center gap-1 rounded-full bg-sand/60 hover:bg-sand px-2 py-0.5 text-[11px] font-medium text-charcoal transition-colors group cursor-pointer"
                  title="Remove sale filter"
                >
                  <span>On Sale</span>
                  <span className="text-charcoal/40 group-hover:text-charcoal font-bold">
                    ×
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Filter Controls Stack */}
          <div className="space-y-4 pt-3.5">
            {/* Sort By */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-charcoal/70">
                Sort By
              </label>
              <select
                className="w-full rounded-xl border border-sand bg-[#fbf9f5] px-3 py-2 text-xs font-medium text-charcoal shadow-2xs transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                value={currentOrderby ?? "date"}
                onChange={(e) => setParam({ orderby: e.target.value })}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Search */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-charcoal/70">
                Author
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={authorInput}
                  onChange={(e) => handleAuthorChange(e.target.value)}
                  placeholder="Search by author..."
                  className="w-full rounded-xl border border-sand bg-[#fbf9f5] px-3 py-2 pr-8 text-xs font-medium text-charcoal shadow-2xs placeholder:text-charcoal/40 transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                />
                {authorInput && (
                  <button
                    type="button"
                    onClick={() => handleAuthorChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-gold-dark transition-colors"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Category */}
            {!isCategoryPage && categories.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-charcoal/70">
                  Category
                </label>
                <select
                  className="w-full rounded-xl border border-sand bg-[#fbf9f5] px-3 py-2 text-xs font-medium text-charcoal shadow-2xs transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                  value={currentCategorySlug ?? ""}
                  onChange={(e) =>
                    setParam({ category: e.target.value || null })
                  }
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.slug)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Range */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-charcoal/70">
                Price
              </label>
              <select
                className="w-full rounded-xl border border-sand bg-[#fbf9f5] px-3 py-2 text-xs font-medium text-charcoal shadow-2xs transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                value={currentPrice ?? ""}
                onChange={(e) => setParam({ price: e.target.value || null })}
              >
                {PRICES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-charcoal/70">
                Availability
              </label>
              <select
                className="w-full rounded-xl border border-sand bg-[#fbf9f5] px-3 py-2 text-xs font-medium text-charcoal shadow-2xs transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                value={currentAvailability ?? ""}
                onChange={(e) =>
                  setParam({ availability: e.target.value || null })
                }
              >
                <option value="">All availability</option>
                <option value="instock">In stock</option>
                <option value="outofstock">Out of stock</option>
              </select>
            </div>

            {/* On Sale Only Toggle */}
            <div className="pt-1">
              <label className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-sand bg-[#fbf9f5] px-3 py-2.5 text-xs font-medium text-charcoal shadow-2xs transition-smooth hover:border-gold/50 has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:font-bold has-[:checked]:text-gold-dark">
                <span>On Sale Only</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-gold rounded cursor-pointer"
                  checked={currentOnSale === "true"}
                  onChange={(e) =>
                    setParam({ on_sale: e.target.checked ? "true" : null })
                  }
                />
              </label>
            </div>
          </div>

          {/* Results count indicator */}
          {totalCount !== undefined && (
            <div className="mt-5 pt-3.5 border-t border-sand/60 text-center">
              <p className="text-[11px] font-medium text-charcoal/50">
                {totalCount} {totalCount === 1 ? "book" : "books"} found
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Desktop: Inline Topbar Filters */
        <div className="mb-8 hidden flex-wrap items-center gap-3 lg:flex">
          {!isCategoryPage && categories.length > 0 && (
            <select
              className={selectCls}
              value={currentCategorySlug ?? ""}
              onChange={(e) => setParam({ category: e.target.value || null })}
              aria-label="Category"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.slug)}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <input
              type="text"
              value={authorInput}
              onChange={(e) => handleAuthorChange(e.target.value)}
              placeholder="Search by author..."
              className={selectCls + " pr-8"}
              aria-label="Author"
            />
            {authorInput && (
              <button
                type="button"
                onClick={() => handleAuthorChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-gold-dark"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <select
            className={selectCls}
            value={currentPrice ?? ""}
            onChange={(e) => setParam({ price: e.target.value || null })}
            aria-label="Price"
          >
            {PRICES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <select
            className={selectCls}
            value={currentAvailability ?? ""}
            onChange={(e) => setParam({ availability: e.target.value || null })}
            aria-label="Availability"
          >
            <option value="">All availability</option>
            <option value="instock">In stock</option>
            <option value="outofstock">Out of stock</option>
          </select>

          <select
            className={selectCls}
            value={currentOrderby ?? "date"}
            onChange={(e) => setParam({ orderby: e.target.value })}
            aria-label="Sort By"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-charcoal/70 hover:text-charcoal ml-2">
            <input
              type="checkbox"
              className="h-4 w-4 accent-gold rounded cursor-pointer"
              checked={currentOnSale === "true"}
              onChange={(e) =>
                setParam({ on_sale: e.target.checked ? "true" : null })
              }
            />
            <span>On Sale Only</span>
          </label>

          {hasFilters && (
            <button
              onClick={() => {
                setAuthorInput("");
                setParam({
                  category: null,
                  price: null,
                  availability: null,
                  on_sale: null,
                  author: null,
                  orderby: null,
                });
              }}
              className="ml-auto text-[11px] font-bold uppercase tracking-widest text-royal hover:text-royal-dark"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </>
  );
}
