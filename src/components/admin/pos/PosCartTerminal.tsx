"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/types/product";
import { formatPrice } from "@/utils/currency";

export interface PosCartItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface PosCustomerDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface PosCartTerminalProps {
  items: PosCartItem[];
  onUpdateQty: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onClear: () => void;
  onProceedToPayment: (discountAmount: number, customer: PosCustomerDetails) => void;
}

const DISCOUNT_PRESETS = [
  { label: "No Discount", percent: 0 },
  { label: "10% — Small Group / Study", percent: 10 },
  { label: "20% — Church & Pastor Bulk", percent: 20 },
  { label: "30% — Conference Curriculum Kit", percent: 30 },
];

export function PosCartTerminal({
  items,
  onUpdateQty,
  onRemoveItem,
  onClear,
  onProceedToPayment,
}: PosCartTerminalProps) {
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customDiscountRs, setCustomDiscountRs] = useState(0);
  const [customer, setCustomer] = useState<PosCustomerDetails>({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  // Subtotal in ₹
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Discount calculation
  let discountAmount = 0;
  if (customDiscountRs > 0) {
    discountAmount = Math.min(customDiscountRs, subtotal);
  } else if (discountPercent > 0) {
    discountAmount = Math.round((subtotal * discountPercent) / 100);
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleCheckout = () => {
    if (items.length === 0) return;
    onProceedToPayment(discountAmount, customer);
  };

  return (
    <div className="flex h-full w-full flex-col rounded-3xl border border-slate-200 bg-white shadow-xl lg:w-[420px] shrink-0 overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-navy p-4 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold text-navy font-black text-sm shadow-sm">
            🛒
          </div>
          <div>
            <h2 className="font-display text-base font-bold tracking-tight text-white">
              Current Billing Cart
            </h2>
            <p className="text-[11px] text-white/60">
              {totalItems} {totalItems === 1 ? "Book" : "Books"} in Register
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-300 transition-colors hover:bg-rose-500/20"
          >
            Clear Cart
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center text-slate-400">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-3xl opacity-60">
              📖
            </div>
            <p className="text-sm font-bold text-slate-600">Register is empty</p>
            <p className="mt-1 max-w-[220px] text-xs text-slate-400">
              Scan ISBN barcode or tap on any book cover from the catalog to start counter billing.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const thumb = item.product.images?.[0]?.src || "/images/placeholder.jpg";
            const itemTotal = item.price * item.quantity;
            return (
              <div key={item.product.id} className="flex items-center justify-between py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                    <Image src={thumb} alt={item.product.name} fill sizes="44px" className="object-contain p-0.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs font-bold text-charcoal">{item.product.name}</p>
                    <p className="text-[11px] font-medium text-slate-500">
                      ₹{item.price} × {item.quantity} = <span className="font-bold text-navy">₹{itemTotal}</span>
                    </p>
                  </div>
                </div>

                {/* Qty Controls & Trash */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onUpdateQty(item.product.id, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-charcoal transition-colors hover:bg-slate-200 active:scale-95"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-navy">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.product.id, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-charcoal transition-colors hover:bg-slate-200 active:scale-95"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    title="Remove item"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Customer Information Drawer */}
      <div className="border-t border-slate-200 bg-slate-50/70 p-3">
        <button
          onClick={() => setShowCustomerForm((p) => !p)}
          className="flex w-full items-center justify-between text-xs font-bold text-navy hover:text-cta"
        >
          <span className="flex items-center gap-1.5">
            👤 {customer.name || customer.phone ? `Customer: ${customer.name || customer.phone}` : "Attach Customer & Church Info (Optional)"}
          </span>
          <span>{showCustomerForm ? "▲" : "▼"}</span>
        </button>
        {showCustomerForm && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              placeholder="Full Name / Pastor"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 outline-none focus:border-gold"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 outline-none focus:border-gold"
            />
            <input
              type="email"
              placeholder="Email (for electronic bill)"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              className="col-span-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 outline-none focus:border-gold"
            />
            <input
              type="text"
              placeholder="Cashier notes / GST Billing info..."
              value={customer.notes}
              onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
              className="col-span-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 outline-none focus:border-gold"
            />
          </div>
        )}
      </div>

      {/* Discount & Calculations Section */}
      <div className="border-t border-slate-200 bg-slate-50 p-4">
        <div className="mb-3">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
            Church Bulk &amp; Conference Discounts
          </label>
          <select
            value={discountPercent}
            onChange={(e) => {
              setDiscountPercent(Number(e.target.value));
              if (Number(e.target.value) > 0) setCustomDiscountRs(0);
            }}
            disabled={customDiscountRs > 0}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-charcoal outline-none focus:border-gold disabled:opacity-50"
          >
            {DISCOUNT_PRESETS.map((p) => (
              <option key={p.percent} value={p.percent}>
                {p.label}
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Or Flat ₹ Discount:</span>
            <input
              type="number"
              min="0"
              value={customDiscountRs || ""}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                setCustomDiscountRs(val);
                if (val > 0) setDiscountPercent(0);
              }}
              placeholder="₹ 0"
              className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-right text-xs font-bold text-navy outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* Totals Summary */}
        <div className="space-y-1.5 border-t border-slate-200 pt-3 text-sm font-semibold text-slate-600">
          <div className="flex items-center justify-between">
            <span>Subtotal ({totalItems} items):</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-emerald-600 font-bold">
              <span>Discount Applied:</span>
              <span>− {formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-lg font-black text-navy">
            <span>Net Payable Amount:</span>
            <span className="text-cta">{formatPrice(finalTotal)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={items.length === 0}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cta py-3.5 font-display text-sm font-black tracking-wide text-white shadow-lg shadow-cta/25 transition-all duration-200 hover:bg-cta-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          <span>PROCEED TO PAYMENT</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
