"use client";

import { useState } from "react";
import type { Product, WCCategory } from "@/types/product";
import { PosProductGrid } from "./PosProductGrid";
import { PosCartTerminal, PosCartItem, PosCustomerDetails } from "./PosCartTerminal";
import { PaymentModal } from "./PaymentModal";

interface PosTerminalClientProps {
  initialProducts: Product[];
  categories: WCCategory[];
}

export function PosTerminalClient({ initialProducts, categories }: PosTerminalClientProps) {
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [activePayment, setActivePayment] = useState<{
    discountAmount: number;
    customer: PosCustomerDetails;
    totalAmount: number;
  } | null>(null);

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      const price = parseFloat(product.price || product.regular_price || "0") || 0;
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1, price }];
    });
  };

  const handleUpdateQty = (productId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveItem = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the entire billing register?")) {
      setCart([]);
    }
  };

  const handleProceedToPayment = (discountAmount: number, customer: PosCustomerDetails) => {
    const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const totalAmount = Math.max(0, subtotal - discountAmount);
    setActivePayment({ discountAmount, customer, totalAmount });
  };

  const handleSuccessReset = () => {
    setCart([]);
    setActivePayment(null);
  };

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col p-4 lg:p-6 bg-slate-100 overflow-hidden">
      {/* Top Title Bar */}
      <div className="mb-4 flex flex-col justify-between gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-navy">
            Point of Sale (POS) Cashier Terminal
          </h1>
          <p className="text-xs text-slate-500">
            Instant barcode item lookup, Church tier bulk discounting, and receipt issuance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-200 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
            REGISTER OPEN
          </span>
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-600 shadow-xs">
            {initialProducts.length} Titles Loaded
          </span>
        </div>
      </div>

      {/* Dual-Pane Layout: Left Catalog Grid, Right Register Cart */}
      <div className="flex flex-1 flex-col gap-6 lg:flex-row overflow-hidden">
        <div className="flex-1 min-w-0 h-full overflow-hidden">
          <PosProductGrid
            products={initialProducts}
            categories={categories}
            onAddToCart={handleAddToCart}
          />
        </div>
        <div className="h-full">
          <PosCartTerminal
            items={cart}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClear={handleClear}
            onProceedToPayment={handleProceedToPayment}
          />
        </div>
      </div>

      {/* Checkout Modal Overlay */}
      {activePayment && (
        <PaymentModal
          items={cart}
          discountAmount={activePayment.discountAmount}
          totalAmount={activePayment.totalAmount}
          customer={activePayment.customer}
          onClose={() => setActivePayment(null)}
          onSuccessReset={handleSuccessReset}
        />
      )}
    </div>
  );
}
