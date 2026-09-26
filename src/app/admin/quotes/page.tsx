"use client";

import { useState } from "react";
import Link from "next/link";

interface ChurchQuote {
  id: string;
  churchName: string;
  pastorName: string;
  email: string;
  phone: string;
  requestedTitles: { title: string; quantity: number }[];
  tier: "10%" | "20%" | "30%";
  status: "pending" | "approved" | "completed";
  date: string;
  notes: string;
}

// Initialize as empty for production

export default function ChurchQuotesAdminPage() {
  const [quotes, setQuotes] = useState<ChurchQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<ChurchQuote | null>(null);

  const handleStatusChange = (id: string, nextStatus: "pending" | "approved" | "completed") => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: nextStatus } : q))
    );
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <h1 className="font-display text-3xl font-black text-navy tracking-tight">
            Church Bulk &amp; Curriculum Quotes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review inquiries submitted by churches, pastors, and theological institution partners.
          </p>
        </div>
        <Link
          href="/admin/pos"
          className="rounded-2xl bg-navy px-6 py-3 font-display text-xs font-black text-white shadow-lg shadow-navy/20 hover:bg-navy-light transition-all text-center"
        >
          Open POS Billing Terminal →
        </Link>
      </div>

      {/* Quotes Cards List */}
      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="text-sm font-semibold text-slate-500">No quotes submitted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quotes.map((quote) => {
          const statusBadges = {
            pending: "bg-amber-100 text-amber-800 border-amber-300",
            approved: "bg-sky-100 text-sky-800 border-sky-300",
            completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
          };

          return (
            <div
              key={quote.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <span className="font-mono text-xs font-black text-slate-400">{quote.id}</span>
                    <h3 className="font-display text-lg font-black text-navy">{quote.churchName}</h3>
                    <p className="text-xs font-semibold text-charcoal">{quote.pastorName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`rounded-full border px-3 py-0.5 text-xs font-black uppercase tracking-wider ${statusBadges[quote.status]}`}>
                      {quote.status}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">{quote.date}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
                    <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                      Requested Books &amp; Quantities:
                    </p>
                    <ul className="space-y-1.5 text-xs font-bold text-charcoal">
                      {quote.requestedTitles.map((t, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <span className="line-clamp-1 text-slate-700">📖 {t.title}</span>
                          <span className="shrink-0 rounded bg-white px-2 py-0.5 border border-slate-200 font-mono text-navy">
                            × {t.quantity} copies
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 border-t border-slate-200 pt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Recommended Church Tier:</span>
                      <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                        {quote.tier} Bulk Discount
                      </span>
                    </div>
                  </div>

                  <p className="text-xs italic text-slate-500 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    &ldquo;{quote.notes}&rdquo;
                  </p>
                  <div className="text-xs text-slate-400 font-semibold">
                    Contact: <span className="text-navy">{quote.email}</span> | <span className="text-navy">{quote.phone}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStatusChange(quote.id, "approved")}
                    disabled={quote.status === "approved"}
                    className="rounded-xl bg-sky-50 border border-sky-200 px-3.5 py-1.5 text-xs font-black text-sky-800 hover:bg-sky-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Approve Quote
                  </button>
                  <button
                    onClick={() => handleStatusChange(quote.id, "completed")}
                    disabled={quote.status === "completed"}
                    className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-black text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Mark Fulfilled
                  </button>
                </div>

                <Link
                  href="/admin/pos"
                  className="rounded-xl bg-cta px-4 py-2 font-display text-xs font-black text-white hover:bg-cta-dark shadow-xs transition-colors"
                >
                  Bill in POS Terminal →
                </Link>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
