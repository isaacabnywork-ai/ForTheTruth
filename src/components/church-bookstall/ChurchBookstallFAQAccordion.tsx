"use client";

import React, { useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

export function ChurchBookstallFAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-3">
      {items.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "border-[#C89B3C]/50 bg-white shadow-md ring-1 ring-[#C89B3C]/20"
                : "border-sand bg-[#FAF8F5] hover:bg-white hover:border-sand/80 shadow-sm"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left focus:outline-none cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="font-display font-bold text-navy text-base sm:text-lg">
                {faq.q}
              </span>
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-transform duration-200 ${
                  isOpen
                    ? "bg-[#11426B] text-white rotate-180"
                    : "bg-cream text-charcoal/70"
                }`}
              >
                ▼
              </span>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-sm text-charcoal/75 leading-relaxed border-t border-sand/40">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
