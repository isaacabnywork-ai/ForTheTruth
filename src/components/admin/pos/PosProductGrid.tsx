"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { getAuthor, type Product, type WCCategory } from "@/types/product";
import { formatPrice } from "@/utils/currency";

interface PosProductGridProps {
  products: Product[];
  categories: WCCategory[];
  onAddToCart: (product: Product) => void;
}

export function PosProductGrid({ products, categories, onAddToCart }: PosProductGridProps) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Focus search/barcode input on Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle barcode / ISBN direct press (Enter key in search bar)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      const query = search.trim().toLowerCase();
      const match = products.find(
        (p) =>
          p.sku?.toLowerCase() === query ||
          p.id.toString() === query ||
          p.name.toLowerCase() === query
      );
      if (match) {
        onAddToCart(match);
        setLastScanned(match.name);
        setSearch("");
        setTimeout(() => setLastScanned(null), 2500);
      }
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Stock filter
      if (inStockOnly) {
        if (p.stock_status === "outofstock") return false;
        if (typeof p.stock_quantity === "number" && p.stock_quantity <= 0) return false;
      }
      // Category filter
      if (selectedCat !== null) {
        const inCat = p.categories?.some((c) => c.id === selectedCat);
        if (!inCat) return false;
      }
      // Search text (title, author, SKU, or ID)
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = (p.name || "").toLowerCase().includes(q);
        const authorMatch = (getAuthor(p) || "").toLowerCase().includes(q);
        const skuMatch = (p.sku || "").toLowerCase().includes(q);
        const idMatch = p.id.toString().includes(q);
        return titleMatch || authorMatch || skuMatch || idMatch;
      }
      return true;
    });
  }, [products, search, selectedCat, inStockOnly]);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Top Controls: Search Bar + Barcode & Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              ref={barcodeInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scan ISBN Barcode or Search Title, Author, SKU... (Press Enter to auto-add)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-24 text-sm text-charcoal outline-none transition-all focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-400 shadow-xs">
              ⌘K / ISBN
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-charcoal select-none transition-colors hover:bg-slate-100">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded text-cta accent-cta"
              />
              In Stock Only
            </label>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 scrollbar-hide">
          <button
            onClick={() => setSelectedCat(null)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedCat === null
                ? "bg-navy text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Books ({products.length})
          </button>
          {categories.slice(0, 10).map((cat) => {
            const count = cat.count || 0;
            if (count === 0 && selectedCat !== cat.id) return null;
            const active = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(active ? null : cat.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-navy text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Barcode Success Toast Alert */}
      {lastScanned && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 shadow-sm animate-bounce">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">✓</span>
          Scanned &amp; Added: <span className="underline">{lastScanned}</span>
        </div>
      )}

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center">
            <p className="text-sm font-bold text-slate-500">No matching titles found.</p>
            <p className="mt-1 text-xs text-slate-400">Try changing your filter or clearing the search query.</p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-3 rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-bold text-charcoal hover:bg-slate-200"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredProducts.map((product) => {
              const author = getAuthor(product);
              const stockQty = typeof product.stock_quantity === "number" ? product.stock_quantity : null;
              const isOut = product.stock_status === "outofstock" || (stockQty !== null && stockQty <= 0);
              const isLow = !isOut && stockQty !== null && stockQty <= 5;
              const imageUrl = product.images?.[0]?.src || "/images/placeholder.jpg";

              return (
                <div
                  key={product.id}
                  onClick={() => !isOut && onAddToCart(product)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xs transition-all duration-200 ${
                    isOut
                      ? "opacity-50 cursor-not-allowed bg-slate-50"
                      : "cursor-pointer hover:-translate-y-1 hover:border-gold hover:shadow-lg active:scale-[0.98]"
                  }`}
                >
                  {/* Stock Pill & SKU */}
                  <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black tracking-wider shadow-xs ${
                        isOut
                          ? "bg-rose-500 text-white"
                          : isLow
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-emerald-600/90 text-white"
                      }`}
                    >
                      {isOut
                        ? "OUT"
                        : stockQty !== null
                        ? `${stockQty} IN STOCK`
                        : "IN STOCK"}
                    </span>
                  </div>

                  {/* Thumbnail & Info */}
                  <div>
                    <div className="relative mx-auto h-40 w-full overflow-hidden rounded-xl bg-slate-100 mb-3">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="line-clamp-2 font-display text-xs font-bold text-charcoal group-hover:text-navy">
                      {product.name}
                    </h3>
                    {author && (
                      <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-slate-500">
                        {author}
                      </p>
                    )}
                  </div>

                  {/* Price & Add Action */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <div>
                      <span className="font-display text-sm font-black text-navy">
                        {formatPrice(product.price || product.regular_price || "0")}
                      </span>
                      {product.sale_price && product.regular_price && (
                        <span className="ml-1 text-[10px] font-medium line-through text-slate-400">
                          ₹{product.regular_price}
                        </span>
                      )}
                    </div>
                    {!isOut && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy/5 text-navy font-black transition-colors group-hover:bg-gold-gradient group-hover:text-white shadow-xs">
                        +
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
