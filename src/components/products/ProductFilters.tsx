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

const MAX_PRICE = 2500;

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

  // Author input state & debounce
  const [authorInput, setAuthorInput] = useState(
    searchParams.get("author") ?? ""
  );
  const authorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Price slider state & debounce
  const [localMin, setLocalMin] = useState(0);
  const [localMax, setLocalMax] = useState(MAX_PRICE);
  const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync author from URL
  useEffect(() => {
    setAuthorInput(searchParams.get("author") ?? "");
  }, [searchParams]);

  // Sync price from URL
  useEffect(() => {
    const priceParam = searchParams.get("price");
    if (!priceParam) {
      setLocalMin(0);
      setLocalMax(MAX_PRICE);
    } else {
      const [minStr, maxStr] = priceParam.split("-");
      const parsedMin = minStr ? parseInt(minStr, 10) : 0;
      const parsedMax = maxStr ? parseInt(maxStr, 10) : MAX_PRICE;
      setLocalMin(isNaN(parsedMin) ? 0 : parsedMin);
      setLocalMax(isNaN(parsedMax) ? MAX_PRICE : parsedMax);
    }
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

  const applyPriceChange = useCallback(
    (min: number, max: number, immediate = false) => {
      if (priceTimerRef.current) clearTimeout(priceTimerRef.current);

      const update = () => {
        if (min <= 0 && max >= MAX_PRICE) {
          setParam({ price: null });
        } else if (max >= MAX_PRICE) {
          setParam({ price: `${min}-` });
        } else {
          setParam({ price: `${min}-${max}` });
        }
      };

      if (immediate) {
        update();
      } else {
        priceTimerRef.current = setTimeout(update, 350);
      }
    },
    [setParam]
  );

  function handleMinPriceChange(newVal: number) {
    const clamped = Math.min(newVal, localMax - 50);
    setLocalMin(clamped);
    applyPriceChange(clamped, localMax);
  }

  function handleMaxPriceChange(newVal: number) {
    const clamped = Math.max(newVal, localMin + 50);
    setLocalMax(clamped);
    applyPriceChange(localMin, clamped);
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
  const activeCategory = categories.find((c) => c.slug === currentCategorySlug);

  // Readable price string
  const getPriceLabel = () => {
    if (localMin <= 0 && localMax >= MAX_PRICE) return "All prices";
    if (localMax >= MAX_PRICE) return `₹${localMin.toLocaleString("en-IN")}+`;
    if (localMin <= 0) return `Up to ₹${localMax.toLocaleString("en-IN")}`;
    return `₹${localMin.toLocaleString("en-IN")} – ₹${localMax.toLocaleString("en-IN")}`;
  };

  // Reusable Price Slider JSX
  const renderPriceSlider = () => (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-[10.5px] font-bold uppercase tracking-wider text-charcoal/70">
          Price Range
        </label>
        <span className="text-xs font-semibold text-charcoal font-mono">
          {getPriceLabel()}
        </span>
      </div>

      <div className="rounded-xl border border-sand bg-[#fbf9f5] p-3.5 shadow-2xs">
        {/* Slider dual track */}
        <div className="relative h-6 flex items-center">
          {/* Background track */}
          <div className="absolute h-1.5 w-full rounded-full bg-sand/70" />

          {/* Active fill bar */}
          <div
            className="absolute h-1.5 rounded-full bg-gold transition-all duration-75"
            style={{
              left: `${(localMin / MAX_PRICE) * 100}%`,
              right: `${100 - (localMax / MAX_PRICE) * 100}%`,
            }}
          />

          {/* Min thumb */}
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={25}
            value={localMin}
            onChange={(e) => handleMinPriceChange(Number(e.target.value))}
            style={{ zIndex: localMin > MAX_PRICE - 100 ? 30 : 20 }}
            className="absolute w-full pointer-events-none appearance-none bg-transparent focus:outline-none
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-gold
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:appearance-none
              [&::-moz-range-thumb]:pointer-events-auto
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-2
              [&::-moz-range-thumb]:border-gold
              [&::-moz-range-thumb]:shadow-md
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:hover:scale-110
              [&::-moz-range-thumb]:transition-transform"
            aria-label="Minimum price"
          />

          {/* Max thumb */}
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={25}
            value={localMax}
            onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
            style={{ zIndex: localMin > MAX_PRICE - 100 ? 20 : 30 }}
            className="absolute w-full pointer-events-none appearance-none bg-transparent focus:outline-none
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-gold
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:appearance-none
              [&::-moz-range-thumb]:pointer-events-auto
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-2
              [&::-moz-range-thumb]:border-gold
              [&::-moz-range-thumb]:shadow-md
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:hover:scale-110
              [&::-moz-range-thumb]:transition-transform"
            aria-label="Maximum price"
          />
        </div>

        {/* Labels under slider */}
        <div className="flex items-center justify-between pt-1 text-[10.5px] font-medium text-charcoal/50">
          <span>₹0</span>
          <span>₹1,250</span>
          <span>₹2,500+</span>
        </div>

        {/* Quick Price Preset Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-sand/50">
          {[
            { label: "< ₹300", min: 0, max: 300 },
            { label: "₹300–₹500", min: 300, max: 500 },
            { label: "₹500–₹1000", min: 500, max: 1000 },
            { label: "₹1000+", min: 1000, max: MAX_PRICE },
          ].map((preset) => {
            const isSelected =
              localMin === preset.min && localMax === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setLocalMin(preset.min);
                  setLocalMax(preset.max);
                  applyPriceChange(preset.min, preset.max, true);
                }}
                className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-gold text-white shadow-2xs font-bold"
                    : "bg-white hover:bg-sand/60 text-charcoal/70 border border-sand/70"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile/Tablet: Floating Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gold-dark border border-sand shadow-xl transition-transform hover:scale-105 active:scale-95 lg:hidden cursor-pointer"
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
                className="rounded-full p-2 text-charcoal/60 hover:bg-sand/60 hover:text-charcoal transition-colors cursor-pointer"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-gold-dark transition-colors cursor-pointer"
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

              {/* Price Slider */}
              {renderPriceSlider()}

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
                  className="flex-1 btn-gold py-2.5 text-sm shadow-md cursor-pointer"
                >
                  Apply
                </button>
                {hasFilters && (
                  <button
                    onClick={() => {
                      setAuthorInput("");
                      setLocalMin(0);
                      setLocalMax(MAX_PRICE);
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
                    className="btn-outline py-2.5 px-4 text-sm whitespace-nowrap cursor-pointer"
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
                  setLocalMin(0);
                  setLocalMax(MAX_PRICE);
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
                  onClick={() => {
                    setLocalMin(0);
                    setLocalMax(MAX_PRICE);
                    setParam({ price: null });
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-sand/60 hover:bg-sand px-2 py-0.5 text-[11px] font-medium text-charcoal transition-colors group cursor-pointer"
                  title="Remove price filter"
                >
                  <span>{getPriceLabel()}</span>
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
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-gold-dark transition-colors cursor-pointer"
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

            {/* Sliding Bar for Price Filtering */}
            {renderPriceSlider()}

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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-gold-dark cursor-pointer"
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

          {/* Topbar compact price filter */}
          <select
            className={selectCls}
            value={currentPrice ?? ""}
            onChange={(e) => setParam({ price: e.target.value || null })}
            aria-label="Price"
          >
            <option value="">Any price</option>
            <option value="0-299">Under ₹300</option>
            <option value="300-499">₹300 – ₹499</option>
            <option value="500-999">₹500 – ₹999</option>
            <option value="1000-">₹1000+</option>
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
                setLocalMin(0);
                setLocalMax(MAX_PRICE);
                setParam({
                  category: null,
                  price: null,
                  availability: null,
                  on_sale: null,
                  author: null,
                  orderby: null,
                });
              }}
              className="ml-auto text-[11px] font-bold uppercase tracking-widest text-royal hover:text-royal-dark cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </>
  );
}
