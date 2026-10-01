"use client";

import { useState } from "react";
import type { PosCartItem, PosCustomerDetails } from "./PosCartTerminal";
import { ReceiptPrinter } from "./ReceiptPrinter";
import { formatPrice } from "@/utils/currency";
import type { WCOrder } from "@/services/woocommerce";

interface PaymentModalProps {
  items: PosCartItem[];
  discountAmount: number;
  totalAmount: number;
  customer: PosCustomerDetails;
  onClose: () => void;
  onSuccessReset: () => void;
  submitApiUrl?: string;
  exchangeCredit?: { originalOrderId: number; amount: number } | null;
}

type PayMode = "Cash" | "UPI" | "Card";

export function PaymentModal({
  items,
  discountAmount,
  totalAmount,
  customer,
  onClose,
  onSuccessReset,
  submitApiUrl = "/api/admin/pos-order",
  exchangeCredit,
}: PaymentModalProps) {
  const [mode, setMode] = useState<PayMode>("Cash");
  
  const creditAmt = exchangeCredit?.amount || 0;
  const netDueFromCustomer = Math.max(0, totalAmount - creditAmt);
  const refundDueToCustomer = Math.max(0, creditAmt - totalAmount);

  const [cashTendered, setCashTendered] = useState(netDueFromCustomer > 0 ? netDueFromCustomer : 0);
  const [cardRef, setCardRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [completedOrder, setCompletedOrder] = useState<WCOrder | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [razorpayStatus, setRazorpayStatus] = useState<"idle" | "loading" | "paid" | "failed">("idle");

  // Cash change calculation
  const changeReturned = Math.max(0, cashTendered - netDueFromCustomer) + refundDueToCustomer;

  const handleQuickCash = (amt: number) => {
    setCashTendered(amt);
  };

  const handleRazorpayPayment = async () => {
    setRazorpayStatus("loading");
    setErrorMsg("");
    try {
      // Step 1: Create a Razorpay order on server
      const orderRes = await fetch("/api/admin/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: netDueFromCustomer }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create payment order");

      // Step 2: Open Razorpay checkout popup
      const rzpKeyId = orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
      if (!rzpKeyId) {
        throw new Error("Razorpay Key ID is missing. Please verify server environment configuration.");
      }
      const options = {
        key: rzpKeyId,
        amount: orderData.amount,
        currency: "INR",
        name: "For The Truth Bookstore",
        description: `POS Sale — ${items.length} title(s)`,
        order_id: orderData.orderId,
        prefill: {
          name: customer.name || "Walk-in Customer",
          contact: customer.phone || "",
          email: customer.email || "pos@forthetruth.in",
        },
        theme: { color: "#10324F" },
        handler: async (response: any) => {
          // Payment succeeded — proceed to record the order
          setRazorpayStatus("paid");
          await handleCompleteTransaction(`Razorpay ID: ${response.razorpay_payment_id}`);
        },
        modal: {
          ondismiss: () => {
            setRazorpayStatus("idle");
          },
        },
      };

      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
          document.body.appendChild(script);
        });
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setRazorpayStatus("idle");
    } catch (err: unknown) {
      setRazorpayStatus("failed");
      setErrorMsg((err as Error).message || "Razorpay payment failed.");
    }
  };

  const handleCompleteTransaction = async (extraNote = "") => {
    setLoading(true);
    setErrorMsg("");
    try {
      const payload = {
        paymentMethod: mode,
        lineItems: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          total: String(i.price * i.quantity),
        })),
        totalAmount,
        discountAmount,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        notes: `${customer.notes} | Pay Mode: ${mode} ${mode === "Card" ? `Ref: ${cardRef}` : ""} ${extraNote} ${exchangeCredit ? `| EXCHANGE against Order #${exchangeCredit.originalOrderId} (Credit ₹${creditAmt})` : ""}`.trim(),
      };

      const res = await fetch(submitApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Transaction synchronization failed.");
      }

      setCompletedOrder(data.order || null);
      setIsSuccess(true);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Network error while syncing order.");
    } finally {
      setLoading(false);
    }
  };

  // UPI dynamic QR code generator URL (using clean public API for demo / store scanning)
  const upiUrl = `upi://pay?pa=forthetruth@sbi&pn=For+The+Truth+Bookstore&am=${totalAmount}&cu=INR`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUrl)}&color=16-50-79&bgcolor=FFFFFF`;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 p-4 backdrop-blur-md overflow-y-auto">
        <div className="w-full max-w-2xl rounded-3xl bg-slate-100 p-6 shadow-2xl">
          <ReceiptPrinter
            order={completedOrder}
            items={items}
            totalAmount={totalAmount}
            discountAmount={discountAmount}
            paymentMethod={mode}
            customer={customer}
            cashReceived={mode === "Cash" ? cashTendered : undefined}
            changeReturn={mode === "Cash" ? changeReturned : undefined}
            onNewTransaction={onSuccessReset}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-navy p-5 text-white">
          <div>
            <h2 className="font-display text-xl font-black tracking-tight">
              Counter Settlement &amp; Checkout
            </h2>
            <div className="text-xs text-white/80 mt-1 space-y-0.5">
              <p>Total Items Value: ₹{totalAmount}</p>
              {(customer.name || customer.phone) && (
                <p className="text-amber-200 font-semibold">
                  👤 Customer: {customer.name || "Customer"}{customer.phone ? ` (${customer.phone})` : ""}
                </p>
              )}
              {exchangeCredit && (
                <p className="text-amber-300 font-bold">
                  − Prepaid Credit: ₹{creditAmt} (Order #{exchangeCredit.originalOrderId})
                </p>
              )}
              <p className="font-bold text-base text-gold-light mt-1">
                {netDueFromCustomer > 0 ? (
                  `Customer Owes: ₹${netDueFromCustomer}`
                ) : refundDueToCustomer > 0 ? (
                  `Refund Cash to Customer: ₹${refundDueToCustomer}`
                ) : (
                  `Even Exchange (₹0 Due)`
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white font-bold transition-colors hover:bg-white/20"
          >
            ✕
          </button>
        </div>

        {/* Mode Selectors */}
        <div className="grid grid-cols-3 gap-3 p-5 bg-slate-50 border-b border-slate-200">
          {(["Cash", "UPI", "Card"] as PayMode[]).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 transition-all duration-200 border ${
                  active
                    ? "border-navy bg-navy text-white shadow-lg shadow-navy/20 scale-105"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span className="text-2xl">
                  {m === "Cash" ? "💵" : m === "UPI" ? "📱" : "💳"}
                </span>
                <span className="font-display text-xs font-black tracking-wider uppercase">
                  {m === "Cash" ? "Cash Counter" : m === "UPI" ? "UPI QR Scan" : "POS Card Machine"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Mode Area */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
              ⚠️ {errorMsg}
            </div>
          )}

          {mode === "Cash" && (
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Cash Tendered by Customer (₹)
                </label>
                <input
                  type="number"
                  min={netDueFromCustomer}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                  disabled={netDueFromCustomer === 0}
                  className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3 font-display text-2xl font-black text-navy outline-none transition-colors focus:border-gold focus:ring-4 focus:ring-gold/20 disabled:opacity-50 disabled:bg-slate-100"
                />
              </div>

              {/* Quick Preset Notes */}
              {netDueFromCustomer > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">Quick Cash Note Buttons:</p>
                  <div className="flex flex-wrap gap-2">
                    {[netDueFromCustomer, Math.ceil(netDueFromCustomer / 100) * 100, 500, 1000, 2000].map((amt, i, arr) => {
                      // avoid duplicate buttons
                      if (arr.indexOf(amt) !== i || amt < netDueFromCustomer || amt === 0) return null;
                      return (
                        <button
                          key={amt}
                          onClick={() => handleQuickCash(amt)}
                          className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 font-display text-xs font-bold text-charcoal hover:bg-slate-200 active:scale-95 transition-all"
                        >
                          ₹{amt} {amt === netDueFromCustomer ? "(Exact)" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Change Box */}
              <div className={`rounded-2xl p-5 border flex items-center justify-between transition-colors ${
                cashTendered < netDueFromCustomer
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-900"
              }`}>
                <div>
                  <span className="text-xs font-extrabold uppercase block">
                    {cashTendered < netDueFromCustomer 
                      ? "Insufficient Cash Tendered" 
                      : refundDueToCustomer > 0 
                        ? "Amount to Refund (Cash Back):"
                        : "Change to Return to Customer:"}
                  </span>
                  <p className="text-[11px] opacity-75 mt-0.5">
                    {cashTendered < netDueFromCustomer
                      ? `Need ₹${netDueFromCustomer - cashTendered} more to settle bill.`
                      : "Hand over cash and finalize transaction."}
                  </p>
                </div>
                <div className="font-display text-3xl font-black text-emerald-700">
                  ₹{changeReturned}
                </div>
              </div>
            </div>
          )}

          {mode === "UPI" && (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-5">
              {netDueFromCustomer > 0 ? (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#072654] text-white shadow-xl">
                    <svg viewBox="0 0 100 100" width="48" height="48" fill="none">
                      <text x="10" y="70" fontSize="60" fill="white" fontWeight="bold">Rₚ</text>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-black text-navy">Razorpay Checkout</h3>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      Opens a secure Razorpay popup. Customer can pay via UPI, NetBanking, Card, or Wallet.
                    </p>
                  </div>
                  <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                    <p className="text-xs text-slate-500 mb-1">Amount to Collect via Razorpay</p>
                    <p className="font-display text-3xl font-black text-navy">₹{netDueFromCustomer}</p>
                  </div>
                  {razorpayStatus === "paid" && (
                    <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-700">
                      ✅ Payment received! Recording order...
                    </div>
                  )}
                  <button
                    onClick={handleRazorpayPayment}
                    disabled={razorpayStatus === "loading" || razorpayStatus === "paid" || loading}
                    className="w-full rounded-2xl bg-[#072654] py-4 font-display text-sm font-black text-white shadow-lg transition-all hover:bg-[#0a3270] active:scale-[0.98] disabled:opacity-50"
                  >
                    {razorpayStatus === "loading" ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Opening Razorpay...
                      </span>
                    ) : razorpayStatus === "paid" ? "✅ Payment Confirmed" : "🏦 Launch Razorpay Payment"}
                  </button>
                </>
              ) : (
                <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-800">
                  <p className="font-bold text-lg mb-2">No Razorpay Payment Needed</p>
                  <p className="text-sm">The new total is covered by the exchange credit. Please switch to "Cash Counter" mode if you need to hand them cash back, and click Confirm.</p>
                </div>
              )}
            </div>
          )}

          {mode === "Card" && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white text-2xl font-bold">
                  💳
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-navy">POS Card Terminal Swiping</h4>
                  <p className="text-xs text-slate-500">Swipe or insert Credit/Debit card on counter POS machine for ₹{netDueFromCustomer}.</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 block mb-1.5">
                  Card Slip Authorization / Reference Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. AUTH-849201"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-gold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 p-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-extrabold text-slate-700 transition-colors hover:bg-slate-100"
          >
            CANCEL
          </button>
          {mode !== "UPI" && (
            <button
              onClick={() => handleCompleteTransaction()}
              disabled={loading || (mode === "Cash" && cashTendered < netDueFromCustomer)}
              className="flex items-center gap-2 rounded-xl bg-cta px-8 py-3 font-display text-sm font-black tracking-wide text-white shadow-lg shadow-cta/25 transition-all hover:bg-cta-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>SYNCING INVENTORY...</span>
                </>
              ) : (
                <>
                  <span>CONFIRM &amp; PRINT BILL</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
