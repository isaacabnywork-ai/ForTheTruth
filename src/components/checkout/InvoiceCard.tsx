"use client";

import React, { useState } from "react";

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
    image?: string | { id?: number; src: string };
  }[];
  payment_method_title?: string;
  date_created?: string;
  transaction_id?: string;
  total_weight_kg?: number;
  status?: string;
  issuedGiftCards?: Array<{
    code: string;
    recipientEmail: string;
    recipientName: string;
    amount: number;
    designTitle?: string;
  }>;
}

interface InvoiceCardProps {
  order: OrderInvoiceData;
  isFree?: boolean;
}

/** Formats date as DD-MM-YYYY (e.g. 12-09-2026) matching the official store invoice */
function formatInvoiceDate(dateString?: string): string {
  const d = dateString ? new Date(dateString) : new Date();
  if (isNaN(d.getTime())) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}-${now.getFullYear()}`;
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/** Formats prices with ₹ and two decimal places (e.g. ₹249.00, ₹19,378.00) */
function formatInvoicePrice(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0.00";
  return (
    "₹" +
    num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** Crisp barcode SVG mimicking official Code 128 / Code 39 shipping invoice barcodes */
function BarcodeSvg() {
  const bars = [
    3, 1, 1, 2, 4, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 4, 1, 2, 3, 1, 1, 2, 1, 3, 2,
    1, 1, 4, 2, 1, 3, 1, 2, 2, 1, 3, 1, 4, 1, 2, 1, 3, 2, 1, 1, 2, 4, 1, 2, 1,
    3, 2, 1, 1, 2, 3, 1, 4, 2, 1, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 2, 1, 4, 2, 1,
    3, 1, 1, 2, 3, 1, 2, 4, 1, 1, 3, 2, 1, 2, 1, 4,
  ];
  let currentX = 0;
  return (
    <svg
      viewBox="0 0 280 34"
      className="h-8 w-56 sm:w-64 md:w-72 max-w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {bars.map((width, idx) => {
        const x = currentX;
        currentX += width + (idx % 2 === 0 ? 1 : 2);
        if (idx % 2 === 0) {
          return <rect key={idx} x={x} y="0" width={width} height="34" fill="#111827" />;
        }
        return null;
      })}
    </svg>
  );
}

export function InvoiceCard({ order, isFree }: InvoiceCardProps) {
  const [copied, setCopied] = useState(false);

  const formattedDate = formatInvoiceDate(order.date_created);
  const orderNumber = (order as any).number || String(order.id);
  const invoiceNumber = `For The Truth -${orderNumber}`;

  const bill = order.billing || {};
  const ship = order.shipping && Object.keys(order.shipping).length > 0 ? order.shipping : bill;

  const billName = `${bill.first_name || ""} ${bill.last_name || ""}`.trim();
  const shipName = `${ship.first_name || ""} ${ship.last_name || ""}`.trim();

  // Computed subtotal of items
  const itemsSubtotal = order.line_items.reduce((sum, item) => {
    return sum + (parseFloat(item.total) || 0);
  }, 0);

  // Compute discount
  const discountAmount = order.discount_total ? parseFloat(order.discount_total) : 0;

  // Compute shipping
  const shippingCost =
    order.shipping_total != null
      ? parseFloat(order.shipping_total)
      : order.shipping_lines?.[0]?.total != null
      ? parseFloat(order.shipping_lines[0].total)
      : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyDetails = () => {
    const text = `For The Truth - Order #${orderNumber}\nInvoice: ${invoiceNumber}\nDate: ${formattedDate}\nTotal: ${formatInvoicePrice(order.total)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full">
      {/* ── Toolbar Action Bar (Hidden when printing) ── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand bg-white p-4 shadow-sm print:hidden">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal/80">
            Order Invoice &amp; Receipt
          </span>
          <p className="text-[11px] text-charcoal/50">
            Official retail invoice for Order #{orderNumber}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            type="button"
            className="flex items-center rounded-xl bg-navy px-4 py-2 font-display text-xs font-bold text-white shadow-sm transition-all hover:bg-navy-light active:scale-95"
          >
            <span>Print Invoice</span>
          </button>
          <button
            onClick={handlePrint}
            type="button"
            className="flex items-center rounded-xl border border-sand bg-cream/60 px-4 py-2 font-display text-xs font-bold text-charcoal transition-all hover:bg-cream active:scale-95"
            title="Uses your browser print dialog to save as PDF"
          >
            <span>Download PDF</span>
          </button>
          <button
            onClick={handleCopyDetails}
            type="button"
            className="flex items-center rounded-xl border border-sand bg-white px-3 py-2 font-display text-xs font-semibold text-charcoal/70 transition-all hover:text-charcoal active:scale-95"
          >
            <span>{copied ? "Copied" : "Copy Details"}</span>
          </button>
        </div>
      </div>

      {/* ── Official Printable Invoice Document (Matches Reference PDF Format) ── */}
      <div
        id="order-invoice"
        className="w-full rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 md:p-12 shadow-sm text-slate-800 font-sans print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none"
      >
        {/* Top Header: INVOICE + Logo on left, Barcode + From Address on right */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6">
          {/* Top Left: INVOICE + forthetruth. */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#00A3FF] tracking-tight">
              INVOICE
            </h1>
            <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight select-none">
              <span className="text-black">for</span>
              <span className="text-[#00A3FF]">the</span>
              <span className="text-black">truth.</span>
            </div>
          </div>

          {/* Top Right: Barcode + From Address */}
          <div className="flex flex-col sm:items-end text-left sm:text-right">
            <BarcodeSvg />
            <div className="mt-3 text-xs sm:text-[13px] text-slate-800 leading-snug">
              <p className="font-bold text-black">From Address:</p>
              <p>For The Truth</p>
              <p>Kahlon Emporium III, plot 01G/A, &amp; 01G/B</p>
              <p>Raibareilly road Vrindavan Yojna</p>
              <p>Lucknow 226029</p>
              <p>Uttar Pradesh</p>
              <p>+918604685533</p>
              <p>GSTIN: 09AADCF8603Q1Z2</p>
            </div>
          </div>
        </div>

        {/* 3-Column Address & Order Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 pb-8 text-xs sm:text-[13px] text-slate-800 leading-snug">
          {/* Column 1: Billing Address */}
          <div>
            <p className="font-bold text-black">Billing Address:</p>
            <p className="mt-1">{billName || "Customer"}</p>
            {bill.address_1 && <p>{bill.address_1}</p>}
            {bill.address_2 && <p>{bill.address_2}</p>}
            {bill.city && <p>{bill.city}</p>}
            {bill.postcode && <p>{bill.postcode}</p>}
            {bill.state && <p>{bill.state}</p>}
            {bill.phone && <p className="mt-0.5">Phone: {bill.phone}</p>}
          </div>

          {/* Column 2: Shipping Address */}
          <div>
            <p className="font-bold text-black">Shipping Address:</p>
            <p className="mt-1">{shipName || billName || "Customer"}</p>
            {(ship.address_1 || bill.address_1) && <p>{ship.address_1 || bill.address_1}</p>}
            {(ship.address_2 || bill.address_2) && <p>{ship.address_2 || bill.address_2}</p>}
            {(ship.city || bill.city) && <p>{ship.city || bill.city}</p>}
            {(ship.postcode || bill.postcode) && <p>{ship.postcode || bill.postcode}</p>}
            {(ship.state || bill.state) && <p>{ship.state || bill.state}</p>}
            {(ship.phone || bill.phone) && <p className="mt-0.5">{ship.phone || bill.phone}</p>}
          </div>

          {/* Column 3: Invoice Meta */}
          <div className="sm:text-right space-y-1">
            <p>
              <span className="font-bold text-black">Invoice Date: </span>
              <span>{formattedDate}</span>
            </p>
            <p>
              <span className="font-bold text-black">Invoice No.: </span>
              <span>{invoiceNumber}</span>
            </p>
            <p>
              <span className="font-bold text-black">Order No.: </span>
              <span>#{orderNumber}</span>
            </p>
            <p>
              <span className="font-bold text-black">Order Date: </span>
              <span>{formattedDate}</span>
            </p>
          </div>
        </div>

        {/* Itemized Products Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-t border-b border-black text-black font-bold">
                <th className="py-2.5 px-2 text-center w-12">S.No</th>
                <th className="py-2.5 px-3 text-center w-20">Image</th>
                <th className="py-2.5 px-4 text-left">Product</th>
                <th className="py-2.5 px-3 text-center w-20">Quantity</th>
                <th className="py-2.5 px-4 text-right w-28">Price</th>
                <th className="py-2.5 px-4 text-right w-32">Total price</th>
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

                const imgSrc =
                  typeof item.image === "string"
                    ? item.image
                    : item.image?.src;

                return (
                  <tr key={item.id || idx} className="align-middle">
                    <td className="py-3 px-2 text-center text-slate-800">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={item.name}
                            className="w-11 h-11 object-contain rounded border border-slate-200"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                            FTT
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-normal text-slate-900 leading-snug max-w-md">
                        {item.name}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-800">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800 whitespace-nowrap">
                      {formatInvoicePrice(unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800 whitespace-nowrap">
                      {formatInvoicePrice(totalNum)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Summary (Right-aligned) */}
        <div className="mt-8 flex flex-col items-end text-xs sm:text-sm text-slate-800">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between items-center py-1">
              <span>Subtotal</span>
              <span className="font-medium whitespace-nowrap">
                {formatInvoicePrice(itemsSubtotal)}
              </span>
            </div>

            {shippingCost > 0 && (
              <div className="flex justify-between items-center py-1">
                <span>Shipping</span>
                <span className="font-medium whitespace-nowrap">
                  {formatInvoicePrice(shippingCost)}
                </span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between items-center py-1 text-slate-800">
                <span>Cart Discount</span>
                <span className="font-medium whitespace-nowrap">
                  -{formatInvoicePrice(discountAmount)}
                </span>
              </div>
            )}

            <div className="border-t border-slate-300 pt-2.5 mt-2 flex justify-between items-center font-bold text-black text-sm sm:text-base">
              <span>Total</span>
              <span className="whitespace-nowrap">
                {formatInvoicePrice(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
