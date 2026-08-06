"use client";

import { useState } from "react";
import type { WCOrder } from "@/services/woocommerce";
import { formatPrice } from "@/utils/currency";

export function OrdersLedgerClient({ initialOrders }: { initialOrders: WCOrder[] }) {
  const [orders, setOrders] = useState<WCOrder[]>(initialOrders);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<WCOrder | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFiltered = async (status: string) => {
    setActiveTab(status);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${status}`);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error("Failed to reload orders", e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "all", label: "All Transactions" },
    { id: "completed", label: "Completed (POS & Online)" },
    { id: "processing", label: "Processing (To Ship)" },
    { id: "on_hold", label: "On Hold (Pending Payment)" },
    { id: "cancelled", label: "Cancelled / Refunded" },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="border-b border-slate-200 pb-6 mb-6">
        <h1 className="font-display text-3xl font-black text-navy tracking-tight">
          All Store Orders &amp; Transaction Ledger
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete unified historical ledger across walk-in POS counter bills and online web readers.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 mb-6">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => fetchFiltered(tab.id)}
              disabled={loading}
              className={`rounded-2xl px-5 py-2.5 font-display text-xs font-black tracking-wide transition-all ${
                active
                  ? "bg-navy text-white shadow-lg shadow-navy/20 scale-105"
                  : "bg-slate-200/60 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
        {loading && <span className="text-xs font-bold text-slate-400 animate-pulse ml-2">Refreshing ledger...</span>}
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Order Key / ID</th>
                <th className="py-4 px-6">Source</th>
                <th className="py-4 px-6">Customer Name &amp; Contact</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Items Count</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Net Value (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 font-bold">
                    No orders found matching status: &ldquo;{activeTab.toUpperCase()}&rdquo;.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isPos = order.payment_method_title?.toLowerCase().includes("pos") || order.payment_method === "pos";
                  const fullName = order.billing?.first_name
                    ? `${order.billing.first_name} ${order.billing.last_name || ""}`.trim()
                    : "Walk-in Counter Customer";
                  const totalItems = order.line_items?.reduce((acc, l) => acc + (l.quantity || 0), 0) || 0;

                  const statusColors: Record<string, string> = {
                    completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
                    processing: "bg-sky-100 text-sky-800 border-sky-200",
                    on_hold: "bg-amber-100 text-amber-800 border-amber-200",
                    cancelled: "bg-rose-100 text-rose-800 border-rose-200",
                    refunded: "bg-purple-100 text-purple-800 border-purple-200",
                  };
                  const badgeCls = statusColors[order.status] || "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-navy">
                        #{order.id}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase shadow-2xs ${
                          isPos ? "bg-navy text-gold-light" : "bg-slate-200 text-slate-700"
                        }`}>
                          {isPos ? "🛒 POS IN-STORE" : "🌐 WEB ORDER"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-charcoal">{fullName}</p>
                        <p className="text-xs text-slate-400">{order.billing?.email || order.billing?.phone || "No online contact"}</p>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-semibold">
                        {new Date(order.date_created).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-600">
                        {totalItems} {totalItems === 1 ? "Book" : "Books"}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-extrabold capitalize shadow-2xs ${badgeCls}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-display text-base font-black text-navy">
                        ₹{order.total}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <h3 className="font-display text-xl font-black text-navy">
                  Order Details #{selectedOrder.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Created: {new Date(selectedOrder.date_created).toLocaleString("en-IN")} | Payment: <span className="font-bold text-navy">{selectedOrder.payment_method_title || "Unknown"}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 rounded-2xl bg-slate-50 p-4 text-xs">
              <div>
                <span className="font-extrabold uppercase text-slate-400 tracking-wider block mb-1">Billing / Customer</span>
                <p className="font-bold text-charcoal">{selectedOrder.billing?.first_name} {selectedOrder.billing?.last_name}</p>
                <p className="text-slate-500">{selectedOrder.billing?.email || "No Email"}</p>
                <p className="text-slate-500">Phone: {selectedOrder.billing?.phone || "N/A"}</p>
              </div>
              <div>
                <span className="font-extrabold uppercase text-slate-400 tracking-wider block mb-1">Shipping Destination</span>
                <p className="font-bold text-charcoal">{selectedOrder.shipping?.address_1 || "Store Counter Delivery"}</p>
                <p className="text-slate-500">{selectedOrder.shipping?.city} {selectedOrder.shipping?.postcode}</p>
              </div>
            </div>

            <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Purchased Items</h4>
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 mb-6 border-t border-b border-slate-200 py-2">
              {selectedOrder.line_items?.map((item) => (
                <div key={item.id || item.product_id} className="flex justify-between py-2.5 text-sm">
                  <div>
                    <span className="font-bold text-charcoal">{item.name}</span>
                    <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-600">
                      × {item.quantity}
                    </span>
                  </div>
                  <span className="font-display font-black text-navy">₹{item.total}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-display font-black text-navy">
              <span>Total Amount Settled:</span>
              <span className="text-cta">₹{selectedOrder.total}</span>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-2xl bg-navy px-8 py-3 font-display text-xs font-black text-white hover:bg-navy-light shadow-md"
              >
                CLOSE INSPECTOR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
