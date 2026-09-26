"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { formatPrice } from "@/utils/currency";

interface OrderSummary {
  id: number;
  status: string;
  total: string;
  date: string;
  itemCount: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <AccountShell title="Orders">
      <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-card">
        {orders === null ? (
          <div className="skeleton m-6 h-40 rounded-xl" />
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-xl text-charcoal/60">No orders yet.</p>
            <Link href="/products" className="btn-gold mt-6 inline-flex">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-sand bg-cream/60 text-xs uppercase tracking-wider text-charcoal/50">
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="hidden px-6 py-4 sm:table-cell">Items</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/70">
                {orders.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-cream/40">
                    <td className="px-6 py-4">
                      <Link
                        href={`/account/orders/${o.id}`}
                        className="font-bold text-gold-dark hover:underline"
                      >
                        #{o.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-charcoal/60">
                      {new Date(o.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="hidden px-6 py-4 text-charcoal/60 sm:table-cell">
                      {o.itemCount}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      {formatPrice(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AccountShell>
  );
}
