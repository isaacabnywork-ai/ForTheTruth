"use client";

import Link from "next/link";

interface StoreMaintenancePageProps {
  title?: string;
  message?: string;
  showSupportContacts?: boolean;
}

export function StoreMaintenancePage({
  title = "Our Online Bookstore is Undergoing Maintenance",
  message = "Our book catalog is temporarily synchronizing with our central inventory, or our server is undergoing scheduled system updates. The bookstore will be back online in just a few moments.",
  showSupportContacts = true,
}: StoreMaintenancePageProps) {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-[75vh] w-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-800 shadow-xs mb-6">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
          </span>
          <span>Catalog Maintenance in Progress</span>
        </div>

        {/* Central Graphic */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl border border-sand bg-white shadow-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cream text-gold-dark">
            <svg
              className="h-10 w-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="M6.5 2v20" />
              <path d="M10 8h6" />
              <path d="M10 12h4" />
            </svg>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-md text-xs font-black">
            ⚙
          </span>
        </div>

        {/* Headings */}
        <h1 className="font-display text-2xl font-black text-charcoal sm:text-4xl leading-tight">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-charcoal/70">
          {message}
        </p>

        {/* Direct Ordering & Assistance Card */}
        {showSupportContacts && (
          <div className="mt-8 rounded-2xl border border-sand bg-white/90 p-5 sm:p-6 text-left shadow-xs backdrop-blur-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand pb-4">
              <div>
                <h2 className="text-sm font-bold text-charcoal">
                  Need to place an order right away?
                </h2>
                <p className="text-xs text-charcoal/60 mt-0.5">
                  Our bookstore team is available directly via WhatsApp or phone call.
                </p>
              </div>
              <a
                href="https://wa.me/918604685533?text=Hi%20For%20The%20Truth%20Team,%20I%20would%20like%20to%20order%20books"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1EBE5D] transition-colors shrink-0"
              >
                <span>💬 Order on WhatsApp</span>
              </a>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 rounded-xl border border-sand/60 bg-cream/30 p-2.5">
                <span className="text-base">📞</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block">
                    Phone Support
                  </span>
                  <a
                    href="tel:+918604685533"
                    className="font-semibold text-charcoal hover:text-gold-dark"
                  >
                    +91 8604685533
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-sand/60 bg-cream/30 p-2.5">
                <span className="text-base">✉️</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block">
                    Email Desk
                  </span>
                  <a
                    href="mailto:contact@forthetruth.in"
                    className="font-semibold text-charcoal hover:text-gold-dark"
                  >
                    contact@forthetruth.in
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleReload}
            className="btn-gold !py-2.5 !px-6 text-xs uppercase tracking-wider font-bold shadow-md cursor-pointer flex items-center gap-2"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            <span>Refresh Catalog</span>
          </button>

          <Link
            href="/free-ebooks"
            className="rounded-full border border-sand bg-white px-5 py-2.5 text-xs font-bold text-charcoal shadow-xs hover:border-gold hover:text-gold-dark transition-colors"
          >
            Browse Free E-Books
          </Link>

          <Link
            href="/about"
            className="rounded-full border border-sand bg-white px-5 py-2.5 text-xs font-bold text-charcoal shadow-xs hover:border-gold hover:text-gold-dark transition-colors"
          >
            About Our Ministry
          </Link>
        </div>

        {/* Encouraging Scripture */}
        <p className="mt-10 font-serif italic text-xs text-charcoal/45">
          &ldquo;The grass withers, the flower fades, but the word of our God will stand forever.&rdquo; — Isaiah 40:8
        </p>

        {/* Church / AIPC POS Link for staff */}
        <div className="mt-4 text-[11px] text-charcoal/40">
          Bookstall coordinators &amp; event staff:{" "}
          <Link
            href="/admin/pos/aipc"
            className="underline hover:text-charcoal transition-colors font-medium"
          >
            Access AIPC POS Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}
