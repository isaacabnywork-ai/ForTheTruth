"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { DEFAULT_GIFT_CARD_DESIGNS } from "@/types/giftCard";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/utils/currency";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 10000;

export default function GiftCardsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCartStore();

  const [selectedDesignId, setSelectedDesignId] = useState<string>("classic-gift-card");
  const [amount, setAmount] = useState<number>(1000);
  const [customAmountStr, setCustomAmountStr] = useState<string>("");
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);

  // Form Fields
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [senderName, setSenderName] = useState<string>(
    user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.displayName || "" : ""
  );
  const [senderEmail, setSenderEmail] = useState<string>(user?.email || "");
  const [message, setMessage] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const selectedDesign = useMemo(() => {
    return (
      DEFAULT_GIFT_CARD_DESIGNS.find((d) => d.id === selectedDesignId) ||
      DEFAULT_GIFT_CARD_DESIGNS[0]
    );
  }, [selectedDesignId]);

  function handleSelectPreset(val: number) {
    setAmount(val);
    setIsCustomAmount(false);
    setCustomAmountStr("");
    setError("");
  }

  function handleCustomAmountChange(valStr: string) {
    setCustomAmountStr(valStr);
    setIsCustomAmount(true);
    const parsed = parseInt(valStr.replace(/\D/g, ""), 10);
    if (!isNaN(parsed)) {
      setAmount(parsed);
    } else {
      setAmount(0);
    }
    setError("");
  }

  function validateForm(): boolean {
    if (!amount || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      setError(`Gift card amount must be between ₹${MIN_AMOUNT} and ₹${MAX_AMOUNT.toLocaleString("en-IN")}.`);
      return false;
    }
    if (!recipientName.trim()) {
      setError("Please provide the recipient's name.");
      return false;
    }
    if (!recipientEmail.trim() || !recipientEmail.includes("@")) {
      setError("Please provide a valid recipient email address.");
      return false;
    }
    if (!senderName.trim()) {
      setError("Please provide your name as the sender.");
      return false;
    }
    if (!senderEmail.trim() || !senderEmail.includes("@")) {
      setError("Please provide your email address.");
      return false;
    }
    setError("");
    return true;
  }

  function handleAddToCart(andCheckout: boolean = false) {
    if (!validateForm()) return;

    // Unique virtual ID for this gift card item
    const virtualProductId = 99000000 + Math.floor(Math.random() * 999999);

    addToCart({
      productId: virtualProductId,
      name: `Digital Gift Card — ${selectedDesign.title}`,
      price: amount,
      image: selectedDesign.image,
      isVirtual: true,
      giftCardDetails: {
        designId: selectedDesign.id,
        designTitle: selectedDesign.title,
        designName: selectedDesign.title,
        designImage: selectedDesign.image,
        artworkUrl: selectedDesign.image,
        amount,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim().toLowerCase(),
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim().toLowerCase(),
        message: message.trim() || undefined,
      },
    }, 1);

    if (andCheckout) {
      router.push("/checkout");
    } else {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 4500);
    }
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#11426B] to-[#0A2942] py-20 text-white lg:py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C89B3C_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block rounded-full bg-[#C89B3C]/20 border border-[#C89B3C]/40 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#F0C968] mb-6">
            For The Truth Digital Gift Cards
          </span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white max-w-3xl mx-auto leading-tight">
            Give the Gift of Reading.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto font-serif leading-relaxed">
            Share the joy of discovering meaningful books. Surprise someone you love with a For The Truth digital gift card and let them choose books that inspire their faith journey.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#create-gift-card"
              className="rounded-full bg-[#C89B3C] px-8 py-3.5 text-sm font-bold text-navy hover:bg-[#d6a742] shadow-lg shadow-black/20 transition-all hover:scale-105 active:scale-95"
            >
              Explore Gift Cards ↓
            </a>
            <Link
              href="/gift-cards/check-balance"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 backdrop-blur-sm transition-all"
            >
              Check Existing Card Balance →
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-300/80 flex items-center justify-center gap-2">
            <span>⚡</span> Delivered instantly to their inbox upon checkout &bull; Redeemable on any book or Bible
          </p>
        </div>
      </section>

      {/* 2. Explore Gift Card Designs */}
      <section id="gift-card-designs" className="py-16 lg:py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C89B3C]">Illustrated Collection</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
            Choose Your Favorite Design
          </h2>
          <p className="mt-3 text-slate-600 text-sm md:text-base">
            Select one of our six custom-illustrated sticker designs tailored for holidays, birthdays, gratitude, and faith milestones.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DEFAULT_GIFT_CARD_DESIGNS.map((design) => {
            const isSelected = selectedDesignId === design.id;
            return (
              <div
                key={design.id}
                onClick={() => setSelectedDesignId(design.id)}
                className={`group relative flex flex-col justify-between rounded-3xl p-5 transition-all cursor-pointer bg-white border-2 ${
                  isSelected
                    ? "border-[#11426B] ring-4 ring-[#11426B]/15 shadow-xl scale-[1.02]"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#11426B] text-white shadow-md">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}

                {/* Card Artwork */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                  <Image
                    src={design.image}
                    alt={design.title}
                    fill
                    className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                <div className="mt-4 flex-1">
                  <h3 className="font-display text-lg font-bold text-slate-900 flex items-center justify-between">
                    {design.title}
                  </h3>
                  <p className="text-xs text-[#C89B3C] font-semibold mt-0.5">{design.subtitle}</p>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {design.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDesignId(design.id);
                  }}
                  className={`mt-4 w-full rounded-xl py-2.5 text-xs font-bold transition-colors ${
                    isSelected
                      ? "bg-[#11426B] text-white"
                      : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                  }`}
                >
                  {isSelected ? "✓ Selected Design" : "Select This Design"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Create Your Gift Card & Live Preview */}
      <section id="create-gift-card" className="py-16 bg-white border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C89B3C]">Customization</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
              Create Your Gift Card
            </h2>
            <p className="mt-2 text-slate-600 text-sm">
              Configure amount, recipient details, and personal message with a real-time live preview.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* Left: Configuration Form (7 cols) */}
            <div className="lg:col-span-7 space-y-8 bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border border-slate-200">
              
              {/* Step A: Amount Selector */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  1. Select Gift Card Amount
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectPreset(val)}
                      className={`rounded-2xl py-3 text-sm font-bold border-2 transition-all ${
                        !isCustomAmount && amount === val
                          ? "border-[#11426B] bg-[#11426B] text-white shadow-md scale-[1.02]"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      ₹{val.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Field */}
                <div className="mt-4">
                  <div className="relative rounded-2xl border border-slate-300 bg-white focus-within:border-[#11426B] focus-within:ring-2 focus-within:ring-[#11426B]/20 overflow-hidden">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 font-bold text-sm">
                      Custom ₹
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customAmountStr}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      placeholder="Enter custom amount (₹100 – ₹10,000)"
                      className="w-full py-3.5 pl-24 pr-4 text-sm font-medium text-slate-900 focus:outline-none"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Min ₹100 &bull; Max ₹10,000
                  </p>
                </div>
              </div>

              {/* Step B: Recipient Information */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  2. Recipient Information
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Recipient Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => {
                        setRecipientName(e.target.value);
                        setError("");
                      }}
                      placeholder="e.g. Samuel David"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#11426B] focus:outline-none focus:ring-2 focus:ring-[#11426B]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Recipient Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => {
                        setRecipientEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="samuel@example.com"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#11426B] focus:outline-none focus:ring-2 focus:ring-[#11426B]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Step C: Sender Information */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  3. Your Information (Sender)
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => {
                        setSenderName(e.target.value);
                        setError("");
                      }}
                      placeholder="e.g. Grace Thomas"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#11426B] focus:outline-none focus:ring-2 focus:ring-[#11426B]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => {
                        setSenderEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="grace@example.com"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#11426B] focus:outline-none focus:ring-2 focus:ring-[#11426B]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Step D: Personal Message */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-bold text-slate-900">
                    4. Personal Message <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <span className="text-xs text-slate-400">
                    {message.length} / 300
                  </span>
                </div>
                <textarea
                  value={message}
                  maxLength={300}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="May this gift bless you with wisdom, encouragement, and deeper faith as you read!"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#11426B] focus:outline-none focus:ring-2 focus:ring-[#11426B]/20"
                />
              </div>

              {/* Delivery Timing Indicator */}
              <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 flex items-start gap-3">
                <span className="text-xl">⚡</span>
                <div>
                  <h4 className="text-xs font-bold text-[#11426B] uppercase tracking-wide">
                    Instant Email Delivery
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    This digital gift card will be sent directly to <strong>{recipientEmail || "the recipient's email"}</strong> immediately after your payment is confirmed.
                  </p>
                </div>
              </div>

              {/* Errors & Buttons */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-semibold text-red-600">
                  ⚠ {error}
                </div>
              )}

              {addedSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                  <span>✓ Gift card added to your cart successfully!</span>
                  <Link href="/cart" className="underline font-bold">
                    View Cart
                  </Link>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  className="flex-1 rounded-2xl bg-[#11426B] py-4 text-center font-bold text-white hover:bg-[#0c2f4d] shadow-lg shadow-[#11426B]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Continue to Checkout →
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  className="rounded-2xl border-2 border-slate-300 bg-white px-6 py-4 font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Right: Live Interactive Card Preview (5 cols) */}
            <div className="lg:col-span-5 sticky top-28 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-[#FBF9F5] p-6 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#11426B] flex items-center gap-1.5">
                    <span>✨</span> Live Gift Card Preview
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {formatPrice(amount)}
                  </span>
                </div>

                {/* Card Graphic */}
                <div className="mt-5 relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
                  <Image
                    src={selectedDesign.image}
                    alt={selectedDesign.title}
                    fill
                    className="object-contain"
                    priority
                  />
                  {/* Digital Overlay Badge */}
                  <div className="absolute top-2.5 right-2.5 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white tracking-wider">
                    DIGITAL VOUCHER
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Design:</span>
                    <span className="font-bold text-slate-900">{selectedDesign.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-extrabold text-[#0F5132] text-sm">
                      {formatPrice(amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">To:</span>
                    <span className="font-semibold text-slate-900">
                      {recipientName || "(Recipient Name)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">From:</span>
                    <span className="font-semibold text-slate-900">
                      {senderName || "(Your Name)"}
                    </span>
                  </div>
                  {message && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-slate-400 block text-[11px] mb-1">Personal Message:</span>
                      <p className="italic text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                        &ldquo;{message}&rdquo;
                      </p>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Sample Code:</span>
                    <span className="font-mono font-bold text-slate-600 tracking-wider">
                      FTT-••••-••••-••••
                    </span>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works & FAQ Section */}
      <section className="py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C89B3C]">Simple &amp; Seamless</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
            How For The Truth Gift Cards Work
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-16">
          <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#11426B]/10 text-2xl text-[#11426B] font-bold mb-5">
              1
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
              Choose &amp; Personalise
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select one of our illustrated Christian designs, pick an amount from ₹100 to ₹10,000, and include a personal note.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C89B3C]/10 text-2xl text-[#C89B3C] font-bold mb-5">
              2
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
              Instant Email Delivery
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The recipient receives a beautifully styled email containing their unique code, your personal message, and redemption steps.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-800 font-bold mb-5">
              3
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
              Redeem on Any Book
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              They enter their code in the "Have a Gift Card?" section at checkout. Partial redemption is supported and remaining balance carries forward.
            </p>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h3 className="font-display text-2xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h3>

          <details className="group rounded-2xl bg-white p-5 border border-slate-200 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
            <summary className="flex justify-between items-center font-bold text-slate-900 text-sm">
              <span>Do For The Truth gift cards expire?</span>
              <span className="transition group-open:rotate-180 text-slate-400">▼</span>
            </summary>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
              Standard gift cards are valid for 1 full year (365 days) from the date of issue. The exact expiration date is always stated clearly in the recipient email and can be checked anytime via our balance checker.
            </p>
          </details>

          <details className="group rounded-2xl bg-white p-5 border border-slate-200 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
            <summary className="flex justify-between items-center font-bold text-slate-900 text-sm">
              <span>Can I use a gift card for partial payment?</span>
              <span className="transition group-open:rotate-180 text-slate-400">▼</span>
            </summary>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
              Yes, absolutely! If your cart total is less than your gift card value, the remaining balance stays on your card for future orders. If your cart total is more than your card value, you can pay the remaining amount via UPI, Cards, or Netbanking.
            </p>
          </details>

          <details className="group rounded-2xl bg-white p-5 border border-slate-200 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
            <summary className="flex justify-between items-center font-bold text-slate-900 text-sm">
              <span>How do I check my remaining balance?</span>
              <span className="transition group-open:rotate-180 text-slate-400">▼</span>
            </summary>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
              Visit our <Link href="/gift-cards/check-balance" className="text-[#11426B] font-bold underline">Check Gift Card Balance</Link> page, type in your code (e.g. FTT-XXXX-XXXX-XXXX), and see your remaining balance, expiry date, and status in real time.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
