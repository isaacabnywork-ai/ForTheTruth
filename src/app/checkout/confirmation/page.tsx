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
  line_items: { id: number; name: string; quantity: number; total: string; product_id?: number }[];
  payment_method_title?: string;
  date_created?: string;
}

interface DownloadLink {
  download_url: string;
  download_name: string;
  product_name: string;
  product_id: number;
}

function Confirmation() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const orderKey = searchParams.get("key");
  const isFree = searchParams.get("free") === "1";
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [downloads, setDownloads] = useState<DownloadLink[]>([]);
  const [loadingDownloads, setLoadingDownloads] = useState(isFree);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}${orderKey ? `?key=${orderKey}` : ""}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setOrder(d.order))
      .catch(() => {});
  }, [orderId, orderKey]);

  // Fetch download links for free/ebook orders
  useEffect(() => {
    if (!isFree) return;
    setLoadingDownloads(true);
    fetch("/api/ebooks")
      .then((r) => r.ok ? r.json() : { downloads: [] })
      .then((d) => {
        setDownloads(d.downloads ?? []);
        setLoadingDownloads(false);
      })
      .catch(() => setLoadingDownloads(false));
  }, [isFree]);

  const isFreeOrder = isFree || (order && parseFloat(order.total) === 0);

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
            {isFreeOrder ? "Your E-Book is Ready! 🎉" : "Order Confirmed! 🎉"}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-charcoal/60">
            {isFreeOrder
              ? <>Your free download is confirmed — order <span className="font-bold text-gold-dark">#{orderId}</span>. Download your PDF below!</>
              : <>Thank you for your purchase{orderId && (<> — order <span className="font-bold text-gold-dark">#{orderId}</span></>)}. A confirmation email is on its way to your inbox.</>
            }
          </p>
        </div>

        {/* ── PDF Download Section (for free/ebook orders) ── */}
        {isFreeOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-8 overflow-hidden rounded-3xl border-2 border-emerald-200 bg-emerald-50 shadow-card"
          >
            <div className="flex items-center gap-3 border-b border-emerald-200 bg-emerald-100/70 px-6 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-emerald-900">Download Your E-Book</h2>
                <p className="text-xs text-emerald-700">Click below to download your free PDF</p>
              </div>
            </div>

            <div className="p-6">
              {loadingDownloads ? (
                <div className="space-y-3">
                  <div className="h-12 animate-pulse rounded-2xl bg-emerald-200/60" />
                  <div className="h-12 animate-pulse rounded-2xl bg-emerald-200/40" />
                </div>
              ) : downloads.length > 0 ? (
                <div className="space-y-3">
                  {downloads.map((d, i) => (
                    <a
                      key={i}
                      href={d.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-white px-5 py-4 transition hover:border-emerald-400 hover:shadow-sm active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 border border-red-100">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500" aria-hidden>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="9" y1="13" x2="15" y2="13"/>
                            <line x1="9" y1="17" x2="15" y2="17"/>
                            <polyline points="9 9 10 9"/>
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-charcoal truncate">{d.product_name}</p>
                          <p className="text-xs text-charcoal/50">PDF Document</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download PDF
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-charcoal/60 mb-3">Your download will be available shortly. You can also find it in your account.</p>
                  <Link href="/account/downloads" className="btn-gold text-sm inline-flex">
                    Go to My Downloads →
                  </Link>
                </div>
              )}

              <p className="mt-4 text-center text-xs text-emerald-700/70">
                Downloads never expire · Find them anytime in{" "}
                <Link href="/account/downloads" className="font-semibold underline">My Downloads</Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* Order Summary Card */}
        {order ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 overflow-hidden rounded-3xl border border-sand bg-white shadow-card"
          >
            <div className="border-b border-sand bg-cream/50 px-6 py-4">
              <h2 className="font-display text-lg font-bold text-charcoal">Order Summary</h2>
              {order.billing?.first_name && (
                <p className="mt-0.5 text-sm text-charcoal/55">
                  {isFreeOrder ? "Registered to" : "Shipping to"} {order.billing.first_name} {order.billing.last_name}
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
                    <span className="shrink-0 font-semibold text-charcoal">
                      {parseFloat(li.total) === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatPrice(li.total)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className={`mt-5 flex items-center justify-between rounded-2xl px-5 py-4 ${isFreeOrder ? "bg-emerald-500" : "bg-gold-gradient"}`}>
                <span className="font-display font-bold text-white">{isFreeOrder ? "Total" : "Total Paid"}</span>
                <span className="font-display text-xl font-black text-white">
                  {isFreeOrder ? "FREE" : formatPrice(order.total)}
                </span>
              </div>

              {order.payment_method_title && (
                <p className="mt-3 text-center text-xs text-charcoal/45">
                  {isFreeOrder ? "✓ No payment required" : `Paid via ${order.payment_method_title}`}
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
            {(isFreeOrder ? [
              { step: "1", text: "Download your PDF using the button above." },
              { step: "2", text: "Open it on any device — phone, tablet, or computer." },
              { step: "3", text: "Re-download anytime from My Account → Downloads." },
            ] : [
              { step: "1", text: "You'll receive an order confirmation email shortly." },
              { step: "2", text: "We'll dispatch your books within 24 hours." },
              { step: "3", text: "Delivery takes 5–7 business days across India." },
            ]).map((item) => (
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
          {isFreeOrder ? (
            <>
              <Link href="/account/downloads" className="btn-gold">My Downloads</Link>
              <Link href="/free-ebooks" className="btn-outline">More Free E-Books</Link>
            </>
          ) : (
            <>
              <Link href="/account/orders" className="btn-gold">View My Orders</Link>
              <Link href="/products" className="btn-outline">Continue Shopping</Link>
            </>
          )}
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
