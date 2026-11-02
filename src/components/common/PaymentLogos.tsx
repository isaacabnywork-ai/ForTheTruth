import React from "react";

export function UpiBadge() {
  return (
    <div
      className="flex h-6 sm:h-[26px] items-center justify-center rounded-[4px] bg-white px-2 shadow-xs border border-white/15 select-none"
      title="UPI - Unified Payments Interface"
    >
      <div className="flex items-center gap-1">
        {/* UPI Dual Arrows */}
        <svg viewBox="0 0 16 14" className="h-3 w-auto" fill="none" aria-hidden="true">
          <path d="M0 0L7 7L0 14H4L11 7L4 0H0Z" fill="#097939" />
          <path d="M5 0L12 7L5 14H9L16 7L9 0H5Z" fill="#ED7524" />
        </svg>
        <span className="font-sans text-[10px] sm:text-[11px] font-black tracking-tight text-[#231F20]">
          UPI
        </span>
      </div>
    </div>
  );
}

export function VisaBadge() {
  return (
    <div
      className="flex h-6 sm:h-[26px] w-[38px] sm:w-[42px] items-center justify-center rounded-[4px] bg-[#1434CB] px-1.5 shadow-xs select-none"
      title="Visa"
    >
      <span className="font-sans text-[11px] sm:text-xs font-black italic tracking-wider text-white leading-none">
        VISA
      </span>
    </div>
  );
}

export function MastercardBadge() {
  return (
    <div
      className="flex h-6 sm:h-[26px] w-[38px] sm:w-[42px] items-center justify-center rounded-[4px] bg-[#1E1E1E] px-1 shadow-xs border border-white/10 select-none"
      title="Mastercard"
    >
      <svg viewBox="0 0 34 22" className="h-3.5 sm:h-4 w-auto" fill="none" aria-hidden="true">
        <circle cx="12" cy="11" r="8" fill="#EB001B" />
        <circle cx="22" cy="11" r="8" fill="#F79E1B" fillOpacity="0.88" />
      </svg>
    </div>
  );
}

export function RupayBadge() {
  return (
    <div
      className="flex h-6 sm:h-[26px] items-center justify-center rounded-[4px] bg-white px-1.5 sm:px-2 shadow-xs border border-white/15 select-none"
      title="RuPay"
    >
      <div className="flex items-center gap-0.5">
        <span className="font-sans text-[10px] sm:text-[11px] font-black italic tracking-tight text-[#0054A6] leading-none">
          Ru
        </span>
        <span className="font-sans text-[10px] sm:text-[11px] font-black italic tracking-tight text-[#F37021] leading-none">
          Pay
        </span>
        <svg viewBox="0 0 10 12" className="h-2.5 w-auto ml-0.5" fill="none" aria-hidden="true">
          <path d="M0 0L5 6L0 12H4L9 6L4 0H0Z" fill="#097E52" />
          <path d="M4 0L9 6L4 12H7L12 6L7 0H4Z" fill="#F37021" />
        </svg>
      </div>
    </div>
  );
}

export function NetbankingBadge() {
  return (
    <div
      className="flex h-6 sm:h-[26px] items-center justify-center gap-1 rounded-[4px] bg-white px-2 shadow-xs border border-white/15 select-none"
      title="NetBanking"
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-[#0054A6]" fill="currentColor" aria-hidden="true">
        <path d="M10 2L2 6v2h16V6l-8-4zm-6 7v6h2V9H4zm5 0v6h2V9H9zm5 0v6h2V9h-2zM2 17v2h16v-2H2z" />
      </svg>
      <span className="font-sans text-[9px] sm:text-[10px] font-extrabold uppercase tracking-tight text-[#0054A6] leading-none">
        NetBanking
      </span>
    </div>
  );
}

export function PaymentLogosStrip() {
  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" aria-label="Accepted Payment Methods">
      <UpiBadge />
      <VisaBadge />
      <MastercardBadge />
      <RupayBadge />
      <NetbankingBadge />
    </div>
  );
}
