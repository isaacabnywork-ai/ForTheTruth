"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getAuthor, type Product } from "@/types/product";
import { formatPrice } from "@/utils/currency";

type ProductStatusFilter = "all" | "publish" | "draft" | "private" | "trash";

export function ProductManagerClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stockVal, setStockVal] = useState("");
  const [priceVal, setPriceVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [syncing, setSyncing] = useState(false);

  const syncCatalog = async (forceRefresh = false) => {
    setSyncing(true);
    try {
      const url = `/api/admin/products?status=any${forceRefresh ? "&refresh=true" : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
        setToastMsg(`Successfully synchronized ${data.products.length} titles from WooCommerce!`);
        setTimeout(() => setToastMsg(""), 3500);
      }
    } catch (err: unknown) {
      console.error("Failed to sync catalog:", err);
      setToastMsg("Sync failed. Check WooCommerce connection.");
      setTimeout(() => setToastMsg(""), 4000);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (products.length === 0) {
      void syncCatalog(false);
    }
  }, []);

  // Filter products by post status and search term
  const publishedCount = products.filter((p) => p.status === "publish").length;
  const draftsCount = products.filter((p) => p.status === "draft").length;
  const privateCount = products.filter((p) => p.status === "private").length;
  const trashCount = products.filter((p) => p.status === "trash").length;
  const allCount = products.length;

  const filtered = products.filter((p) => {
    // 1. Status Filter
    if (statusFilter !== "all") {
      if (p.status !== statusFilter) return false;
    }

    // 2. Search Query
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q) ||
      (getAuthor(p) || "").toLowerCase().includes(q) ||
      p.id.toString().includes(q)
    );
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
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to save stock update.");
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
            Complete inventory overview across all WooCommerce catalog statuses (Published, Drafts, Private, Trash).
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => void syncCatalog(true)}
            disabled={syncing}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-navy shadow-xs transition-all hover:bg-slate-50 hover:border-cta active:scale-95 disabled:opacity-60 cursor-pointer shrink-0"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={syncing ? "animate-spin text-cta" : "text-slate-400"}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{syncing ? "Syncing..." : `Refresh (${products.length} Titles)`}</span>
          </button>
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search titles, authors, IDs, SKUs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* WooCommerce-Style Post Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === "all"
              ? "bg-navy text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span>All</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              statusFilter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {allCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("publish")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === "publish"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-emerald-800 hover:bg-emerald-50/50"
          }`}
        >
          <span>Published</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              statusFilter === "publish" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {publishedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("draft")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === "draft"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-amber-800 hover:bg-amber-50/50"
          }`}
        >
          <span>Drafts</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              statusFilter === "draft" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
            }`}
          >
            {draftsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("private")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === "private"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-purple-800 hover:bg-purple-50/50"
          }`}
        >
          <span>Private</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              statusFilter === "private" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-800"
            }`}
          >
            {privateCount}
          </span>
        </button>

        {trashCount > 0 && (
          <button
            type="button"
            onClick={() => setStatusFilter("trash")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "trash"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-rose-800 hover:bg-rose-50/50"
            }`}
          >
            <span>Trash</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                statusFilter === "trash" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800"
              }`}
            >
              {trashCount}
            </span>
          </button>
        )}
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
              {products.length === 0 && syncing ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="inline-flex flex-col items-center justify-center">
                      <svg
                        className="h-8 w-8 animate-spin text-cta mb-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                      </svg>
                      <p className="font-display text-sm font-bold text-navy">Connecting to WooCommerce API...</p>
                      <p className="text-xs text-slate-400 mt-0.5">Fetching live store products and real-time inventory counts.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    {products.length === 0 ? (
                      <div className="inline-flex flex-col items-center">
                        <p className="font-bold text-slate-600 mb-2">No catalog titles found in memory.</p>
                        <button
                          type="button"
                          onClick={() => void syncCatalog(true)}
                          className="rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy/90"
                        >
                          Fetch from WooCommerce
                        </button>
                      </div>
                    ) : (
                      "No books matching your status and search filters."
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const author = getAuthor(p);
                  const isEditing = editingId === p.id;
                  const qty = typeof p.stock_quantity === "number" ? p.stock_quantity : 0;
                  const thumb = p.images?.[0]?.src || "/images/placeholder.jpg";
                  const postStatus = p.status || "publish";

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
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase ${
                              qty <= 0
                                ? "bg-rose-100 text-rose-800"
                                : qty <= 5
                                ? "bg-amber-100 text-amber-800 animate-pulse"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {qty <= 0 ? "Out of Stock" : qty <= 5 ? "Low Stock" : "In Stock"}
                          </span>

                          {/* Post Status Badge */}
                          {postStatus === "draft" && (
                            <span className="rounded-md bg-amber-50 px-2 py-0.2 text-[9px] font-bold text-amber-800 border border-amber-200">
                              DRAFT
                            </span>
                          )}
                          {postStatus === "private" && (
                            <span className="rounded-md bg-purple-50 px-2 py-0.2 text-[9px] font-bold text-purple-800 border border-purple-200">
                              PRIVATE
                            </span>
                          )}
                          {postStatus === "trash" && (
                            <span className="rounded-md bg-rose-50 px-2 py-0.2 text-[9px] font-bold text-rose-800 border border-rose-200">
                              TRASH
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              disabled={saving}
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-extrabold text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSave(p.id)}
                              disabled={saving}
                              className="rounded-xl bg-cta px-4 py-1.5 font-display text-xs font-black text-white hover:bg-cta-dark shadow-sm cursor-pointer"
                            >
                              {saving ? "..." : "Save"}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(p)}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 font-display text-xs font-bold text-navy hover:bg-navy hover:text-white transition-all shadow-2xs cursor-pointer"
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
