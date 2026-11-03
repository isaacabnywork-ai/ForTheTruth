"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/utils/currency";

interface BalanceResult {
  valid: boolean;
  maskedCode: string;
  balance: number;
  initialAmount: number;
  status: "active" | "redeemed" | "expired" | "disabled";
  expiryDate: string | null;
  designTitle: string;
  designImage: string;
  senderName?: string;
  recipientName?: string;
}

export default function CheckBalancePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BalanceResult | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/gift-cards/check-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gift card not found or invalid.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to check gift card balance. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-16 lg:py-24">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block rounded-full bg-[#C89B3C]/15 border border-[#C89B3C]/30 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#9C7524] mb-3">
            Inquiry Tool
          </span>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Check Gift Card Balance
          </h1>
          <p className="mt-3 text-sm text-slate-600 font-serif leading-relaxed">
            Enter your 16-character gift card code to view your available balance, expiry date, and status.
          </p>
        </div>

        {/* Card Form Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
          {!result ? (
            <form onSubmit={handleCheck} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Gift Card Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError("");
                    }}
                    placeholder="FTT-XXXX-XXXX-XXXX"
                    className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 font-mono text-base font-bold tracking-widest uppercase text-slate-900 placeholder:text-slate-400 focus:border-[#11426B] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#11426B]/10 transition-all text-center"
                    required
                  />
                </div>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  Located in your gift card delivery email or back of physical receipt
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-semibold text-red-600 text-center">
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full rounded-2xl bg-[#11426B] py-4 text-center font-bold text-white hover:bg-[#0c2f4d] shadow-lg shadow-[#11426B]/20 transition-all disabled:opacity-50"
              >
                {loading ? "Checking Balance…" : "Check Balance →"}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Status Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                    Card Reference
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {result.maskedCode}
                  </span>
                </div>
                <div>
                  {result.status === "active" && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      ● Active
                    </span>
                  )}
                  {result.status === "redeemed" && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      Fully Redeemed
                    </span>
                  )}
                  {result.status === "expired" && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      Expired
                    </span>
                  )}
                  {result.status === "disabled" && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                      Disabled
                    </span>
                  )}
                </div>
              </div>

              {/* Graphic Preview */}
              {result.designImage && (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
                  <Image
                    src={result.designImage}
                    alt={result.designTitle || "Gift Card"}
                    fill
                    className="object-contain p-1"
                  />
                </div>
              )}

              {/* Big Balance Box */}
              <div className="rounded-2xl bg-gradient-to-br from-[#11426B] to-[#0A2942] p-6 text-white text-center shadow-lg">
                <span className="text-xs uppercase tracking-widest text-[#F0C968] font-bold block mb-1">
                  Remaining Balance
                </span>
                <span className="font-display text-4xl sm:text-5xl font-extrabold text-white">
                  {formatPrice(result.balance)}
                </span>
                <span className="mt-2 block text-xs text-slate-300">
                  Initial Value: {formatPrice(result.initialAmount)}
                </span>
              </div>

              {/* Card Meta Details */}
              <div className="space-y-2.5 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Design:</span>
                  <span className="font-semibold text-slate-900">{result.designTitle}</span>
                </div>
                {result.recipientName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recipient:</span>
                    <span className="font-semibold text-slate-900">{result.recipientName}</span>
                  </div>
                )}
                {result.senderName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gifted By:</span>
                    <span className="font-semibold text-slate-900">{result.senderName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Validity:</span>
                  <span className="font-semibold text-slate-900">
                    {result.expiryDate
                      ? new Date(result.expiryDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "No Expiration Date"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {result.balance > 0 && result.status === "active" && (
                  <Link
                    href="/shop"
                    className="block w-full rounded-2xl bg-[#C89B3C] py-3.5 text-center font-bold text-navy hover:bg-[#d6a742] shadow-md transition-all text-sm"
                  >
                    Shop Christian Books Now →
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setCode("");
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-center text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Check Another Card
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer links */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Want to purchase a new gift card?{" "}
          <Link href="/gift-cards" className="font-bold text-[#11426B] hover:underline">
            Explore Gift Card Designs →
          </Link>
        </div>
      </div>
    </div>
  );
}
