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
  "w-full sm:w-auto truncate rounded-full border border-sand bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-charcoal shadow-card transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";

export function ProductFilters({ categories }: { categories: WCCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Author search input local state (debounced → URL param)
  const [authorInput, setAuthorInput] = useState(
    searchParams.get("author") ?? ""
  );
  const authorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync authorInput if URL param changes externally (e.g., browser back)
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
      params.delete("page"); // reset pagination on filter change
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

  const hasFilters =
    !!searchParams.get("category") ||
    !!searchParams.get("price") ||
    !!searchParams.get("availability") ||
    !!searchParams.get("on_sale") ||
    !!searchParams.get("author");

  const isCategoryPage = pathname.startsWith("/categories/");

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Mobile Active Filters Header */}
      {hasFilters && (
        <div className="flex items-center justify-between rounded-xl bg-cream/70 border border-sand px-3.5 py-2 text-xs text-charcoal sm:hidden">
          <span className="font-semibold text-charcoal/85">Active filters applied</span>
          <button
            onClick={() => {
              setAuthorInput("");
              setParam({
                category: null,
                price: null,
                availability: null,
                on_sale: null,
                author: null,
              });
            }}
            className="flex items-center gap-1 rounded-full bg-gold-dark px-3 py-1 text-[11px] font-bold text-white shadow-sm transition-all active:scale-95"
          >
            Clear all ✕
          </button>
        </div>
      )}

      {/* Structured Filters Grid (Mobile: 2-Column Symmetrical Grid | Desktop: Flex Toolbar) */}
      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3 w-full">
        {/* Author search input — first filter */}
        <div className="relative col-span-2 sm:col-span-1 sm:w-44">
          <input
            type="text"
            value={authorInput}
            onChange={(e) => handleAuthorChange(e.target.value)}
            placeholder="Search by author..."
            aria-label="Filter by author"
            className="w-full rounded-full border border-sand bg-white px-4 py-2 pr-8 text-xs sm:text-sm font-medium text-charcoal shadow-card placeholder:text-charcoal/40 transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
          />
          {authorInput && (
            <button
              type="button"
              aria-label="Clear author filter"
              onClick={() => handleAuthorChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-gold-dark transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {!isCategoryPage && categories.length > 0 && (
          <select
            className={`${selectCls} col-span-2 sm:col-span-1`}
            aria-label="Filter by category"
            value={searchParams.get("category") ?? ""}
            onChange={(e) => setParam({ category: e.target.value || null })}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        <select
          className={selectCls}
          aria-label="Filter by price"
          value={searchParams.get("price") ?? ""}
          onChange={(e) => setParam({ price: e.target.value || null })}
        >
          {PRICES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <select
          className={selectCls}
          aria-label="Filter by availability"
          value={searchParams.get("availability") ?? ""}
          onChange={(e) => setParam({ availability: e.target.value || null })}
        >
          <option value="">All availability</option>
          <option value="instock">In stock</option>
          <option value="preorder">Pre-order</option>
        </select>

        <label className="flex w-full sm:w-auto cursor-pointer items-center justify-center sm:justify-start gap-2 truncate rounded-full border border-sand bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-charcoal shadow-card transition-smooth hover:border-gold/50 has-[:checked]:border-gold has-[:checked]:bg-gold/15 has-[:checked]:font-bold has-[:checked]:text-gold-dark">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 sm:h-4 sm:w-4 accent-gold rounded cursor-pointer shrink-0"
            checked={searchParams.get("on_sale") === "true"}
            onChange={(e) =>
              setParam({ on_sale: e.target.checked ? "true" : null })
            }
          />
          <span className="truncate">On sale</span>
        </label>

        <div className="flex w-full sm:w-auto items-center gap-2 sm:ml-auto sm:gap-3">
          {hasFilters && (
            <button
              onClick={() => {
                setAuthorInput("");
                setParam({ category: null, price: null, availability: null, on_sale: null, author: null });
              }}
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-cream border border-sand px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-dark shadow-xs transition-smooth hover:bg-gold-dark hover:text-white"
            >
              Clear all ✕
            </button>
          )}
          <select
            className={selectCls}
            aria-label="Sort by"
            value={searchParams.get("orderby") ?? "date"}
            onChange={(e) => setParam({ orderby: e.target.value })}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
