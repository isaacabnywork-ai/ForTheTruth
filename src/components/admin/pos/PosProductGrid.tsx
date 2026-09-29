"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { getAuthor, type Product, type WCCategory } from "@/types/product";
import { formatPrice } from "@/utils/currency";

interface PosProductGridProps {
  products: Product[];
  categories: WCCategory[];
  onAddToCart: (product: Product) => void;
}

function PosBookCover({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const src = product.images?.[0]?.src;

  // Curated palette of rich book-cloth gradients
  const palettes = [
    "from-[#16324F] via-[#1D4068] to-[#112438] text-amber-200 border-navy-light/40",
    "from-[#1F2937] via-[#374151] to-[#111827] text-[#E8C547] border-slate-600/40",
    "from-[#0F172A] via-[#1E293B] to-[#020617] text-sky-200 border-sky-800/40",
    "from-[#2B1B17] via-[#3E2723] to-[#1B100E] text-amber-100 border-amber-900/40",
    "from-[#064E3B] via-[#065F46] to-[#022C22] text-emerald-200 border-emerald-800/40",
    "from-[#4A044E] via-[#581C87] to-[#2E1065] text-fuchsia-200 border-purple-800/40",
  ];

  let hash = 0;
  for (let i = 0; i < product.name.length; i++) {
    hash = (hash + product.name.charCodeAt(i) * 19) % palettes.length;
  }
  const palette = palettes[hash];

  if (!src || imgError) {
    const author = getAuthor(product);
    return (
      <div
        className={`relative mx-auto mb-3 flex h-40 w-full select-none flex-col justify-between overflow-hidden rounded-xl border bg-gradient-to-br ${palette} p-3 shadow-inner`}
      >
        {/* Book spine simulation stripe */}
        <div className="absolute inset-y-0 left-0 w-2 bg-black/25 border-r border-white/10" />

        {/* Top header */}
        <div className="pl-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider opacity-70">
          <span>FTT Book</span>
          {product.sku && <span className="font-mono text-[8px] truncate max-w-[80px]">{product.sku}</span>}
        </div>

        {/* Title & Accent */}
        <div className="my-auto pl-2">
          <p className="line-clamp-3 font-serif text-xs font-bold leading-snug tracking-wide text-white drop-shadow-sm">
            {product.name}
          </p>
          <div className="mt-1.5 h-0.5 w-6 bg-gold/80 rounded-full" />
        </div>

        {/* Bottom meta */}
        <div className="pl-2 flex items-center justify-between text-[9px] font-medium opacity-80 text-white">
          <span className="truncate mr-1 max-w-[95px]">{author || "Conference Edition"}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 opacity-70"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M6.5 2v20" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto mb-3 h-40 w-full overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={product.name}
        onError={() => setImgError(true)}
        className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
    </div>
  );
}

export function PosProductGrid({ products, categories, onAddToCart }: PosProductGridProps) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Play crisp audio feedback on barcode scan
  const playBeep = useCallback((success = true) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(success ? 880 : 260, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (success ? 0.12 : 0.25));
      osc.start();
      osc.stop(ctx.currentTime + (success ? 0.12 : 0.25));
    } catch {}
  }, []);

  // Auto-focus search/barcode input on mount and on Cmd+K or Ctrl+K
  useEffect(() => {
    barcodeInputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keys used in attributes or meta_data that may hold the ISBN/EAN barcode
  const ISBN_ATTR_NAMES = ["isbn", "ean", "gtin", "barcode", "upc"];
  const ISBN_META_KEYS  = ["isbn", "_isbn", "ean", "_ean", "gtin", "_gtin", "barcode", "_barcode", "upc", "_upc", "raw_isbn"];

  /** Extract every ISBN/barcode value stored on a product (attributes + meta_data) */
  const getIsbnValues = useCallback((p: Product): string[] => {
    const vals: string[] = [];
    // Check attributes
    for (const attr of p.attributes ?? []) {
      const nameLower = (attr.name || "").toLowerCase().trim();
      const slugLower = ((attr as any).slug || "").toLowerCase().trim();
      const isIsbnAttr = ISBN_ATTR_NAMES.some((k) => nameLower.includes(k) || slugLower.includes(k));
      if (isIsbnAttr) {
        for (const opt of attr.options ?? []) {
          const clean = String(opt).replace(/[^0-9a-zA-Z]/g, "").toLowerCase();
          if (clean) vals.push(clean);
        }
      }
    }
    // Check meta_data
    for (const meta of p.meta_data ?? []) {
      const keyLower = (meta.key || "").toLowerCase().trim();
      const isIsbnMeta = ISBN_META_KEYS.some((k) => keyLower.includes(k));
      if (isIsbnMeta && meta.value) {
        const clean = String(meta.value).replace(/[^0-9a-zA-Z]/g, "").toLowerCase();
        if (clean) vals.push(clean);
      }
    }
    // Direct properties if any
    const anyP = p as any;
    if (anyP.isbn) vals.push(String(anyP.isbn).replace(/[^0-9a-zA-Z]/g, "").toLowerCase());
    if (anyP.ISBN) vals.push(String(anyP.ISBN).replace(/[^0-9a-zA-Z]/g, "").toLowerCase());
    return Array.from(new Set(vals.filter(Boolean)));
  }, []);

  /** Match a product by exact or normalized barcode, ISBN, SKU, ID, or title */
  const findProductByQuery = useCallback((query: string, allowPartial = true) => {
    const rawQuery = query.trim().toLowerCase();
    const queryCleaned = rawQuery.replace(/[^0-9a-zA-Z]/g, "");
    if (!rawQuery && !queryCleaned) return { match: null, multiple: false };

    const queryDigits = rawQuery.replace(/\D/g, "");
    const queryNoLeadingZero = queryCleaned.replace(/^0+/, "");
    const queryDigitsNoZero = queryDigits.replace(/^0+/, "");

    const queryCore9 = (queryDigits.length === 13 && (queryDigits.startsWith("978") || queryDigits.startsWith("979")))
      ? queryDigits.slice(3, 12)
      : queryDigits.length === 10
      ? queryDigits.slice(0, 9)
      : "";

    // 1. Exact Match: SKU, ID, exact Title, or ISBN/Barcode
    const exact = products.find((p) => {
      const pSkuRaw = (p.sku || "").toLowerCase().trim();
      const pSkuClean = pSkuRaw.replace(/[^0-9a-zA-Z]/g, "");
      if (pSkuRaw && (pSkuRaw === rawQuery || pSkuClean === queryCleaned)) return true;
      if (p.id.toString() === rawQuery) return true;
      if (p.name.toLowerCase().trim() === rawQuery) return true;

      const isbns = getIsbnValues(p);
      for (const isbn of isbns) {
        const isbnClean = isbn.toLowerCase().replace(/[^0-9a-zA-Z]/g, "");
        const isbnDigits = isbn.replace(/\D/g, "");

        if (isbnClean === queryCleaned) return true;
        if (queryDigits && isbnDigits && isbnDigits === queryDigits) return true;
        if (queryNoLeadingZero && isbnClean.replace(/^0+/, "") === queryNoLeadingZero) return true;
        if (queryDigitsNoZero && isbnDigits.replace(/^0+/, "") === queryDigitsNoZero) return true;

        if (queryCore9 && isbnDigits) {
          const isbnCore9 = (isbnDigits.length === 13 && (isbnDigits.startsWith("978") || isbnDigits.startsWith("979")))
            ? isbnDigits.slice(3, 12)
            : isbnDigits.length === 10
            ? isbnDigits.slice(0, 9)
            : "";
          if (isbnCore9 && isbnCore9 === queryCore9) return true;
        }

        if (queryDigits.length >= 12 && isbnDigits.length >= 12) {
          if (queryDigits.endsWith(isbnDigits) || isbnDigits.endsWith(queryDigits)) return true;
        }
      }
      return false;
    });

    if (exact) return { match: exact, multiple: false };

    if (!allowPartial || rawQuery.length < 3) return { match: null, multiple: false };

    // 2. Fallback: single partial match on title, SKU, or ISBN
    const partials = products.filter((p) => {
      const titleMatch = (p.name || "").toLowerCase().includes(rawQuery);
      const skuMatch = (p.sku || "").toLowerCase().includes(rawQuery);
      const authorMatch = (getAuthor(p) || "").toLowerCase().includes(rawQuery);
      const isbns = getIsbnValues(p);
      const isbnMatch = queryCleaned.length >= 4 && isbns.some((v: string) => v.includes(queryCleaned) || queryCleaned.includes(v));
      return titleMatch || skuMatch || authorMatch || isbnMatch;
    });

    if (partials.length === 1) return { match: partials[0], multiple: false };
    return { match: null, multiple: partials.length > 1 };
  }, [products, getIsbnValues]);

  /** Helper to add matched product and show visual/audio notification */
  const addScannedBook = useCallback((product: Product) => {
    onAddToCart(product);
    playBeep(true);
    setLastScanned(product.name);
    setSearch("");
    if (barcodeInputRef.current) {
      barcodeInputRef.current.value = "";
    }
    setTimeout(() => setLastScanned(null), 2500);
    setTimeout(() => barcodeInputRef.current?.focus(), 60);
  }, [onAddToCart, playBeep]);

  // Handle direct barcode scan or Enter in the search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      const queryVal = (e.currentTarget.value || search).trim();
      if (queryVal) {
        e.preventDefault();
        const { match, multiple } = findProductByQuery(queryVal, true);
        if (match) {
          addScannedBook(match);
        } else if (multiple) {
          playBeep(false);
          setLastScanned("__MULTI__");
          setTimeout(() => setLastScanned(null), 3000);
        } else {
          playBeep(false);
          setLastScanned("__NOT_FOUND__");
          setTimeout(() => setLastScanned(null), 2500);
        }
      }
    }
  };

  // Instant scanner detection via onChange (for scanners that type without Enter)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    const clean = val.trim().replace(/[^0-9a-zA-Z]/g, "");
    // Check if an exact complete ISBN/barcode (>= 10 chars) was entered
    if (clean.length >= 10) {
      const { match } = findProductByQuery(val, false);
      if (match) {
        addScannedBook(match);
      }
    }
  };

  // Ref buffer to prevent event listener churn and dropped keystrokes
  const scannerBufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);

  // Global Hardware Barcode Scanner Listener:
  // Catches scanner keystrokes regardless of where cursor focus is on the page
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isSearch = target === barcodeInputRef.current;
      const isOtherInput =
        target &&
        !isSearch &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      const now = Date.now();
      const diff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Ignore normal slow typing in non-search inputs
      if (isOtherInput && diff > 70) {
        scannerBufferRef.current = "";
        return;
      }

      // If more than 150ms between keys and not focused in search, reset buffer
      if (diff > 150 && !isSearch) {
        scannerBufferRef.current = "";
      }

      if (e.key === "Enter" || e.key === "Tab") {
        const queryToProcess = (isSearch ? (barcodeInputRef.current?.value || search) : scannerBufferRef.current).trim();
        if (queryToProcess) {
          const { match } = findProductByQuery(queryToProcess, true);
          if (match) {
            e.preventDefault();
            e.stopPropagation();
            addScannedBook(match);
            scannerBufferRef.current = "";
            return;
          }
        }
        scannerBufferRef.current = "";
        return;
      }

      if (e.key.length === 1) {
        scannerBufferRef.current += e.key;
        const clean = scannerBufferRef.current.trim().replace(/[^0-9a-zA-Z]/g, "");
        if (clean.length >= 10) {
          const { match } = findProductByQuery(clean, false);
          if (match) {
            e.preventDefault();
            e.stopPropagation();
            addScannedBook(match);
            scannerBufferRef.current = "";
          }
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown, true);
  }, [products, search, findProductByQuery, addScannedBook]);

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
      // Search text (title, author, SKU, ID, or ISBN/barcode)
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const qClean = q.replace(/[^0-9a-zA-Z]/g, "");
        const titleMatch = (p.name || "").toLowerCase().includes(q);
        const authorMatch = (getAuthor(p) || "").toLowerCase().includes(q);
        const skuMatch = (p.sku || "").toLowerCase().includes(q);
        const idMatch = p.id.toString().includes(q);
        const isbns = getIsbnValues(p);
        const isbnMatch =
          qClean.length >= 3 &&
          isbns.some((v: string) => v.includes(qClean) || qClean.includes(v));
        return titleMatch || authorMatch || skuMatch || idMatch || isbnMatch;
      }
      return true;
    });
  }, [products, search, selectedCat, inStockOnly, getIsbnValues]);

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
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder="Scan ISBN Barcode or Search Title, Author, SKU... (Auto-adds on scan)"
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-2.5 pl-10 pr-24 text-sm text-charcoal outline-none transition-all focus:border-cta focus:bg-white focus:ring-2 focus:ring-cta/20"
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

      {/* Barcode Scan Toast — green = found, red = not in catalog */}
      {lastScanned && lastScanned !== "__NOT_FOUND__" && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 shadow-sm animate-bounce">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">✓</span>
          Scanned &amp; Added: <span className="underline">{lastScanned}</span>
        </div>
      )}
      {lastScanned === "__NOT_FOUND__" && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-800 shadow-sm animate-bounce">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white text-xs">✕</span>
          Barcode not found — try searching by title instead.
        </div>
      )}
      {lastScanned === "__MULTI__" && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800 shadow-sm animate-bounce">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs">?</span>
          Multiple books matched — tap the correct one below to add it.
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
                    <PosBookCover product={product} />
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
