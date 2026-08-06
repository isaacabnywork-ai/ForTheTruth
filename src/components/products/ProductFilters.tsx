"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
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
  "rounded-full border border-sand bg-white px-4 py-2 text-sm text-charcoal shadow-card transition-smooth focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";

export function ProductFilters({ categories }: { categories: WCCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const hasFilters =
    !!searchParams.get("category") ||
    !!searchParams.get("price") ||
    !!searchParams.get("availability") ||
    !!searchParams.get("on_sale");

  const isCategoryPage = pathname.startsWith("/categories/");

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!isCategoryPage && categories.length > 0 && (
        <select
          className={selectCls}
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

      <label className="flex cursor-pointer items-center gap-2 rounded-full border border-sand bg-white px-4 py-2 text-sm shadow-card transition-smooth has-[:checked]:border-gold has-[:checked]:bg-gold/10">
        <input
          type="checkbox"
          className="accent-[#C89B3C]"
          checked={searchParams.get("on_sale") === "true"}
          onChange={(e) =>
            setParam({ on_sale: e.target.checked ? "true" : null })
          }
        />
        On sale
      </label>

      <div className="ml-auto flex items-center gap-3">
        {hasFilters && (
          <button
            onClick={() =>
              setParam({
                category: null,
                price: null,
                availability: null,
                on_sale: null,
              })
            }
            className="text-xs font-semibold uppercase tracking-widest text-gold-dark transition-smooth hover:text-charcoal"
          >
            Clear all
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
  );
}
