"use client";

import React from "react";
import { formatPrice } from "@/utils/currency";

interface FreeDeliveryBarProps {
  subtotal: number;
}

export function FreeDeliveryBar({ subtotal }: FreeDeliveryBarProps) {
  const FREE_DELIVERY_THRESHOLD = 150;
  const isUnlocked = subtotal >= FREE_DELIVERY_THRESHOLD;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progressPercent = isUnlocked
    ? 100
    : Math.max(5, Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100)));

  return (
    <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isUnlocked ? (
            <div
              className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs"
              aria-hidden="true"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ) : (
            <div
              className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-xs"
              aria-hidden="true"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
          )}

          <div>
            <h3 className="font-extrabold text-xs sm:text-sm text-emerald-900 tracking-wider uppercase">
              {isUnlocked ? "FREE DELIVERY UNLOCKED!" : `ADD ${formatPrice(remaining)} MORE FOR FREE DELIVERY`}
            </h3>
            <p className="text-[11px] sm:text-xs text-emerald-700 font-medium">
              {isUnlocked
                ? "Your order qualifies for free delivery."
                : `Add books worth ${formatPrice(remaining)} more to get free shipping across India.`}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-emerald-600 font-black text-sm select-none" aria-hidden="true">
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3.5 h-2 w-full rounded-full bg-emerald-200/80 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-600 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Threshold markers */}
      <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-emerald-800/80">
        <span>₹0</span>
        <span className="font-bold uppercase tracking-wider text-emerald-800">
          {isUnlocked ? "✓ FREE SHIPPING UNLOCKED" : `${formatPrice(remaining)} TO FREE SHIPPING`}
        </span>
        <span>₹150+</span>
      </div>
    </div>
  );
}
