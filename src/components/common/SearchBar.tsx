"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/utils/currency";

interface Suggestion {
  id: number;
  name: string;
  slug: string;
  price: string;
  sale_price: string;
  on_sale: boolean;
  image: string | null;
  author: string | null;
  rating?: string | null;
  ratingCount?: number | null;
  short_description?: string | null;
  stock_status?: string | null;
}

const RECENT_KEY = "ftt-recent-searches";

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.trim().replace(/[.*+?^()|[\]\\]/g, "\\$&");
  const regex = new RegExp("(" + escaped + ")", "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <strong key={i} className="font-black text-charcoal">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [activeItem, setActiveItem] = useState<Suggestion | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setActiveItem(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/search?q=" + encodeURIComponent(q) + "&limit=6");
        const data = await res.json();
        const found = data.results ?? [];
        setResults(found);
        setActiveItem(found.length > 0 ? found[0] : null);
      } catch {
        setResults([]);
        setActiveItem(null);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const remember = useCallback(
    (term: string) => {
      const next = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
      setRecent(next);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [recent]
  );

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    remember(q);
    setOpen(false);
    router.push("/products/search?q=" + encodeURIComponent(q));
  }

  function handleSelect(slug: string) {
    remember(query.trim() || slug);
    setOpen(false);
    router.push("/products/" + slug);
  }

  function handleRecentSelect(term: string) {
    setQuery(term);
    setOpen(false);
    router.push("/products/search?q=" + encodeURIComponent(term));
  }

  const showPanel =
    open &&
    (loading || results.length > 0 || (query.trim().length < 2 && recent.length > 0));

  return (
    <div ref={boxRef} className="relative">
      <form onSubmit={submit} role="search" className="relative z-50">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search titles, authors, or topics..."
          aria-label="Search books"
          aria-expanded={showPanel}
          aria-haspopup="listbox"
          className="w-full rounded-full border border-sand bg-cream/70 px-5 py-2.5 pr-11 text-sm text-charcoal placeholder:text-charcoal/40 transition-smooth focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/25"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-charcoal/45 transition-smooth hover:bg-gold hover:text-white"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </form>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            key="search-dropdown"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 right-0 md:left-auto md:right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-2xl border border-sand bg-white shadow-2xl w-full md:w-[700px] flex flex-col md:flex-row-reverse"
            role="listbox"
            aria-label="Search suggestions"
          >
            {/* Results List (Right side on desktop, under the search input) */}
            <div className="w-full md:w-[320px] shrink-0 border-b md:border-b-0 md:border-l border-sand/60 bg-white">
              {query.trim().length < 2 && recent.length > 0 && (
                <div className="p-3">
                  <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-charcoal/35">
                    Recent searches
                  </p>
                  {recent.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRecentSelect(r)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-charcoal/70 transition-smooth hover:bg-cream hover:text-gold-dark"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-charcoal/30" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="truncate">{r}</span>
                    </button>
                  ))}
                </div>
              )}

              {loading && query.trim().length >= 2 && (
                <div className="space-y-1 p-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-1">
                      <div className="h-[55px] w-10 shrink-0 animate-pulse rounded bg-sand/60" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 animate-pulse rounded-full bg-sand/60" />
                        <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-sand/40" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && results.length > 0 && (
                <ul className="max-h-[380px] overflow-y-auto">
                  {results.map((r) => (
                    <li key={r.id} role="option" aria-selected={activeItem?.id === r.id}>
                      <button
                        onClick={() => handleSelect(r.slug)}
                        onMouseEnter={() => setActiveItem(r)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                          activeItem?.id === r.id ? "bg-[#e5e5e5]" : "hover:bg-cream/60"
                        }`}
                      >
                        <span className="relative block h-[50px] w-[35px] shrink-0 overflow-hidden bg-white shadow-sm ring-1 ring-sand/60">
                          {r.image ? (
                            <Image src={r.image} alt="" fill sizes="35px" className="object-cover" />
                          ) : (
                            <span className="block h-full w-full bg-gold-gradient" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-charcoal/80 leading-tight">
                            <HighlightText text={r.name} query={query.trim()} />
                          </span>
                        </span>
                        <span className="shrink-0 flex flex-col items-end gap-0.5">
                          {r.on_sale && r.sale_price ? (
                            <>
                              <span className="text-[10px] text-slate-400 line-through leading-none">{formatPrice(r.price)}</span>
                              <span className="text-sm text-charcoal leading-none">{formatPrice(r.sale_price)}</span>
                            </>
                          ) : (
                            <span className="text-sm text-charcoal leading-none">{formatPrice(r.price)}</span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!loading && results.length > 0 && (
                <div className="border-t border-sand/60">
                  <button
                    onClick={() => submit()}
                    className="block w-full px-4 py-3 text-center text-xs text-charcoal/50 hover:bg-cream/60 uppercase tracking-widest transition-colors"
                  >
                    See all products...
                  </button>
                </div>
              )}

              {!loading && query.trim().length >= 2 && results.length === 0 && (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm font-semibold text-charcoal/50">No matches found</p>
                  <p className="mt-1 text-xs text-charcoal/35">Try an author name or a broader topic.</p>
                  <button
                    onClick={() => submit()}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-4 py-1.5 text-xs font-bold text-gold-dark transition-smooth hover:bg-gold hover:text-white"
                  >
                    Browse all results for &ldquo;{query.trim()}&rdquo;
                  </button>
                </div>
              )}
            </div>

            {/* Preview Panel (Left side on desktop, expanding towards the center) */}
            {activeItem && (
              <div className="hidden md:flex flex-1 flex-col bg-white p-8 overflow-hidden relative">
                {/* Background decorative image if available */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                  {activeItem.image && (
                    <Image src={activeItem.image} alt="" width={400} height={400} className="object-cover blur-sm" />
                  )}
                </div>

                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex justify-center mb-6 h-[200px]">
                    <div className="relative h-full aspect-[2/3] shadow-lg ring-1 ring-black/5 bg-white">
                      {activeItem.image && (
                        <Image src={activeItem.image} alt="" fill sizes="200px" className="object-cover" />
                      )}
                    </div>
                  </div>

                  <div className="border-b border-sand/60 pb-4 mb-4">
                    <h3 className="font-display text-2xl font-black text-navy leading-tight mb-1">
                      {activeItem.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      {activeItem.author && (
                        <span className="text-sm font-semibold text-charcoal/60">{activeItem.author}</span>
                      )}
                      {activeItem.ratingCount ? (
                        <div className="flex items-center gap-1 text-gold-dark text-[11px]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < Math.round(Number(activeItem.rating)) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                          <span className="text-charcoal/40 ml-1">({activeItem.ratingCount})</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="text-2xl font-black text-navy">
                      {activeItem.on_sale && activeItem.sale_price ? formatPrice(activeItem.sale_price) : formatPrice(activeItem.price)}
                    </div>
                  </div>

                  {activeItem.short_description && (
                    <div
                      className="text-sm text-charcoal/70 line-clamp-3 mb-6"
                      dangerouslySetInnerHTML={{ __html: activeItem.short_description }}
                    />
                  )}

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    {activeItem.stock_status === "outofstock" ? (
                      <span className="text-sm font-semibold text-[#e1523c]">Out of stock</span>
                    ) : (
                      <span className="text-sm font-semibold text-emerald-600">In stock</span>
                    )}
                    <button
                      onClick={() => handleSelect(activeItem.slug)}
                      className="rounded bg-gold px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gold-dark shadow-sm"
                    >
                      Read more
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
