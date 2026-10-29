import Image from "next/image";

export function SingleBookPaymentTrust() {
  return (
    <div className="mt-8 space-y-3.5">
      {/* 1. Guaranteed Safe Checkout Box */}
      <div className="relative rounded-xl border border-dashed border-charcoal/25 bg-white/40 pt-5 pb-4 px-4 text-center">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cream px-3 font-semibold text-xs sm:text-sm text-charcoal tracking-normal">
          Guaranteed Safe Checkout
        </span>

        <div className="flex items-center justify-center gap-3 sm:gap-4 pt-1">
          {/* Mastercard */}
          <div
            className="flex h-8.5 w-14 sm:h-9.5 sm:w-15 items-center justify-center rounded-md border border-slate-200 bg-white p-1 shadow-xs"
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
            className="flex h-8.5 w-14 sm:h-9.5 sm:w-15 items-center justify-center rounded-md bg-[#1434CB] p-1 shadow-xs"
            title="Visa"
          >
            <span className="font-sans text-[11px] sm:text-xs font-black italic tracking-wider text-white">
              VISA
            </span>
          </div>

          {/* Amex */}
          <div
            className="flex h-8.5 w-14 sm:h-9.5 sm:w-15 items-center justify-center rounded-md bg-[#007BC1] p-1 shadow-xs"
            title="American Express"
          >
            <span className="font-sans text-[10px] sm:text-[11px] font-black tracking-tight text-white">
              AMEX
            </span>
          </div>

          {/* Discover */}
          <div
            className="flex h-8.5 w-14 sm:h-9.5 sm:w-15 items-center justify-center rounded-md bg-[#231F20] p-1 shadow-xs relative overflow-hidden"
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

      {/* 2. Secured by Razorpay */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-charcoal/65">
        <span className="text-xs sm:text-[13px] text-charcoal/60 font-medium">Secured by</span>
        <Image
          src="/images/razorpay-logo.png"
          alt="Razorpay"
          width={96}
          height={20}
          className="h-4 sm:h-[18px] w-auto object-contain inline-block"
        />
      </div>
    </div>
  );
}
