"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/utils/currency";

import { InvoiceCard, type OrderInvoiceData } from "@/components/checkout/InvoiceCard";
import { ReviewModal } from "@/components/reviews/ReviewModal";

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
  const [order, setOrder] = useState<OrderInvoiceData | null>(null);
  const [downloads, setDownloads] = useState<DownloadLink[]>([]);
  const [loadingDownloads, setLoadingDownloads] = useState(isFree);

  // Review modal state
  const [reviewTarget, setReviewTarget] = useState<{ productId: number; productName: string } | null>(null);
  const [reviewBookSelectorOpen, setReviewBookSelectorOpen] = useState(false);

  useEffect(() => {
    // 1. Immediately read cached order details for instant 0ms invoice render
    try {
      const cached = sessionStorage.getItem("ftt_latest_order");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!orderId || String(parsed.id) === String(orderId)) {
          setOrder(parsed);
        }
      }
    } catch {}

    // 2. Fetch fresh order from API to synchronize latest status from WooCommerce
    if (!orderId) return;
    fetch(`/api/orders/${orderId}${orderKey ? `?key=${orderKey}` : ""}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.order) {
          setOrder((prev) => ({
            ...(prev || {}),
            ...d.order,
            // Preserve shipping total if available
            shipping_total: d.order.shipping_total ?? prev?.shipping_total,
            shipping_lines: d.order.shipping_lines ?? prev?.shipping_lines,
          }));
        }
        if (d?.downloads && d.downloads.length > 0) {
          setDownloads(d.downloads);
          setLoadingDownloads(false);
        }
      })
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

  // Determine reviewer customer details from order billing
  const customerName = order?.billing?.first_name
    ? `${order.billing.first_name} ${order.billing.last_name || ""}`.trim()
    : "";
  const customerEmail = order?.billing?.email || "";

  // Available books to review from this order
  const reviewableBooks = order?.line_items?.map((item) => ({
    productId: item.product_id || 0,
    productName: item.name,
  })).filter((b) => b.productId > 0) || [];

  function handleStartReview() {
    if (reviewableBooks.length === 1) {
      setReviewTarget(reviewableBooks[0]);
    } else if (reviewableBooks.length > 1) {
      setReviewBookSelectorOpen(true);
    } else if (downloads.length > 0) {
      setReviewTarget({
        productId: downloads[0].product_id,
        productName: downloads[0].product_name,
      });
    } else {
      // General feedback on the latest order
      setReviewTarget({
        productId: 57010, // General catalog reference
        productName: `Order #${orderId || "Recent"} Experience`,
      });
    }
  }

  return (
    <div className="min-h-screen bg-offwhite px-4 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl"
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

        {/* ── Post-Order Community & Feedback Options: A, B, C ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 overflow-hidden rounded-3xl border border-sand bg-white p-6 shadow-card md:p-8"
        >
          <div className="text-center max-w-lg mx-auto mb-6">
            <span className="inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-dark">
              Stay Connected &amp; Fellowship
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-charcoal md:text-3xl">
              Connect With Us &amp; Share Your Review
            </h3>
            <p className="mt-1.5 text-sm text-charcoal/60">
              Join fellow readers across India, get daily sound encouragement, and share your feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* A) Join WhatsApp */}
            <a
              href="https://wa.me/918604685533?text=Hi%20For%20The%20Truth%20Team!%20I%20just%20placed%20an%20order%20and%20would%20love%20to%20join%20the%20community."
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-center transition hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm mb-3 group-hover:scale-105 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-base">A) Join WhatsApp</h4>
                <p className="mt-1 text-xs text-emerald-800/80 leading-relaxed">
                  Join our reader community for sound devotions, book drops, and updates.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm group-hover:bg-emerald-700 transition">
                Join Community →
              </span>
            </a>

            {/* B) Follow us Instagram */}
            <a
              href="https://www.instagram.com/forthetruthindia/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-between rounded-2xl border border-pink-200 bg-pink-50/50 p-5 text-center transition hover:border-pink-400 hover:bg-pink-50 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-sm mb-3 group-hover:scale-105 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-charcoal text-base">B) Follow Instagram</h4>
                <p className="mt-1 text-xs text-charcoal/70 leading-relaxed">
                  Quotes from Spurgeon, Sproul, Calvin &amp; video book walk-throughs.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm group-hover:opacity-95 transition">
                Follow @forthetruthindia →
              </span>
            </a>

            {/* C) Feedback and review */}
            <button
              onClick={handleStartReview}
              className="group flex flex-col items-center justify-between rounded-2xl border border-gold/40 bg-gold/10 p-5 text-center transition hover:border-gold hover:bg-gold/20 hover:shadow-md text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-gradient text-white shadow-sm mb-3 group-hover:scale-105 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-charcoal text-base">C) Feedback &amp; Review</h4>
                <p className="mt-1 text-xs text-charcoal/70 leading-relaxed">
                  Rate your books or shopping experience to help fellow believers.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-3.5 py-1.5 text-xs font-bold text-white shadow-sm group-hover:opacity-95 transition">
                Write a Review →
              </span>
            </button>
          </div>

          {/* Selector modal if order has multiple books */}
          {reviewBookSelectorOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
              <div className="relative w-full max-w-md rounded-3xl border border-sand bg-white p-6 shadow-2xl">
                <button
                  onClick={() => setReviewBookSelectorOpen(false)}
                  className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal"
                >
                  ✕
                </button>
                <h4 className="font-display text-xl font-bold text-charcoal mb-2">
                  Select a Book to Review
                </h4>
                <p className="text-xs text-charcoal/60 mb-4">
                  Which book from your order would you like to review first?
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {reviewableBooks.map((b) => (
                    <button
                      key={b.productId}
                      onClick={() => {
                        setReviewTarget(b);
                        setReviewBookSelectorOpen(false);
                      }}
                      className="w-full text-left rounded-xl border border-sand bg-cream/40 p-3 text-sm font-semibold text-charcoal hover:border-gold hover:bg-gold/10 transition"
                    >
                      {b.productName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Review Modal */}
        {reviewTarget && (
          <ReviewModal
            isOpen={Boolean(reviewTarget)}
            onClose={() => setReviewTarget(null)}
            productId={reviewTarget.productId}
            productName={reviewTarget.productName}
            defaultReviewerName={customerName}
            defaultReviewerEmail={customerEmail}
          />
        )}

        {/* Official Tax Invoice & Order Summary */}
        {order ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-8"
          >
            <InvoiceCard order={order} isFree={Boolean(isFreeOrder)} />
          </motion.div>
        ) : orderId ? (
          <div className="mt-10 animate-pulse rounded-3xl border border-sand bg-white p-6 shadow-card">
            <div className="mb-4 h-5 w-1/3 rounded-full bg-sand" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
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
