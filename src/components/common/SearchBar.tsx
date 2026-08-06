"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/utils/currency";

interface Suggestion {
  id: number;
  name: string;
  slug: string;
  price: string;
  image: string | null;
  author: string | null;
  rating: string;
  ratingCount: number;
}

const RECENT_KEY = "ftt-recent-searches";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"));
    } catch {
      /* ignore */
    }
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function remember(term: string) {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    remember(q);
    setOpen(false);
    router.push(`/products/search?q=${encodeURIComponent(q)}`);
  }

  const showPanel = open && (results.length > 0 || recent.length > 0 || loading);

  return (
    <div ref={boxRef} className="relative">
      <form onSubmit={submit} role="search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search titles, authors, or topics…"
          aria-label="Search books"
          aria-expanded={showPanel}
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

      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-sand bg-white shadow-panel">
          {query.trim().length < 2 && recent.length > 0 && (
            <div className="p-3">
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-charcoal/35">
                Recent searches
              </p>
              {recent.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setQuery(r);
                    router.push(`/products/search?q=${encodeURIComponent(r)}`);
                    setOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-charcoal/70 transition-smooth hover:bg-cream hover:text-gold-dark"
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {loading && query.trim().length >= 2 && (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-lg" />
              ))}
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="max-h-[380px] overflow-y-auto p-2">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => {
                      remember(query.trim());
                      setOpen(false);
                      router.push(`/products/${r.slug}`);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-smooth hover:bg-cream"
                  >
                    <span className="relative block h-14 w-10 shrink-0 overflow-hidden rounded shadow-sm">
                      {r.image ? (
                        <Image src={r.image} alt="" fill sizes="40px" className="object-cover" />
                      ) : (
                        <span className="block h-full w-full bg-gold-gradient" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-charcoal">
                        {r.name}
                      </span>
                      {r.author && (
                        <span className="block truncate text-xs text-charcoal/45">
                          {r.author}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-sm font-bold text-gold-dark">
                      {formatPrice(r.price)}
                    </span>
                  </button>
                </li>
              ))}
              <li className="border-t border-sand">
                <button
                  onClick={submit}
                  className="block w-full px-3 py-3 text-center text-xs font-bold uppercase tracking-widest text-gold-dark transition-smooth hover:bg-cream"
                >
                  See all results for “{query.trim()}”
                </button>
              </li>
            </ul>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="p-5 text-center text-sm text-charcoal/50">
              No matches — try an author name or broader topic.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
