"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/utils/currency";

interface OrderSummary {
  id: number;
  status: string;
  total: string;
  date: string;
  itemCount: number;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [mounted, setMounted] = useState(false);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);

  useEffect(() => {
    setMounted(true);
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => setOrders([]));
  }, []);

  const totalSpent =
    orders?.reduce((sum, o) => sum + parseFloat(o.total), 0) ?? 0;

  return (
    <AccountShell title="Dashboard">
      <div className="grid gap-5 sm:grid-cols-3">
        {[
          { label: "Orders", value: orders ? String(orders.length) : "…" },
          { label: "Total Spent", value: orders ? formatPrice(totalSpent) : "…" },
          { label: "Wishlist", value: mounted ? String(wishlistCount) : "…" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-sand bg-white p-6 text-center shadow-card"
          >
            <p className="font-display text-2xl font-bold text-gold-dark">
              {stat.value}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-charcoal/45">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-sand bg-white p-6 shadow-card">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg font-bold">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-xs font-bold uppercase tracking-widest text-gold-dark hover:text-charcoal"
          >
            View all →
          </Link>
        </div>
        {orders === null ? (
          <div className="skeleton mt-4 h-24 rounded-xl" />
        ) : orders.length === 0 ? (
          <p className="mt-4 text-sm text-charcoal/50">
            No orders yet —{" "}
            <Link href="/products" className="font-semibold text-gold-dark hover:underline">
              browse the shelves
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-sand/70">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id}>
                <Link
                  href={`/account/orders/${o.id}`}
                  className="flex items-center justify-between py-3.5 transition-smooth hover:pl-1"
                >
                  <span className="text-sm font-semibold">#{o.id}</span>
                  <span className="text-xs text-charcoal/45">
                    {new Date(o.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <OrderStatusBadge status={o.status} />
                  <span className="text-sm font-bold">{formatPrice(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AccountShell>
  );
}
