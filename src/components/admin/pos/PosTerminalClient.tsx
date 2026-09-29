"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Product, WCCategory } from "@/types/product";
import { PosProductGrid } from "./PosProductGrid";
import { PosCartTerminal, PosCartItem, PosCustomerDetails } from "./PosCartTerminal";
import { PaymentModal } from "./PaymentModal";

const HOLD_STORAGE_KEY = "pos_held_orders";

interface HeldOrder {
  id: string;
  heldAt: string;
  items: PosCartItem[];
  label: string; // e.g. "Customer #1 — 3 books"
}

interface PosTerminalClientProps {
  initialProducts: Product[];
  categories: WCCategory[];
  submitApiUrl?: string;
  showExportButton?: boolean;
}

export function PosTerminalClient({ initialProducts, categories, submitApiUrl, showExportButton }: PosTerminalClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [showHeldPanel, setShowHeldPanel] = useState(false);
  const [activePayment, setActivePayment] = useState<{
    discountAmount: number;
    customer: PosCustomerDetails;
    totalAmount: number;
  } | null>(null);

  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [refundingId, setRefundingId] = useState<number | null>(null);

  const [exchangeCredit, setExchangeCredit] = useState<{ originalOrderId: number; amount: number } | null>(null);

  // Load book cover images asynchronously after POS opens — doesn't block render
  useEffect(() => {
    async function loadImages() {
      try {
        const res = await fetch("/api/admin/aipc/images", { cache: "no-store" });
        if (!res.ok) return;
        const { images } = await res.json() as { images: Record<string, string> };
        if (!images || Object.keys(images).length === 0) return;

        setProducts((prev) =>
          prev.map((p) => {
            const skuKey = p.sku?.toLowerCase().trim() ?? "";
            const nameKey = p.name?.toLowerCase().trim() ?? "";
            const cleanKey = p.name?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
            const imgUrl = images[skuKey] || images[nameKey] || images[cleanKey];
            if (imgUrl && (!p.images || p.images.length === 0)) {
              return { ...p, images: [{ id: 0, src: imgUrl, alt: p.name }] };
            }
            return p;
          })
        );
      } catch {
        // Images are cosmetic — silently fail
      }
    }
    void loadImages();
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/admin/aipc/orders");
      if (res.ok) {
        setRecentOrders(await res.json());
      }
    } catch {}
    setLoadingOrders(false);
  };

  const handleRefund = async (orderId: number) => {
    if (!confirm("Are you sure you want to refund this order? If paid via Razorpay, this will issue a live financial refund to the customer and return books to stock.")) return;
    
    setRefundingId(orderId);
    try {
      const res = await fetch("/api/admin/aipc/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Refund processed successfully!");
        fetchOrders();
      } else {
        alert(`Refund failed: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Refund failed: ${err.message}`);
    }
    setRefundingId(null);
  };

  const handleEditOrder = async (order: any) => {
    if (!confirm("This will load the order items back into the register for adjustment, WITHOUT issuing a Razorpay refund (stock will be returned). You can then collect or refund the cash difference. Continue?")) return;
    
    setRefundingId(order.id);
    try {
      const res = await fetch("/api/admin/aipc/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action: "exchange" }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Failed to refund before edit: ${data.error}`);
        setRefundingId(null);
        return;
      }
      
      // Load items back into the cart
      const newCart: PosCartItem[] = [];
      for (const item of order.lineItems) {
        const product = initialProducts.find(p => p.id === item.product_id);
        if (product) {
           newCart.push({
             product,
             quantity: item.quantity,
             price: Number(item.total) / item.quantity
           });
        }
      }
      
      setCart(newCart);
      setExchangeCredit({ originalOrderId: order.id, amount: order.totalAmount });
      setShowOrdersPanel(false);
      fetchOrders(); // Refresh background state
      alert(`Ready to adjust! Customer has a pre-paid credit of ₹${order.totalAmount} from the old order.`);
    } catch (err: any) {
      alert(`Edit failed: ${err.message}`);
    }
    setRefundingId(null);
  };

  // Load held orders from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HOLD_STORAGE_KEY);
      if (saved) setHeldOrders(JSON.parse(saved));
    } catch {}
  }, []);

  const saveHeldOrders = (orders: HeldOrder[]) => {
    setHeldOrders(orders);
    localStorage.setItem(HOLD_STORAGE_KEY, JSON.stringify(orders));
  };

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
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the entire billing register?")) {
      setCart([]);
      setExchangeCredit(null);
    }
  };

  // ── Hold Order ──────────────────────────────────────────────────────────────
  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    const totalBooks = cart.reduce((s, i) => s + i.quantity, 0);
    const firstName = cart[0].product.name.split(" ").slice(0, 2).join(" ");
    const newHold: HeldOrder = {
      id: Date.now().toString(),
      heldAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      items: cart,
      label: `${totalBooks} book${totalBooks !== 1 ? "s" : ""} — "${firstName}..."`,
    };
    saveHeldOrders([...heldOrders, newHold]);
    setCart([]);
  };

  const handleResumeOrder = (hold: HeldOrder) => {
    if (cart.length > 0 && !confirm("This will replace your current cart with the held order. Continue?")) return;
    setCart(hold.items);
    saveHeldOrders(heldOrders.filter((h) => h.id !== hold.id));
    setShowHeldPanel(false);
  };

  const handleDeleteHold = (id: string) => {
    saveHeldOrders(heldOrders.filter((h) => h.id !== id));
  };
  // ────────────────────────────────────────────────────────────────────────────

  const handleProceedToPayment = (discountAmount: number, customer: PosCustomerDetails) => {
    const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const totalAmount = Math.max(0, subtotal - discountAmount);
    setActivePayment({ discountAmount, customer, totalAmount });
  };

  const handleSuccessReset = () => {
    setCart([]);
    setActivePayment(null);
    setExchangeCredit(null);
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
            {products.length} Titles Loaded
          </span>

          {/* Held Orders Badge */}
          {heldOrders.length > 0 && (
            <button
              onClick={() => setShowHeldPanel(true)}
              className="relative flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 shadow-xs transition-colors hover:bg-amber-100"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
              {heldOrders.length} On Hold
            </button>
          )}

          <button
            onClick={() => { setShowOrdersPanel(true); fetchOrders(); }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-navy shadow-sm transition-colors hover:bg-slate-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            History &amp; Refunds
          </button>

          {showExportButton && (
            <>
              <Link
                href="/admin/pos/aipc/manage"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-navy transition-colors hover:bg-slate-100 shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Manage Stock
              </Link>
              <a
                href="/api/admin/aipc/export"
                download
                className="flex items-center gap-2 rounded-xl bg-navy px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-navy/80 shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export Sales &amp; Stock
              </a>
            </>
          )}
        </div>
      </div>

      {/* Dual-Pane Layout */}
      <div className="flex flex-1 flex-col gap-6 lg:flex-row overflow-hidden">
        <div className="flex-1 min-w-0 h-full overflow-hidden">
          <PosProductGrid
            products={products}
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
            onHoldOrder={handleHoldOrder}
            onProceedToPayment={handleProceedToPayment}
          />
        </div>
      </div>

      {/* Checkout Modal */}
      {activePayment && (
        <PaymentModal
          items={cart}
          discountAmount={activePayment.discountAmount}
          totalAmount={activePayment.totalAmount}
          customer={activePayment.customer}
          onClose={() => setActivePayment(null)}
          onSuccessReset={handleSuccessReset}
          submitApiUrl={submitApiUrl}
          exchangeCredit={exchangeCredit}
        />
      )}

      {/* ── Held Orders Side Panel ───────────────────────────────────────────── */}
      {showHeldPanel && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm" onClick={() => setShowHeldPanel(false)}>
          <div
            className="flex h-full w-full max-w-sm flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50 px-5 py-4">
              <div>
                <h2 className="font-display text-base font-bold text-navy">Held Orders</h2>
                <p className="text-xs text-slate-500">{heldOrders.length} order{heldOrders.length !== 1 ? "s" : ""} parked — click to resume</p>
              </div>
              <button onClick={() => setShowHeldPanel(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {/* Held Orders List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {heldOrders.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-10">No held orders.</p>
              ) : heldOrders.map((hold) => (
                <div key={hold.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-navy">{hold.label}</p>
                      <p className="text-xs text-slate-500">Held at {hold.heldAt}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteHold(hold.id)}
                      title="Discard this held order"
                      className="mt-0.5 shrink-0 rounded-lg p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                  <ul className="mb-3 space-y-1">
                    {hold.items.map((item) => (
                      <li key={item.product.id} className="flex justify-between text-xs text-slate-600">
                        <span className="truncate mr-2">{item.product.name}</span>
                        <span className="shrink-0 font-bold">×{item.quantity} — ₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleResumeOrder(hold)}
                    className="w-full rounded-xl bg-navy py-2 text-xs font-bold text-white transition-colors hover:bg-navy/80"
                  >
                    ▶ Resume This Order
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Order History & Refunds Side Panel ───────────────────────────────────────────── */}
      {showOrdersPanel && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 backdrop-blur-sm" onClick={() => setShowOrdersPanel(false)}>
          <div
            className="flex h-full w-full max-w-[450px] flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-navy px-5 py-4 text-white">
              <div>
                <h2 className="font-display text-base font-bold text-white">Recent Orders &amp; Refunds</h2>
                <p className="text-xs text-slate-300">View history and process Razorpay refunds</p>
              </div>
              <button onClick={() => setShowOrdersPanel(false)} className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20">✕</button>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {loadingOrders ? (
                <div className="py-12 text-center text-slate-400">Loading history...</div>
              ) : recentOrders.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">No orders found.</div>
              ) : recentOrders.map((order) => {
                const isRazorpay = order.notes?.includes("Razorpay ID");
                return (
                  <div key={order.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${order.refunded ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'}`}>
                    <div className="mb-3 flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <p className="font-bold text-sm text-navy">Order #{order.id}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(order.date).toLocaleString('en-IN')}
                        </p>
                        {order.customerPhone && (
                          <p className="mt-1 text-xs font-bold text-navy bg-slate-100 inline-block px-2 py-0.5 rounded-md">
                            +91 {order.customerPhone}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-display text-base font-black text-emerald-700">₹{order.totalAmount}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{order.paymentMethod}</p>
                      </div>
                    </div>
                    
                    <ul className="mb-4 space-y-1">
                      {order.lineItems.map((item: any, i: number) => (
                        <li key={i} className="flex justify-between text-xs text-slate-600">
                          <span className="font-medium">{item.quantity}x Item (ID: {item.product_id})</span>
                          <span className="font-bold">₹{item.total}</span>
                        </li>
                      ))}
                    </ul>

                    {order.refunded ? (
                      <div className="rounded-lg bg-rose-100 px-3 py-2 text-center text-xs font-bold text-rose-700">
                        {order.refundType === "exchange" ? "Adjusted / Exchanged on" : "Refunded on"} {new Date(order.refundedAt).toLocaleString('en-IN')}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEditOrder(order)}
                          disabled={refundingId === order.id}
                          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-navy transition-colors hover:bg-slate-50 disabled:opacity-50 shadow-sm"
                        >
                          {refundingId === order.id ? "Processing..." : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                              </svg>
                              Edit / Exchange Order
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRefund(order.id)}
                          disabled={refundingId === order.id}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50"
                        >
                          {refundingId === order.id ? "Processing..." : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                <path d="M3 3v5h5"/>
                              </svg>
                              {isRazorpay ? "Issue Razorpay Refund & Return Stock" : "Mark Refunded & Return Stock"}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


