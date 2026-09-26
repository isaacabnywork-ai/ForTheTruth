import { Suspense } from "react";
import { getFreeEbooks } from "@/services/woocommerce";
import { FreeEbooksGrid } from "@/components/ebooks/FreeEbooksGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free E-Books — For The Truth",
  description:
    "Download free Christian e-books from For The Truth. Explore Bible studies, devotionals, and ministry resources — completely free of charge.",
};

export const revalidate = 3600;

async function EbooksContent() {
  const books = await getFreeEbooks().catch(() => []);
  return <FreeEbooksGrid books={books} />;
}

export default function FreeEbooksPage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy py-16 md:py-20">
        {/* Decorative gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-gold/20 px-4 py-1.5 text-sm font-bold text-gold-light">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            Completely Free • No Credit Card Needed
          </div>
          <h1 className="font-display text-4xl font-black text-white md:text-5xl">
            Free E-Books
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Download our collection of free Christian e-books. Read on any device — phone, tablet, or computer.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Instant PDF Download
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Unlimited Downloads
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Never Expires
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-3xl bg-sand/50" />
              ))}
            </div>
          }
        >
          <EbooksContent />
        </Suspense>
      </section>

      {/* Info strip */}
      <section className="border-t border-sand bg-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gold-dark" aria-hidden><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h3 className="font-display font-bold text-charcoal">Sign In to Download</h3>
              <p className="mt-1 text-sm text-charcoal/60">A free account is all you need. Sign in or register in seconds.</p>
            </div>
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gold-dark" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </div>
              <h3 className="font-display font-bold text-charcoal">Click &amp; Download</h3>
              <p className="mt-1 text-sm text-charcoal/60">Click "Get Free E-Book" and your PDF downloads instantly.</p>
            </div>
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gold-dark" aria-hidden><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
              <h3 className="font-display font-bold text-charcoal">Read Anywhere</h3>
              <p className="mt-1 text-sm text-charcoal/60">Open on your phone, tablet, laptop, or print it. Forever yours.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
