"use client";

import { useState } from "react";
import Image from "next/image";
import { getAuthor, type Product } from "@/types/product";
import { formatPrice } from "@/utils/currency";

export function ProductManagerClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stockVal, setStockVal] = useState("");
  const [priceVal, setPriceVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (p.name || "").toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q) || (getAuthor(p) || "").toLowerCase().includes(q);
  });

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setStockVal(typeof p.stock_quantity === "number" ? String(p.stock_quantity) : "10");
    setPriceVal(p.regular_price || p.price || "0");
  };

  const handleSave = async (id: number) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          stock_quantity: Number(stockVal),
          regular_price: priceVal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      // Update local state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                stock_quantity: Number(stockVal),
                regular_price: priceVal,
                price: priceVal,
                stock_status: Number(stockVal) > 0 ? "instock" : "outofstock",
              }
            : p
        )
      );
      setEditingId(null);
      setToastMsg(`Successfully updated inventory for Title #${id}!`);
      setTimeout(() => setToastMsg(""), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to save stock update.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
        <div>
          <h1 className="font-display text-3xl font-black text-navy tracking-tight">
            Book Catalog &amp; Stock Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Inline update of physical retail unit stock counts and pricing without WordPress admin.
          </p>
        </div>
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search titles, authors, SKUs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold shadow-xs"
          />
        </div>
      </div>

      {toastMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg animate-fade-in">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Book Title &amp; Author</th>
                <th className="py-4 px-6">SKU / ID</th>
                <th className="py-4 px-6">Regular Price (₹)</th>
                <th className="py-4 px-6">Stock Quantity</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    No books matching your query.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const author = getAuthor(p);
                  const isEditing = editingId === p.id;
                  const qty = typeof p.stock_quantity === "number" ? p.stock_quantity : 0;
                  const thumb = p.images?.[0]?.src || "/images/placeholder.jpg";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                            <Image src={thumb} alt={p.name} fill sizes="36px" className="object-contain p-0.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-display text-sm font-bold text-navy line-clamp-1">{p.name}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{author || "Unknown Author"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600 font-bold">
                        {p.sku || `#${p.id}`}
                      </td>
                      <td className="py-4 px-6 font-display font-black text-charcoal">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span>₹</span>
                            <input
                              type="number"
                              value={priceVal}
                              onChange={(e) => setPriceVal(e.target.value)}
                              className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm font-bold outline-none focus:border-gold"
                            />
                          </div>
                        ) : (
                          formatPrice(p.regular_price || p.price || "0")
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {isEditing ? (
                          <input
                            type="number"
                            value={stockVal}
                            onChange={(e) => setStockVal(e.target.value)}
                            className="w-20 rounded-lg border border-slate-300 px-2.5 py-1 font-mono text-sm font-bold text-navy outline-none focus:border-gold"
                          />
                        ) : (
                          <span className="font-mono text-sm font-bold text-navy">{qty} units</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black tracking-wider uppercase ${
                            qty <= 0
                              ? "bg-rose-100 text-rose-800"
                              : qty <= 5
                              ? "bg-amber-100 text-amber-800 animate-pulse"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {qty <= 0 ? "Out of Stock" : qty <= 5 ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              disabled={saving}
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-extrabold text-slate-600 hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSave(p.id)}
                              disabled={saving}
                              className="rounded-xl bg-cta px-4 py-1.5 font-display text-xs font-black text-white hover:bg-cta-dark shadow-sm"
                            >
                              {saving ? "..." : "Save"}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(p)}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 font-display text-xs font-bold text-navy hover:bg-navy hover:text-white transition-all shadow-2xs"
                          >
                            Edit Stock →
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
