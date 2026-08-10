"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AccountShell } from "@/components/account/AccountShell";

interface DownloadItem {
  download_id: string;
  download_url: string;
  product_id: number;
  product_name: string;
  download_name: string;
  order_id: number;
  downloads_remaining: string;
  access_expires: string | null;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[] | null>(null);

  useEffect(() => {
    fetch("/api/ebooks")
      .then((r) => r.ok ? r.json() : { downloads: [] })
      .then((d) => setDownloads(d.downloads ?? []))
      .catch(() => setDownloads([]));
  }, []);

  return (
    <AccountShell title="My Downloads">
      <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-card">
        {downloads === null ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : downloads.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-dark" aria-hidden>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <p className="font-display text-xl font-bold text-charcoal">No downloads yet</p>
            <p className="mt-2 text-sm text-charcoal/60">
              Head to our Free E-Books page and download your first book — it&apos;s completely free!
            </p>
            <Link href="/free-ebooks" className="btn-gold mt-6 inline-flex">
              Browse Free E-Books
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-sand/70">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider text-charcoal/40 border-b border-sand/60 bg-cream/50">
              <span>Product</span>
              <span className="hidden sm:block">Order</span>
              <span className="hidden sm:block">Downloads</span>
              <span>Action</span>
            </div>
            {downloads.map((item) => (
              <div
                key={item.download_id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-cream/40 sm:grid-cols-[1fr_auto_auto_auto]"
              >
                {/* Product name */}
                <div>
                  <p className="font-semibold text-charcoal">{item.product_name}</p>
                  <p className="text-xs text-charcoal/50">
                    {item.download_name !== item.product_name ? item.download_name : "PDF E-Book"}
                  </p>
                  {item.access_expires && (
                    <p className="mt-0.5 text-xs text-charcoal/40">
                      Expires: {new Date(item.access_expires).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>

                {/* Order ID */}
                <div className="hidden sm:block">
                  <Link
                    href={`/account/orders/${item.order_id}`}
                    className="text-sm font-semibold text-gold-dark hover:underline"
                  >
                    #{item.order_id}
                  </Link>
                </div>

                {/* Downloads remaining */}
                <div className="hidden sm:block text-sm text-charcoal/60">
                  {item.downloads_remaining === "unlimited" || item.downloads_remaining === ""
                    ? "∞ unlimited"
                    : `${item.downloads_remaining} left`}
                </div>

                {/* Download button */}
                <a
                  href={item.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-dark to-gold px-4 py-2.5 text-sm font-bold text-navy shadow-sm transition hover:brightness-110 active:scale-95 whitespace-nowrap"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link to get more */}
      {downloads && downloads.length > 0 && (
        <div className="mt-6 rounded-2xl border border-sand/60 bg-white p-5 text-center shadow-card">
          <p className="text-sm text-charcoal/60">Want more free e-books?</p>
          <Link href="/free-ebooks" className="btn-gold mt-3 inline-flex text-sm">
            Browse All Free E-Books →
          </Link>
        </div>
      )}
    </AccountShell>
  );
}
