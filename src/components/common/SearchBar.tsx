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
}

const RECENT_KEY = "ftt-recent-searches";

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.trim().replace(/[.*+?^()|[]\]/g, "\$&");
  const regex = new RegExp("(" + escaped + ")", "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <strong key={i} className="font-bold text-charcoal">
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
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/search?q=" + encodeURIComponent(q) + "&limit=6");
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
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
      <form onSubmit={submit} role="search">
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
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-sand bg-white shadow-2xl"
            role="listbox"
            aria-label="Search suggestions"
          >
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
                    <div className="h-3 w-10 animate-pulse rounded-full bg-sand/50" />
                  </div>
                ))}
              </div>
            )}

            {!loading && results.length > 0 && (
              <ul className="max-h-[420px] overflow-y-auto">
                {results.slice(0, 6).map((r) => (
                  <li key={r.id} role="option" aria-selected="false">
                    <button
                      onClick={() => handleSelect(r.slug)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-cream/60 cursor-pointer"
                    >
                      <span className="relative block h-[55px] w-10 shrink-0 overflow-hidden rounded shadow-sm ring-1 ring-sand/60">
                        {r.image ? (
                          <Image src={r.image} alt="" fill sizes="40px" className="object-cover" />
                        ) : (
                          <span className="block h-full w-full bg-gold-gradient" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-charcoal/80">
                          <HighlightText text={r.name} query={query.trim()} />
                        </span>
                        {r.author && (
                          <span className="block truncate text-xs text-charcoal/40 mt-0.5">
                            {r.author}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 flex flex-col items-end gap-0.5">
                        {r.on_sale && r.sale_price ? (
                          <>
                            <span className="rounded-full bg-cta px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white leading-none">
                              Sale
                            </span>
                            <span className="text-sm font-bold text-cta">{formatPrice(r.sale_price)}</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-gold-dark">{formatPrice(r.price)}</span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
                <li role="option" aria-selected="false" className="border-t border-sand/60">
                  <button
                    onClick={() => submit()}
                    className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gold-dark transition-colors hover:bg-cream/60"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    Search for &ldquo;<span className="font-bold">{query.trim()}</span>&rdquo;
                  </button>
                </li>
              </ul>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
