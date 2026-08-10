"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddressForm } from "@/components/checkout/AddressForm";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/utils/currency";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const EMPTY_ADDRESS = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address1: "",
  city: "",
  state: "",
  postcode: "",
  country: "IN",
};

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [shipping, setShipping] = useState(EMPTY_ADDRESS);
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState(EMPTY_ADDRESS);
  const [coupon, setCoupon] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mockPaymentModal, setMockPaymentModal] = useState<{
    wcOrderId: number;
    orderKey?: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
  } | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (user) {
      setShipping((s) => ({
        ...s,
        firstName: s.firstName || user.firstName,
        lastName: s.lastName || user.lastName,
        email: s.email || user.email,
      }));
    }
  }, [user]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const estShipping = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const isFreeOrder = subtotal === 0;

  if (mounted && items.length === 0 && !busy) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="font-display text-2xl font-bold text-charcoal/70">
          Nothing to check out.
        </p>
        <Link href="/products" className="btn-gold mt-8 inline-flex">
          Browse the Shelves
        </Link>
      </div>
    );
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          shipping,
          billingSameAsShipping: billingSame,
          billing: billingSame ? undefined : billing,
          couponCode: coupon.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      // Free order (₹0 total) — no payment needed, redirect straight to confirmation
      if (data.freeOrder) {
        clearCart();
        router.push(`/checkout/confirmation?order=${data.wcOrderId}&key=${data.orderKey ?? ""}&free=1`);
        return;
      }

      // Switch to interactive simulated checkout modal if running in test sandbox mode without real keys
      if (
        String(data.razorpayOrderId).startsWith("order_mock_") ||
        !data.keyId ||
        String(data.keyId).includes("xxxx") ||
        String(data.keyId).includes("mock")
      ) {
        setMockPaymentModal({
          wcOrderId: data.wcOrderId,
          orderKey: data.orderKey,
          razorpayOrderId: data.razorpayOrderId,
          amount: data.amount,
          currency: data.currency,
        });
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        throw new Error("Could not load the payment window. Check your connection.");
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        name: "For The Truth",
        description: `Order #${data.wcOrderId}`,
        prefill: {
          name: `${shipping.firstName} ${shipping.lastName}`,
          email: shipping.email,
          contact: shipping.phone,
        },
        theme: { color: "#C89B3C" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verify = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wcOrderId: data.wcOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          if (verify.ok) {
            clearCart();
            router.push(
              `/checkout/confirmation?order=${data.wcOrderId}&key=${data.orderKey ?? ""}`
            );
          } else {
            setError("Payment verification failed. If you were charged, contact support with your payment ID.");
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <p className="overline-label mb-2">Secure checkout</p>
      <h1 className="font-display text-3xl font-bold md:text-4xl">Checkout</h1>

      <form onSubmit={pay} className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-sand bg-white p-6 shadow-card md:p-8">
            <h2 className="mb-6 font-serif text-lg font-bold">Shipping Address</h2>
            <AddressForm prefix="ship" address={shipping} onChange={setShipping} />
            {!user && (
              <p className="mt-4 text-xs text-charcoal/45">
                Have an account?{" "}
                <Link href="/login?next=/checkout" className="font-semibold text-gold-dark hover:underline">
                  Sign in
                </Link>{" "}
                to track this order easily.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-sand bg-white p-6 shadow-card md:p-8">
            <label className="flex cursor-pointer items-center gap-3 font-serif text-lg font-bold">
              <input
                type="checkbox"
                checked={billingSame}
                onChange={(e) => setBillingSame(e.target.checked)}
                className="h-4 w-4 accent-[#C89B3C]"
              />
              Billing address same as shipping
            </label>
            {!billingSame && (
              <div className="mt-6">
                <AddressForm prefix="bill" address={billing} onChange={setBilling} />
              </div>
            )}
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-sand bg-white p-6 shadow-card lg:sticky lg:top-32">
          <h2 className="font-serif text-lg font-bold">Your Order</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="text-charcoal/65">
                  {i.name} <span className="text-charcoal/40">× {i.quantity}</span>
                </span>
                <span className="shrink-0 font-semibold">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code"
              aria-label="Coupon code"
              className="w-full rounded-full border border-sand bg-cream/50 px-4 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
            />
          </div>
          <p className="mt-2 text-[11px] text-charcoal/40">
            Coupons are validated and applied when you pay.
          </p>

          <dl className="mt-5 space-y-2.5 border-t border-sand pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-charcoal/55">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-charcoal/55">Shipping</dt>
              <dd className="font-semibold">
                {estShipping === 0 ? "Free" : formatPrice(estShipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-sand pt-3">
              <dt className="font-bold">Total</dt>
              <dd className="font-display text-xl font-bold text-gold-dark">
                {formatPrice(subtotal + estShipping)}
              </dd>
            </div>
          </dl>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-gold mt-6 w-full justify-center disabled:opacity-60"
          >
            {busy
              ? (isFreeOrder ? "Placing order…" : "Opening payment…")
              : (isFreeOrder ? "Place Free Order →" : "Pay with Razorpay")}
          </button>
          {isFreeOrder ? (
            <p className="mt-3 text-center text-[11px] text-emerald-600 font-semibold">
              ✓ No payment required — your e-book is completely free!
            </p>
          ) : (
            <p className="mt-3 text-center text-[11px] text-charcoal/40">
              UPI · Cards · Netbanking · Wallets — secured by Razorpay
            </p>
          )}
        </aside>
      </form>

      {/* Interactive Razorpay Test Sandbox Simulation Modal */}
      {mockPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg">
                  ₹
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Razorpay Test Sandbox</h3>
                  <p className="text-xs text-slate-500">Simulated Payment Mode • Order #{mockPaymentModal.wcOrderId}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMockPaymentModal(null);
                  setBusy(false);
                }}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Amount Payable</p>
              <p className="font-display text-3xl font-black text-navy mt-1">
                {formatPrice((mockPaymentModal.amount / 100).toString())}
              </p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">✔ WooCommerce Order #{mockPaymentModal.wcOrderId} Created Successfully</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are testing checkout in sandbox mode. Choose an action below to test payment signature verification and WooCommerce order status updates:
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={async () => {
                  const verify = await fetch("/api/checkout/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      wcOrderId: mockPaymentModal.wcOrderId,
                      razorpayOrderId: mockPaymentModal.razorpayOrderId,
                      razorpayPaymentId: `pay_mock_${Date.now()}`,
                      razorpaySignature: "mock_valid_signature",
                    }),
                  });
                  if (verify.ok) {
                    clearCart();
                    router.push(
                      `/checkout/confirmation?order=${mockPaymentModal.wcOrderId}&key=${mockPaymentModal.orderKey ?? ""}`
                    );
                  } else {
                    setError("Mock payment verification failed. Please try again.");
                    setMockPaymentModal(null);
                    setBusy(false);
                  }
                }}
                className="w-full rounded-2xl bg-emerald-600 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white hover:bg-emerald-700 shadow-md transition-all active:scale-[0.99]"
              >
                ✅ Simulate Successful Payment
              </button>
              <button
                type="button"
                onClick={() => {
                  setError("Payment cancelled or failed during verification.");
                  setMockPaymentModal(null);
                  setBusy(false);
                }}
                className="w-full rounded-2xl border-2 border-red-200 bg-red-50 py-3 font-display text-xs font-bold uppercase tracking-wider text-red-700 hover:bg-red-100 transition-all"
              >
                ❌ Simulate Payment Failure
              </button>
            </div>

            <p className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              To test with live Razorpay Test API Keys, insert your key ID &amp; secret into .env.local and reload.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
