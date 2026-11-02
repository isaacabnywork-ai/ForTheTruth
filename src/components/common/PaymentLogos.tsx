import React from "react";

export function UpiBadge() {
  return (
    <div
      className="flex h-6 sm:h-7 items-center justify-center rounded-[4px] bg-white px-2 sm:px-2.5 shadow-xs border border-white/10 select-none shrink-0"
      title="UPI - Unified Payments Interface"
    >
      <img
        src="https://admin.forthetruth.in/wp-content/uploads/2026/11/UPI-Logo-vector.svg"
        alt="UPI"
        width={131}
        height={46}
        className="h-3.5 sm:h-4 w-auto object-contain"
        loading="lazy"
      />
    </div>
  );
}

export function VisaBadge() {
  return (
    <div
      className="flex h-6 sm:h-7 items-center justify-center rounded-[4px] bg-white px-2 sm:px-2.5 shadow-xs border border-white/10 select-none shrink-0"
      title="Visa"
    >
      <img
        src="https://admin.forthetruth.in/wp-content/uploads/2026/11/Visa_Inc._logo_2021%E2%80%93present.svg"
        alt="Visa"
        width={1000}
        height={325}
        className="h-2.5 sm:h-3 w-auto object-contain"
        loading="lazy"
      />
    </div>
  );
}

export function MastercardBadge() {
  return (
    <div
      className="flex h-6 sm:h-7 items-center justify-center rounded-[4px] bg-white px-2 sm:px-2.5 shadow-xs border border-white/10 select-none shrink-0"
      title="Mastercard"
    >
      <img
        src="https://admin.forthetruth.in/wp-content/uploads/2026/11/Mastercard-logo.svg"
        alt="Mastercard"
        width={1000}
        height={776}
        className="h-4 sm:h-[18px] w-auto object-contain"
        loading="lazy"
      />
    </div>
  );
}

export function RupayBadge() {
  return (
    <div
      className="flex h-6 sm:h-7 items-center justify-center rounded-[4px] bg-white px-2 sm:px-2.5 shadow-xs border border-white/10 select-none shrink-0"
      title="RuPay"
    >
      <img
        src="https://admin.forthetruth.in/wp-content/uploads/2026/11/RuPay.svg"
        alt="RuPay"
        width={72}
        height={19}
        className="h-3 sm:h-3.5 w-auto object-contain"
        loading="lazy"
      />
    </div>
  );
}

export function PaymentLogosStrip() {
  return (
    <div
      className="flex flex-wrap items-center gap-1.5 sm:gap-2"
      aria-label="Accepted Payment Methods"
    >
      <UpiBadge />
      <VisaBadge />
      <MastercardBadge />
      <RupayBadge />
    </div>
  );
}
