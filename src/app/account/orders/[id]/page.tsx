"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { formatPrice } from "@/utils/currency";
import { ReviewModal } from "@/components/reviews/ReviewModal";

interface OrderDetail {
  id: number;
  status: string;
  total: string;
  date_created: string;
  payment_method_title?: string;
  discount_total?: string;
  billing: Record<string, string>;
  shipping: Record<string, string>;
  line_items: {
    id: number;
    product_id: number;
    name: string;
    quantity: number;
    total: string;
  }[];
  shipping_lines?: { method_title: string; total: string }[];
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null | "error">(null);
  const [reviewTarget, setReviewTarget] = useState<{ productId: number; productName: string } | null>(null);
  const [reviewedProductIds, setReviewedProductIds] = useState<number[]>([]);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setOrder(d.order))
      .catch(() => setOrder("error"));
  }, [params.id]);

  const customerName = order && order !== "error" && order.billing
    ? `${order.billing.first_name || ""} ${order.billing.last_name || ""}`.trim()
    : "";
  const customerEmail = order && order !== "error" && order.billing
    ? order.billing.email || ""
    : "";

  return (
    <AccountShell title={`Order #${params.id}`}>
      {order === null ? (
        <div className="skeleton h-64 rounded-2xl" />
      ) : order === "error" ? (
        <div className="rounded-2xl border border-sand bg-white p-12 text-center shadow-card">
          <p className="font-display text-xl text-charcoal/60">
            Order not found.
          </p>
          <Link href="/account/orders" className="btn-gold mt-6 inline-flex">
            Back to Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-sand bg-white p-6 shadow-card">
            <OrderStatusBadge status={order.status} />
            <p className="text-sm text-charcoal/60">
              Placed on{" "}
              {new Date(order.date_created).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            {order.payment_method_title && (
              <p className="ml-auto text-sm text-charcoal/60">
                Paid via {order.payment_method_title}
              </p>
            )}
          </div>

          {/* Feedback prompt banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-gold/10 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-white shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <p className="font-display text-base font-bold text-charcoal">
                  Have you started reading your books?
                </p>
                <p className="text-xs text-charcoal/70">
                  Share your honest review below to encourage other readers across India!
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-card">
            <table className="w-full text-left text-sm min-w-[550px]">
              <thead>
                <tr className="border-b border-sand bg-cream/60 text-xs uppercase tracking-wider text-charcoal/50">
                  <th className="px-6 py-4">Book</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Review &amp; Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/70">
                {order.line_items.map((li) => {
                  const isReviewed = reviewedProductIds.includes(li.product_id);
                  return (
                    <tr key={li.id}>
                      <td className="px-6 py-4 font-semibold text-charcoal">
                        {li.name}
                      </td>
                      <td className="px-6 py-4 text-center text-charcoal/60">
                        {li.quantity}
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        {formatPrice(li.total)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isReviewed ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Reviewed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setReviewTarget({
                                productId: li.product_id,
                                productName: li.name,
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-xs font-bold text-gold-deep hover:bg-gold hover:text-white transition shadow-sm active:scale-95"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            Review Book
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {parseFloat(order.discount_total ?? "0") > 0 && (
                  <tr className="border-t border-sand text-charcoal/60">
                    <td className="px-6 py-3" colSpan={3}>Discount</td>
                    <td className="px-6 py-3 text-right">
                      −{formatPrice(order.discount_total!)}
                    </td>
                  </tr>
                )}
                {order.shipping_lines?.map((s, i) => (
                  <tr key={i} className="border-t border-sand text-charcoal/60">
                    <td className="px-6 py-3" colSpan={3}>{s.method_title}</td>
                    <td className="px-6 py-3 text-right">
                      {parseFloat(s.total) > 0 ? formatPrice(s.total) : "Free"}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-sand">
                  <td className="px-6 py-4 font-bold" colSpan={3}>Grand Total</td>
                  <td className="px-6 py-4 text-right font-display text-lg font-bold text-gold-dark">
                    {formatPrice(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <AddressCard title="Shipping Address" a={order.shipping} />
            <AddressCard title="Billing Address" a={order.billing} />
          </div>

          {/* Review Modal */}
          {reviewTarget && (
            <ReviewModal
              isOpen={Boolean(reviewTarget)}
              onClose={() => setReviewTarget(null)}
              productId={reviewTarget.productId}
              productName={reviewTarget.productName}
              defaultReviewerName={customerName}
              defaultReviewerEmail={customerEmail}
              onSuccess={() => {
                setReviewedProductIds((prev) => [...prev, reviewTarget.productId]);
              }}
            />
          )}
        </div>
      )}
    </AccountShell>
  );
}

function AddressCard({ title, a }: { title: string; a: Record<string, string> }) {
  if (!a) return null;
  return (
    <div className="rounded-2xl border border-sand bg-white p-6 shadow-card">
      <p className="overline-label mb-3">{title}</p>
      <p className="text-sm leading-relaxed text-charcoal/70">
        {a.first_name} {a.last_name}
        <br />
        {a.address_1}
        {a.address_2 && <><br />{a.address_2}</>}
        <br />
        {a.city}, {a.state} {a.postcode}
        <br />
        {a.country}
        {a.phone && <><br />{a.phone}</>}
      </p>
    </div>
  );
}
