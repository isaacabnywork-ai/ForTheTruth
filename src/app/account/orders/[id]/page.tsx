"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { formatPrice } from "@/utils/currency";

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

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setOrder(d.order))
      .catch(() => setOrder("error"));
  }, [params.id]);

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

          <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-card">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-sand bg-cream/60 text-xs uppercase tracking-wider text-charcoal/50">
                  <th className="px-6 py-4">Book</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/70">
                {order.line_items.map((li) => (
                  <tr key={li.id}>
                    <td className="px-6 py-4 font-semibold">{li.name}</td>
                    <td className="px-6 py-4 text-center text-charcoal/60">
                      {li.quantity}
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      {formatPrice(li.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {parseFloat(order.discount_total ?? "0") > 0 && (
                  <tr className="border-t border-sand text-charcoal/60">
                    <td className="px-6 py-3" colSpan={2}>Discount</td>
                    <td className="px-6 py-3 text-right">
                      −{formatPrice(order.discount_total!)}
                    </td>
                  </tr>
                )}
                {order.shipping_lines?.map((s, i) => (
                  <tr key={i} className="border-t border-sand text-charcoal/60">
                    <td className="px-6 py-3" colSpan={2}>{s.method_title}</td>
                    <td className="px-6 py-3 text-right">
                      {parseFloat(s.total) > 0 ? formatPrice(s.total) : "Free"}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-sand">
                  <td className="px-6 py-4 font-bold" colSpan={2}>Grand Total</td>
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
        </div>
      )}
    </AccountShell>
  );
}

function AddressCard({ title, a }: { title: string; a: Record<string, string> }) {
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
