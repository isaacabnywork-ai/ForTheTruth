"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/utils/currency";

interface OrderDetail {
  id: number;
  total: string;
  billing: Record<string, string>;
  line_items: { id: number; name: string; quantity: number; total: string }[];
  payment_method_title?: string;
  date_created?: string;
}

function Confirmation() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const orderKey = searchParams.get("key");
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}${orderKey ? `?key=${orderKey}` : ""}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setOrder(d.order))
      .catch(() => {});
  }, [orderId, orderKey]);

  return (
    <div className="min-h-screen bg-offwhite px-4 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl"
      >
        {/* Success Icon */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-gold-gradient shadow-gold"
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </motion.div>

          <h1 className="mt-8 font-display text-4xl font-black text-charcoal md:text-5xl">
            Order Confirmed! 🎉
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-charcoal/60">
            Thank you for your purchase
            {orderId && (
              <>
                {" "}— order{" "}
                <span className="font-bold text-gold-dark">#{orderId}</span>
              </>
            )}
            . A confirmation email is on its way to your inbox.
          </p>
        </div>

        {/* Order Summary Card */}
        {order ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-10 overflow-hidden rounded-3xl border border-sand bg-white shadow-card"
          >
            <div className="border-b border-sand bg-cream/50 px-6 py-4">
              <h2 className="font-display text-lg font-bold text-charcoal">Order Summary</h2>
              {order.billing?.first_name && (
                <p className="mt-0.5 text-sm text-charcoal/55">
                  Shipping to {order.billing.first_name} {order.billing.last_name}
                  {order.billing.city ? `, ${order.billing.city}` : ""}
                </p>
              )}
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {order.line_items.map((li) => (
                  <li key={li.id} className="flex items-center justify-between gap-4 text-sm">
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream font-bold text-xs text-charcoal">
                        ×{li.quantity}
                      </span>
                      <span className="text-charcoal/80">{li.name}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-charcoal">{formatPrice(li.total)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-gold-gradient px-5 py-4">
                <span className="font-display font-bold text-white">Total Paid</span>
                <span className="font-display text-xl font-black text-white">
                  {formatPrice(order.total)}
                </span>
              </div>

              {order.payment_method_title && (
                <p className="mt-3 text-center text-xs text-charcoal/45">
                  Paid via {order.payment_method_title}
                </p>
              )}
            </div>
          </motion.div>
        ) : orderId ? (
          <div className="mt-10 animate-pulse rounded-3xl border border-sand bg-white p-6 shadow-card">
            <div className="mb-4 h-5 w-1/3 rounded-full bg-sand" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-1/2 rounded-full bg-sand/60" />
                  <div className="h-4 w-16 rounded-full bg-sand/60" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 rounded-3xl border border-sand bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 font-display text-base font-bold text-charcoal">What happens next?</h3>
          <ol className="space-y-3">
            {[
              { step: "1", text: "You'll receive an order confirmation email shortly." },
              { step: "2", text: "We'll dispatch your books within 24 hours." },
              { step: "3", text: "Delivery takes 5–7 business days across India." },
            ].map((item) => (
              <li key={item.step} className="flex items-start gap-3 text-sm text-charcoal/70">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-[11px] font-black text-white">
                  {item.step}
                </span>
                {item.text}
              </li>
            ))}
          </ol>
        </motion.div>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/account/orders" className="btn-gold">
            View My Orders
          </Link>
          <Link href="/products" className="btn-outline">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <Confirmation />
    </Suspense>
  );
}
