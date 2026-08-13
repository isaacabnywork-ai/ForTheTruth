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
  const [isOpen, setIsOpen] = useState(false);

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

  // Lock body scroll when modal is open
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

  const hasFilters =
    !!searchParams.get("category") ||
    !!searchParams.get("price") ||
    !!searchParams.get("availability") ||
    !!searchParams.get("on_sale") ||
    !!searchParams.get("author");

  const isCategoryPage = pathname.startsWith("/categories/");

  return (
    <>
      {/* Floating Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white text-charcoal border border-sand shadow-xl transition-transform hover:scale-105 active:scale-95 sm:bottom-12 sm:left-12"
        aria-label="Open Filters"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        {hasFilters && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-dark text-[10px] font-bold text-white" />
        )}
      </button>

      {/* Filter Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-cream p-5 shadow-2xl overflow-y-auto max-h-[85vh] animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-charcoal">Filters & Sorting</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-charcoal/60 hover:bg-sand/60 hover:text-charcoal transition-colors"
                aria-label="Close Filters"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Author search */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">Search Author</label>
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">Category</label>
                  <select
                    className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                    value={searchParams.get("category") ?? ""}
                    onChange={(e) => setParam({ category: e.target.value || null })}
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">Price</label>
                <select
                  className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                  value={searchParams.get("price") ?? ""}
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">Availability</label>
                <select
                  className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                  value={searchParams.get("availability") ?? ""}
                  onChange={(e) => setParam({ availability: e.target.value || null })}
                >
                  <option value="">All availability</option>
                  <option value="instock">In stock</option>
                  <option value="preorder">Pre-order</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60">Sort By</label>
                <select
                  className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-smooth hover:border-gold/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
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

              {/* On Sale */}
              <label className="mt-2 flex w-full cursor-pointer items-center justify-between rounded-xl border border-sand bg-white px-3 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-smooth hover:border-gold/50 has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:font-bold has-[:checked]:text-gold-dark">
                <span>Show On Sale Only</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-gold rounded cursor-pointer"
                  checked={searchParams.get("on_sale") === "true"}
                  onChange={(e) => setParam({ on_sale: e.target.checked ? "true" : null })}
                />
              </label>

              {/* Actions */}
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
                      setParam({ category: null, price: null, availability: null, on_sale: null, author: null, orderby: null });
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
    </>
  );
}
