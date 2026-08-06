"use client";

import Link from "next/link";
import { formatPrice } from "@/utils/currency";
import type { AdminStatsSnapshot } from "@/services/admin";
import type { WCOrder } from "@/services/woocommerce";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  processing: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-600",
  refunded: "bg-slate-100 text-slate-600",
  "on-hold": "bg-orange-100 text-orange-700",
};

export function AdminDashboardClient({ stats }: { stats: AdminStatsSnapshot }) {
  const kpis = [
    {
      label: "Total Store Revenue",
      value: formatPrice(stats.totalRevenue),
      sub: `${stats.totalOrders} total transactions`,
      dark: false,
    },
    {
      label: "POS Counter Billing",
      value: formatPrice(stats.posRevenue),
      sub: `${stats.posOrderCount} walk-in orders`,
      dark: true,
      badge: "IN-STORE",
    },
    {
      label: "Online Sales",
      value: formatPrice(stats.onlineRevenue),
      sub: `${stats.onlineOrderCount} web orders`,
      dark: false,
    },
    {
      label: "Low Stock Items",
      value: String(stats.lowStockCount),
      sub: "products need attention",
      dark: false,
      alert: stats.lowStockCount > 0,
    },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <h1 className="font-display text-3xl font-black text-navy tracking-tight">
            Executive Command &amp; Retail Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time analytics across online storefront and POS counter operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pos"
            className="flex items-center gap-2 rounded-2xl bg-cta px-6 py-3 font-display text-xs font-black text-white shadow-lg shadow-cta/20 hover:bg-cta-dark transition-all"
          >
            🚀 OPEN POS REGISTER
          </Link>
          <Link
            href="/admin/products"
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-display text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Manage Stock
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-3xl border p-6 shadow-sm transition-transform hover:-translate-y-1 ${
              kpi.dark
                ? "bg-gradient-to-br from-navy to-navy-light text-white border-navy"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-xs font-bold uppercase tracking-wider ${kpi.dark ? "text-gold-light/80" : "text-slate-400"}`}>
                {kpi.label}
              </span>
              {kpi.badge && (
                <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-black text-gold-light">
                  {kpi.badge}
                </span>
              )}
              {kpi.alert && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600">
                  ⚠ LOW
                </span>
              )}
            </div>
            <p className={`mt-2 font-display text-3xl font-black ${kpi.dark ? "text-white" : kpi.alert ? "text-red-600" : "text-navy"}`}>
              {kpi.value}
            </p>
            <p className={`mt-3 text-xs ${kpi.dark ? "text-white/70" : "text-slate-500"}`}>
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-8">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display font-black text-navy">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-cta hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentOrders.map((order: WCOrder) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-bold text-navy">#{order.id}</td>
                  <td className="px-6 py-3 text-slate-600">
                    {order.billing?.first_name} {order.billing?.last_name}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${STATUS_COLORS[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-semibold">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock */}
      {stats.lowStockProducts.length > 0 && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6">
          <h2 className="mb-4 font-display font-black text-red-700">⚠ Low Stock Alert</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm border border-red-100">
                <span className="text-sm font-semibold text-slate-700 truncate">{p.name}</span>
                <span className="ml-3 shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-black text-red-700">
                  {typeof p.stock_quantity === "number" ? `${p.stock_quantity} left` : p.stock_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
