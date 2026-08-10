"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

interface Props {
  books: Product[];
}

interface DownloadResult {
  download_url: string;
  download_name: string;
  product_name: string;
}

function EbookCard({ book }: { book: Product }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [downloads, setDownloads] = useState<DownloadResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const cover = book.images?.[0]?.src ?? "/placeholder-book.png";
  const author = book.attributes?.find(
    (a) => a.name.toLowerCase() === "author" || a.name.toLowerCase() === "by"
  )?.options?.[0] ?? "";

  const handleClaim = async () => {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/ebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: book.id, productName: book.name }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login?redirect=/free-ebooks";
          return;
        }
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setState("error");
        return;
      }

      if (data.downloads?.length > 0) {
        setDownloads(data.downloads);
        setState("done");
      } else {
        // Download link might take a moment to generate
        setErrorMsg("Your download is being prepared. Please refresh in a moment.");
        setState("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setState("error");
    }
  };

  return (
    <article className="group flex flex-col rounded-3xl border border-sand/60 bg-white shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Cover */}
      <div className="relative h-56 w-full bg-cream overflow-hidden">
        <Image
          src={cover}
          alt={book.name}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Free badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          FREE
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-tight text-charcoal line-clamp-2">
          {book.name}
        </h3>
        {author && (
          <p className="mt-1 text-sm text-charcoal/60">by {author}</p>
        )}
        {book.short_description && (
          <p
            className="mt-2 text-sm text-charcoal/70 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: book.short_description }}
          />
        )}

        <div className="mt-auto pt-4 space-y-2">
          {/* Error */}
          {state === "error" && (
            <p className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs font-semibold text-rose-700">
              {errorMsg}
            </p>
          )}

          {/* Download links */}
          {state === "done" && downloads.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-emerald-700">✓ Ready to download!</p>
              {downloads.map((d, i) => (
                <a
                  key={i}
                  href={d.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download PDF
                </a>
              ))}
            </div>
          )}

          {/* CTA */}
          {state !== "done" && (
            <button
              onClick={handleClaim}
              disabled={state === "loading"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-dark to-gold px-4 py-3 text-sm font-bold text-navy shadow-sm transition hover:brightness-110 active:scale-95 disabled:opacity-70"
            >
              {state === "loading" ? (
                <><span className="animate-spin">⏳</span> Preparing…</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Get Free E-Book
                </>
              )}
            </button>
          )}

          <Link
            href={`/products/${book.slug}`}
            className="block text-center text-xs text-charcoal/50 hover:text-gold-dark transition-colors"
          >
            View details →
          </Link>
        </div>
      </div>
    </article>
  );
}

export function FreeEbooksGrid({ books }: Props) {
  if (books.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-dark" aria-hidden>
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-charcoal">No Free E-Books Yet</h2>
        <p className="mt-2 text-charcoal/60">Check back soon — we're adding more titles regularly.</p>
        <Link href="/products" className="btn-gold mt-6 inline-flex">Browse All Books</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book) => (
        <EbookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
