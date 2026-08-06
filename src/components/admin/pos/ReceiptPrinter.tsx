"use client";

import React from "react";
import type { WCOrder } from "@/services/woocommerce";
import type { PosCartItem, PosCustomerDetails } from "./PosCartTerminal";
import { formatPrice } from "@/utils/currency";

interface ReceiptPrinterProps {
  order: WCOrder | null;
  items: PosCartItem[];
  totalAmount: number;
  discountAmount: number;
  paymentMethod: string;
  customer: PosCustomerDetails;
  cashReceived?: number;
  changeReturn?: number;
  onNewTransaction: () => void;
}

export function ReceiptPrinter({
  order,
  items,
  totalAmount,
  discountAmount,
  paymentMethod,
  customer,
  cashReceived,
  changeReturn,
  onNewTransaction,
}: ReceiptPrinterProps) {
  const dateStr = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const invoiceNumber = order ? `#POS-${order.id}` : `#POS-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Action Banner (Not printed) */}
      <div className="mb-6 flex w-full flex-col items-center justify-between gap-3 rounded-2xl bg-emerald-600 p-5 text-white shadow-xl sm:flex-row print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 font-bold text-2xl">
            🎉
          </div>
          <div>
            <h3 className="font-display text-lg font-black tracking-tight">
              Transaction Completed &amp; Synced!
            </h3>
            <p className="text-xs text-white/80">
              Order {invoiceNumber} recorded in WooCommerce inventory.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 font-display text-xs font-black text-emerald-800 shadow-sm transition-transform active:scale-95 hover:bg-emerald-50"
          >
            <span>🖨️ PRINT RECEIPT</span>
          </button>
          <button
            onClick={onNewTransaction}
            className="flex-1 sm:flex-none rounded-xl bg-navy px-5 py-2.5 font-display text-xs font-black text-white shadow-sm transition-transform active:scale-95 hover:bg-navy-light"
          >
            NEW BILL →
          </button>
        </div>
      </div>

      {/* Printable Receipt Area (Designed like an 80mm Thermal Bill & A4 Invoice) */}
      <div id="printable-receipt" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl font-mono text-xs text-charcoal print:border-none print:shadow-none print:p-0">
        <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
          <h1 className="font-display font-black text-lg text-navy tracking-tighter">
            FOR THE TRUTH
          </h1>
          <p className="text-[11px] font-sans text-slate-600">
            Christian Literature &amp; Resource Center
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            https://forthetruth.in | Support: +91 98765 43210
          </p>
          <p className="mt-2 text-xs font-bold text-navy bg-slate-100 py-1 rounded-md">
            CASH MEMO / RETAIL INVOICE
          </p>
        </div>

        {/* Details */}
        <div className="space-y-1 mb-4 border-b border-dashed border-slate-300 pb-4 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Bill No:</span>
            <span className="font-bold">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date &amp; Time:</span>
            <span>{dateStr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Mode:</span>
            <span className="font-bold uppercase text-navy">{paymentMethod}</span>
          </div>
          {customer.name && (
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold">{customer.name} ({customer.phone})</span>
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 font-bold text-[11px] text-slate-600 border-b border-slate-300 pb-1.5 mb-2">
          <span className="col-span-6">Item / Title</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-2 text-right">Rate</span>
          <span className="col-span-2 text-right">Total</span>
        </div>

        {/* Line Items */}
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.product.id} className="grid grid-cols-12 text-[11px] leading-tight">
              <span className="col-span-6 font-semibold line-clamp-1">{item.product.name}</span>
              <span className="col-span-2 text-center">{item.quantity}</span>
              <span className="col-span-2 text-right">₹{item.price}</span>
              <span className="col-span-2 text-right font-bold">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Financial Totals */}
        <div className="border-t-2 border-slate-300 pt-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Gross Subtotal:</span>
            <span>₹{items.reduce((a, b) => a + b.price * b.quantity, 0)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between font-bold text-emerald-700">
              <span>Church/Conference Discount:</span>
              <span>− ₹{discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-sm text-navy">
            <span>NET AMOUNT PAYABLE:</span>
            <span>₹{totalAmount}</span>
          </div>
          {paymentMethod === "Cash" && cashReceived !== undefined && (
            <>
              <div className="flex justify-between text-slate-500 pt-1">
                <span>Cash Tendered:</span>
                <span>₹{cashReceived}</span>
              </div>
              <div className="flex justify-between font-bold text-charcoal">
                <span>Change Returned:</span>
                <span>₹{changeReturn || 0}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-6 border-t border-dashed border-slate-300 pt-4 text-center text-[10px] text-slate-500">
          <p className="font-semibold text-charcoal">Thank you for investing in faithful Christian resources!</p>
          <p className="mt-0.5">Please retain this cash memo for exchange within 7 days in original condition.</p>
          <p className="mt-2 text-[9px] text-slate-400">Powered by ABNY Retail Command System</p>
        </div>
      </div>
    </div>
  );
}
