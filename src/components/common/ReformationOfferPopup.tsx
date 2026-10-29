"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { REWARD_TIERS } from "@/utils/rewards";

export function ReformationOfferPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);

    // Don't show in admin area
    if (pathname?.startsWith("/admin")) return;

    // Check if user already dismissed in this session
    try {
      const dismissed = sessionStorage.getItem("ftt_reformation_popup_dismissed");
      if (dismissed === "true") return;
    } catch {
      // ignore storage errors
    }

    // Gentle delay after page loads so user sees the website first
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 700);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function handleClose() {
    setIsOpen(false);
    try {
      sessionStorage.setItem("ftt_reformation_popup_dismissed", "true");
    } catch {
      // ignore storage errors
    }
  }

  if (!isMounted || !isOpen || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-popup-title"
    >
      {/* Background blur overlay */}
      <div
        className="fixed inset-0 bg-navy/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Popup card in middle of screen */}
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-2xl sm:rounded-3xl border border-sand/80 bg-white shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 z-10 my-auto">
        {/* Accent top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gold-dark via-gold to-cta" />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close offer popup"
          className="absolute right-3.5 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-charcoal/60 transition-colors hover:bg-cream hover:text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="p-5 sm:p-7">
          {/* Badge */}
          <div className="flex justify-center mb-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gold-deep border border-gold/30">
              <span aria-hidden="true">🎁</span> Reformation Week Special
            </span>
          </div>

          {/* Title & Subtitle */}
          <h2
            id="promo-popup-title"
            className="font-display text-2xl sm:text-[28px] font-black tracking-tight text-navy text-center leading-tight"
          >
            Reformation Week Offer
          </h2>
          <p className="mt-1 text-center text-xs sm:text-[13px] font-medium text-charcoal/70">
            More you spend, more free books you receive!
          </p>

          {/* Book Covers Showcase */}
          <div className="my-4 rounded-xl bg-gradient-to-b from-cream/70 to-cream/20 p-3 sm:p-3.5 border border-sand/70">
            <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 text-center mb-2.5">
              Available Free Reward Books
            </p>
            <div className="flex items-end justify-center gap-2 sm:gap-3">
              {REWARD_TIERS.map((tier) => (
                <div
                  key={tier.threshold}
                  className="group/book relative flex flex-col items-center"
                  title={tier.title}
                >
                  <div className="relative h-20 w-14 sm:h-24 sm:w-[68px] overflow-hidden rounded-[2px] shadow-book border border-black/10 bg-white transition-transform duration-300 hover:-translate-y-1">
                    <img
                      src={tier.image}
                      alt={tier.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-r from-black/25 to-transparent" />
                  </div>
                  <span className="mt-1.5 text-[9px] sm:text-[10px] font-bold text-navy tracking-tight">
                    ₹{tier.threshold.toLocaleString("en-IN")}+
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tier Breakdown Tiles */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-sand/80 bg-[#FAF8F5] p-2 sm:p-2.5">
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                1
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] uppercase font-semibold tracking-wider text-charcoal/60">
                  Above ₹700
                </p>
                <p className="text-xs font-bold text-navy truncate">1 Free Book</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-sand/80 bg-[#FAF8F5] p-2 sm:p-2.5">
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                2
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] uppercase font-semibold tracking-wider text-charcoal/60">
                  Above ₹1,000
                </p>
                <p className="text-xs font-bold text-navy truncate">2 Free Books</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-sand/80 bg-[#FAF8F5] p-2 sm:p-2.5">
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                3
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] uppercase font-semibold tracking-wider text-charcoal/60">
                  Above ₹1,400
                </p>
                <p className="text-xs font-bold text-navy truncate">3 Free Books</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 p-2 sm:p-2.5">
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-white text-xs font-black shadow-xs">
                4
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] uppercase font-semibold tracking-wider text-gold-deep">
                  Above ₹2,000
                </p>
                <p className="text-xs font-bold text-gold-deep truncate">All 4 Free Books</p>
              </div>
            </div>
          </div>

          {/* Accumulation Note */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] sm:text-[11px] font-semibold text-charcoal/75">
            <span className="text-gold-dark font-black">★</span>
            <span>Books accumulate! Each level includes previous tier books.</span>
          </div>

          {/* CTA & Dismiss Buttons */}
          <div className="mt-4 sm:mt-5 space-y-2">
            <Link
              href="/products"
              onClick={handleClose}
              className="btn-cta w-full flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow-cta text-white transition-all hover:bg-cta-light"
            >
              Shop Now &amp; Claim Books <span aria-hidden="true">→</span>
            </Link>

            <button
              type="button"
              onClick={handleClose}
              className="w-full text-center text-[11px] font-medium text-charcoal/50 hover:text-charcoal transition-colors py-1"
            >
              No thanks, continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
