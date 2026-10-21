"use client";

import React, { useState } from "react";
import { formatPrice } from "@/utils/currency";

export interface OrderInvoiceData {
  id: number;
  total: string;
  subtotal?: string;
  shipping_total?: string;
  discount_total?: string;
  shipping_lines?: { method_title: string; total: string }[];
  billing: Record<string, string>;
  shipping?: Record<string, string>;
  line_items: {
    id: number;
    name: string;
    quantity: number;
    total: string;
    price?: number | string;
    product_id?: number;
  }[];
  payment_method_title?: string;
  date_created?: string;
  transaction_id?: string;
  total_weight_kg?: number;
  status?: string;
}

interface InvoiceCardProps {
  order: OrderInvoiceData;
  isFree?: boolean;
}

export function InvoiceCard({ order, isFree }: InvoiceCardProps) {
  const [copied, setCopied] = useState(false);

  const formattedDate = order.date_created
    ? new Date(order.date_created).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });

  const invoiceNumber = `FTT-INV-${order.id}`;
  const isFreeOrder = isFree || parseFloat(order.total) === 0;

  // Extract address data safely
  const bill = order.billing || {};
  const ship = order.shipping && Object.keys(order.shipping).length > 0 ? order.shipping : bill;

  // Compute calculated subtotal
  const itemsSubtotal = order.line_items.reduce((sum, item) => {
    return sum + (parseFloat(item.total) || 0);
  }, 0);

  // Extract shipping charges & method
  const shippingTitle =
    order.shipping_lines?.[0]?.method_title ||
    (ship.address_1?.includes("Store Pickup")
      ? "Store Pickup (In-Store)"
      : "Standard Shipping (India)");

  const shippingCost =
    order.shipping_total != null
      ? parseFloat(order.shipping_total)
      : order.shipping_lines?.[0]?.total != null
      ? parseFloat(order.shipping_lines[0].total)
      : Math.max(0, parseFloat(order.total) - itemsSubtotal);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyDetails = () => {
    const text = `For The Truth - Order #${order.id}\nInvoice: ${invoiceNumber}\nDate: ${formattedDate}\nTotal: ${isFreeOrder ? "FREE" : formatPrice(order.total)}\nStatus: Paid`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full">
      {/* ── Toolbar Action Bar (Hidden when printing) ── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand bg-white p-4 shadow-sm print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold-dark font-black">
            🧾
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/80">
              Tax Invoice &amp; Receipt
            </span>
            <p className="text-[11px] text-charcoal/50">
              Official retail bill for Order #{order.id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 font-display text-xs font-bold text-white shadow-sm transition-all hover:bg-navy-light active:scale-95"
          >
            <span>🖨️</span>
            <span>Print Invoice</span>
          </button>
          <button
            onClick={handlePrint}
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-sand bg-cream/60 px-4 py-2 font-display text-xs font-bold text-charcoal transition-all hover:bg-cream active:scale-95"
            title="Uses your browser print dialog to save as PDF"
          >
            <span>📥</span>
            <span>Download PDF</span>
          </button>
          <button
            onClick={handleCopyDetails}
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-sand bg-white px-3 py-2 font-display text-xs font-semibold text-charcoal/70 transition-all hover:text-charcoal active:scale-95"
          >
            {copied ? "✓ Copied" : "📋 Copy"}
          </button>
        </div>
      </div>

      {/* ── Official Printable Tax Invoice Document ── */}
      <div
        id="order-invoice"
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card print:border-none print:shadow-none print:rounded-none"
      >
        {/* Invoice Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-cream/30 to-slate-50 p-6 md:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Store Information */}
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-gradient text-white font-black text-sm shadow-gold">
                  📖
                </span>
                <span className="font-display text-2xl font-black tracking-tight text-navy">
                  FOR THE TRUTH
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-charcoal/70">
                Christian Literature &amp; Reformed Resource Center
              </p>
              <div className="mt-2 space-y-0.5 text-[11px] text-charcoal/60">
                <p>Website: <span className="font-semibold text-navy">https://forthetruth.in</span></p>
                <p>Email: <span className="font-semibold text-navy">contact@forthetruth.in</span></p>
                <p>Helpline / WhatsApp: <span className="font-semibold text-navy">+91 86046 85533</span></p>
                <p>Origin: Uttar Pradesh, India</p>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="flex flex-col sm:items-end text-left sm:text-right">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                PAID &amp; CONFIRMED
              </span>
              <h2 className="mt-2 font-display text-base font-black text-charcoal">
                TAX INVOICE / CASH MEMO
              </h2>
              <div className="mt-2 space-y-1 text-xs text-charcoal/70">
                <p>
                  <span className="text-charcoal/45">Invoice No: </span>
                  <span className="font-mono font-bold text-navy">{invoiceNumber}</span>
                </p>
                <p>
                  <span className="text-charcoal/45">Order ID: </span>
                  <span className="font-mono font-bold text-gold-dark">#{order.id}</span>
                </p>
                <p>
                  <span className="text-charcoal/45">Date: </span>
                  <span className="font-medium">{formattedDate}</span>
                </p>
                <p>
                  <span className="text-charcoal/45">Payment Method: </span>
                  <span className="font-semibold text-charcoal">
                    {isFreeOrder ? "Free Order" : (order.payment_method_title || "Razorpay (Online Payment)")}
                  </span>
                </p>
                {order.transaction_id && (
                  <p>
                    <span className="text-charcoal/45">Transaction ID: </span>
                    <span className="font-mono text-[10px] text-charcoal/60">{order.transaction_id}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Section (Billed To & Shipped To) */}
        <div className="grid grid-cols-1 border-b border-slate-200 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          {/* Billed To */}
          <div className="p-6">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Billed To (Customer)
            </span>
            <p className="mt-2 text-sm font-bold text-charcoal">
              {bill.first_name || "Customer"} {bill.last_name || ""}
            </p>
            {bill.address_1 && (
              <p className="mt-1 text-xs text-charcoal/70 leading-relaxed">
                {bill.address_1}
              </p>
            )}
            {(bill.city || bill.state || bill.postcode) && (
              <p className="text-xs text-charcoal/70">
                {[bill.city, bill.state, bill.postcode].filter(Boolean).join(", ")}
              </p>
            )}
            <p className="text-xs text-charcoal/70 font-medium">
              {bill.country === "IN" ? "India" : bill.country || "India"}
            </p>
            <div className="mt-2 text-xs text-charcoal/60 space-y-0.5">
              {bill.phone && <p>📞 {bill.phone}</p>}
              {bill.email && <p>✉️ {bill.email}</p>}
            </div>
          </div>

          {/* Shipped To */}
          <div className="p-6">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Shipped To (Delivery Destination)
            </span>
            <p className="mt-2 text-sm font-bold text-charcoal">
              {ship.first_name || bill.first_name || "Customer"} {ship.last_name || bill.last_name || ""}
            </p>
            {ship.address_1 && (
              <p className="mt-1 text-xs text-charcoal/70 leading-relaxed">
                {ship.address_1}
              </p>
            )}
            {(ship.city || ship.state || ship.postcode) && (
              <p className="text-xs text-charcoal/70">
                {[ship.city, ship.state, ship.postcode].filter(Boolean).join(", ")}
              </p>
            )}
            <p className="text-xs text-charcoal/70 font-medium">
              {ship.country === "IN" ? "India" : ship.country || "India"}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              <span>🚚 Delivery Method:</span>
              <span className="font-bold text-navy">{shippingTitle}</span>
            </div>
          </div>
        </div>

        {/* Itemized Table of Books */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                <th className="py-3 px-6 w-12 text-center">#</th>
                <th className="py-3 px-6">Book Description</th>
                <th className="py-3 px-4 text-center w-20">Qty</th>
                <th className="py-3 px-4 text-right w-28">Unit Price</th>
                <th className="py-3 px-6 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.line_items.map((item, idx) => {
                const totalNum = parseFloat(item.total) || 0;
                const unitPrice =
                  item.price != null
                    ? parseFloat(String(item.price))
                    : item.quantity > 0
                    ? totalNum / item.quantity
                    : 0;

                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 text-center font-mono text-charcoal/40 font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-6">
                      <p className="font-semibold text-charcoal text-sm">{item.name}</p>
                      <p className="text-[10px] text-charcoal/50">Standard Edition / Hardcover / Paperback</p>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-navy">
                      ×{item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-charcoal/75">
                      {unitPrice === 0 ? "FREE" : formatPrice(unitPrice)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold text-charcoal">
                      {totalNum === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        formatPrice(totalNum)
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation & Breakdown */}
        <div className="border-t border-slate-200 bg-slate-50/40 p-6">
          <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Notes & Dispatch Info */}
            <div className="max-w-sm space-y-2 text-[11px] text-charcoal/60 leading-relaxed">
              <p className="font-bold text-navy uppercase tracking-wider text-[10px]">
                Dispatch &amp; Delivery Terms:
              </p>
              <p>
                ✓ All books are packed with moisture-resistant multi-layer cushioning.
              </p>
              <p>
                ✓ Orders dispatched via premier registered couriers (Delhivery, BlueDart, IndiaPost).
              </p>
              <p>
                ✓ Tracking details are sent to your registered WhatsApp &amp; Email upon handover.
              </p>
            </div>

            {/* Calculations Box */}
            <div className="w-full sm:w-80 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-charcoal/60">Items Subtotal:</span>
                <span className="font-semibold text-charcoal">{formatPrice(itemsSubtotal)}</span>
              </div>

              {/* Explicit Shipping Charges */}
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <div className="flex flex-col">
                  <span className="text-charcoal/60 font-medium">Shipping Charges:</span>
                  <span className="text-[10px] text-slate-400 font-sans">{shippingTitle}</span>
                </div>
                <span className="font-semibold text-charcoal">
                  {shippingCost === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>

              {/* Discount if present */}
              {order.discount_total && parseFloat(order.discount_total) > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                  <span>Coupon Discount:</span>
                  <span className="font-semibold">−{formatPrice(order.discount_total)}</span>
                </div>
              )}

              {/* Grand Total Paid */}
              <div className="flex items-center justify-between rounded-xl bg-gold/15 p-3.5 mt-2 border border-gold/30">
                <div>
                  <span className="font-display font-black text-sm uppercase tracking-wider text-navy">
                    Total Paid:
                  </span>
                  <p className="text-[10px] text-navy/70">Inclusive of all taxes &amp; shipping</p>
                </div>
                <span className="font-display text-xl font-black text-gold-dark">
                  {isFreeOrder ? "FREE" : formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Footer Seal */}
        <div className="border-t border-dashed border-slate-200 px-6 py-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-charcoal/50">
          <div>
            <p className="font-bold text-navy">For The Truth Bookstore</p>
            <p>Computer-generated invoice. No physical signature required.</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-emerald-700">Thank you for your fellowship &amp; support!</p>
            <p>https://forthetruth.in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
