"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice } from "@/utils/currency";

interface SingleBookPaymentTrustProps {
  product: Product;
  inStock: boolean;
}

export function SingleBookPaymentTrust({ product, inStock }: SingleBookPaymentTrustProps) {
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [showPayLaterModal, setShowPayLaterModal] = useState(false);

  const numericPrice = parseFloat(product.price) || 0;
  const emiAmount = numericPrice > 0 ? Math.max(42, Math.round(numericPrice / 12)) : 42;

  const sku = product.sku
    ? product.sku.toUpperCase()
    : product.id
    ? `FTT-${product.id}`
    : "";

  const categories = product.categories || [];
  const tags = product.tags || [];

  return (
    <div className="mt-6 border-t border-sand/70 pt-5">
      {/* 1. Stock Status */}
      <div className="text-sm font-medium text-charcoal/85">
        {inStock ? "In stock" : "Out of stock"}
      </div>

      {/* 2. EMI & Pay Later Cards */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* EMI Card */}
        <div className="rounded-xl border border-[#c3daf8] bg-[#f9fbff] p-3.5 flex flex-col justify-between shadow-xs transition-colors hover:border-[#a8cbfa]">
          <p className="text-[13px] font-bold text-charcoal">
            EMI from ₹{emiAmount}/month
          </p>
          <div className="flex items-center justify-between mt-3 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#15803d] text-white text-[10px] font-black shadow-xs">
                ✕
              </span>
              <span className="text-[11px] font-medium text-charcoal/60">&amp; more</span>
            </div>
            <button
              type="button"
              onClick={() => setShowEmiModal(true)}
              className="text-xs font-bold text-[#1d63d8] hover:text-[#14479e] hover:underline cursor-pointer"
            >
              View plans
            </button>
          </div>
        </div>

        {/* Pay Later Card */}
        <div className="rounded-xl border border-[#c3daf8] bg-[#f9fbff] p-3.5 flex flex-col justify-between shadow-xs transition-colors hover:border-[#a8cbfa]">
          <p className="text-[13px] font-bold text-charcoal">
            Pay later available
          </p>
          <div className="flex items-center justify-between mt-3 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-gradient-to-tr from-[#dc2626] to-[#0284c7] text-white text-[9px] font-black shadow-xs">
                ▶
              </span>
              <span className="text-[11px] font-medium text-charcoal/60">&amp; more</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPayLaterModal(true)}
              className="text-xs font-bold text-[#1d63d8] hover:text-[#14479e] hover:underline cursor-pointer"
            >
              View options
            </button>
          </div>
        </div>
      </div>

      {/* 3. Secured by Razorpay */}
      <div className="mt-2.5 flex items-center gap-1.5 text-xs text-charcoal/65">
        <span className="text-[11px] text-charcoal/55 font-medium">Secured by</span>
        <img
          src="/images/razorpay-logo.png"
          alt="Razorpay"
          className="h-[18px] w-auto max-w-[90px] object-contain inline-block"
        />
      </div>

      {/* 4. Horizontal Divider */}
      <hr className="my-6 border-t border-sand/80" />

      {/* 5. Metadata: SKU, Categories, Tags */}
      <div className="space-y-2.5 text-xs leading-relaxed">
        {sku && (
          <div className="flex items-baseline gap-2">
            <span className="font-bold uppercase tracking-wider text-charcoal shrink-0">
              SKU:
            </span>
            <span className="uppercase text-charcoal/75 tracking-wide font-medium">
              {sku}
            </span>
          </div>
        )}

        {categories.length > 0 && (
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-bold uppercase tracking-wider text-charcoal shrink-0">
              CATEGORIES:
            </span>
            <span className="uppercase text-charcoal/75 tracking-wide font-medium">
              {categories.map((c, i) => (
                <span key={c.id || c.slug}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="hover:text-gold-dark hover:underline transition-colors"
                  >
                    {c.name.toUpperCase()}
                  </Link>
                  {i < categories.length - 1 && ", "}
                </span>
              ))}
            </span>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-bold uppercase tracking-wider text-charcoal shrink-0">
              {tags.length === 1 ? "TAG:" : "TAGS:"}
            </span>
            <span className="uppercase text-charcoal/75 tracking-wide font-medium">
              {tags.map((t, i) => (
                <span key={t.id || t.slug}>
                  <Link
                    href={`/products?q=${encodeURIComponent(t.name)}`}
                    className="hover:text-gold-dark hover:underline transition-colors"
                  >
                    {t.name.toUpperCase()}
                  </Link>
                  {i < tags.length - 1 && ", "}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>

      {/* 6. Guaranteed Safe Checkout Box */}
      <div className="relative mt-8 rounded-xl border border-dashed border-charcoal/25 bg-white/40 pt-5 pb-4 px-4 text-center">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-offwhite px-3 font-semibold text-xs sm:text-sm text-charcoal">
          Guaranteed Safe Checkout
        </span>

        <div className="flex items-center justify-center gap-3 sm:gap-4 pt-1">
          {/* Mastercard */}
          <div
            className="flex h-8 w-13 sm:h-9 sm:w-14 items-center justify-center rounded-md border border-sand bg-white p-1 shadow-xs"
            title="Mastercard"
          >
            <svg viewBox="0 0 38 24" className="h-6 w-auto" fill="none">
              <rect width="38" height="24" rx="3" fill="#ffffff" />
              <circle cx="15" cy="12" r="7" fill="#EB001B" />
              <circle cx="23" cy="12" r="7" fill="#F79E1B" fillOpacity="0.85" />
            </svg>
          </div>

          {/* Visa */}
          <div
            className="flex h-8 w-13 sm:h-9 sm:w-14 items-center justify-center rounded-md bg-[#1434CB] p-1 shadow-xs"
            title="Visa"
          >
            <span className="font-display text-[11px] sm:text-xs font-black italic tracking-widest text-white">
              VISA
            </span>
          </div>

          {/* Amex */}
          <div
            className="flex h-8 w-13 sm:h-9 sm:w-14 items-center justify-center rounded-md bg-[#007BC1] p-1 shadow-xs"
            title="American Express"
          >
            <span className="font-display text-[10px] sm:text-[11px] font-black tracking-tight text-white">
              AMEX
            </span>
          </div>

          {/* Discover */}
          <div
            className="flex h-8 w-13 sm:h-9 sm:w-14 items-center justify-center rounded-md bg-[#231F20] p-1 shadow-xs relative overflow-hidden"
            title="Discover"
          >
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] sm:text-[10px] font-black tracking-tight text-white">
                DISC
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#f47b20] inline-block -mx-0.5" />
              <span className="text-[9px] sm:text-[10px] font-black tracking-tight text-white">
                VER
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* EMI Plans Modal */}
      {showEmiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-sand bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <h3 className="font-display text-base font-bold text-charcoal">
                Available EMI Plans
              </h3>
              <button
                type="button"
                onClick={() => setShowEmiModal(false)}
                className="rounded-lg p-1.5 text-charcoal/50 hover:bg-cream hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-charcoal/80">
              <p className="text-charcoal/60">
                Choose flexible EMI installments at Razorpay checkout:
              </p>
              <div className="divide-y divide-sand/60 rounded-xl border border-sand bg-cream/30">
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="font-semibold text-charcoal">3 Months</span>
                  <span className="font-bold text-gold-dark">
                    {formatPrice(Math.round(numericPrice / 3 || 100))}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="font-semibold text-charcoal">6 Months</span>
                  <span className="font-bold text-gold-dark">
                    {formatPrice(Math.round(numericPrice / 6 || 50))}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="font-semibold text-charcoal">9 Months</span>
                  <span className="font-bold text-gold-dark">
                    {formatPrice(Math.round(numericPrice / 9 || 35))}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="font-semibold text-charcoal">12 Months</span>
                  <span className="font-bold text-gold-dark">
                    {formatPrice(Math.round(numericPrice / 12 || 25))}/mo
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-charcoal/50 pt-1">
                Supported banks: HDFC, ICICI, SBI, Axis, Kotak &amp; Cardless EMI partners via Razorpay.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowEmiModal(false)}
              className="btn-cta mt-5 w-full !py-2.5 text-xs uppercase tracking-wider"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Pay Later Modal */}
      {showPayLaterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-sand bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <h3 className="font-display text-base font-bold text-charcoal">
                Pay Later Options
              </h3>
              <button
                type="button"
                onClick={() => setShowPayLaterModal(false)}
                className="rounded-lg p-1.5 text-charcoal/50 hover:bg-cream hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-charcoal/80">
              <p className="text-charcoal/60">
                Order your books now and pay later with zero interest for 15–30 days:
              </p>
              <div className="space-y-2">
                <div className="rounded-xl border border-sand bg-cream/30 p-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-charcoal">LazyPay</span>
                    <p className="text-[11px] text-charcoal/55">Pay next month in one bill</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="rounded-xl border border-sand bg-cream/30 p-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-charcoal">Simpl</span>
                    <p className="text-[11px] text-charcoal/55">1-tap checkout, 15-day cycle</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="rounded-xl border border-sand bg-cream/30 p-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-charcoal">ICICI &amp; HDFC PayLater</span>
                    <p className="text-[11px] text-charcoal/55">Instant credit for account holders</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPayLaterModal(false)}
              className="btn-cta mt-5 w-full !py-2.5 text-xs uppercase tracking-wider"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
