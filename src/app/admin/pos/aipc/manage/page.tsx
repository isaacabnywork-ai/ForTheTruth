"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface AipcBook {
  index: number;
  "S. No": number;
  SKU: string;
  Name: string;
  MRP: number;
  ISBN: string | number;
  "Sale Price": number;
  "AIPC Special Price": number;
  "AIPC QTY": number;
  "AIPC Sold": number;
}

export default function AipcStockManagerPage() {
  const [books, setBooks] = useState<AipcBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Inline edit state
  const [editValues, setEditValues] = useState<Record<number, Partial<AipcBook>>>({});

  // New book form state
  const [newBook, setNewBook] = useState({
    name: "", sku: "", isbn: "", mrp: "", salePrice: "", aipcPrice: "", qty: ""
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/aipc/stock");
    const data = await res.json();
    setBooks(data.map((b: any, i: number) => ({ ...b, index: i })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleFieldChange = (index: number, field: string, value: string | number) => {
    setEditValues(prev => ({
      ...prev,
      [index]: { ...prev[index], [field]: value }
    }));
  };

  const handleSave = async (index: number) => {
    setSaving(index);
    const edits = editValues[index] || {};
    const payload: any = { index };
    if (edits["AIPC QTY"] !== undefined) payload.qty = Number(edits["AIPC QTY"]);
    if (edits["Name"]) payload.name = edits["Name"];
    if (edits["MRP"] !== undefined) payload.mrp = Number(edits["MRP"]);
    if (edits["AIPC Special Price"] !== undefined) payload.aipcPrice = Number(edits["AIPC Special Price"]);

    const res = await fetch("/api/admin/aipc/stock", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(null);
    if (res.ok) {
      showToast("Stock updated successfully!");
      setEditValues(prev => { const n = { ...prev }; delete n[index]; return n; });
      fetchBooks();
    } else {
      showToast("Failed to update stock.", "error");
    }
  };

  const handleReturn = async (index: number, direction: 1 | -1) => {
    // direction: -1 = return (undo a sale), +1 = re-sell (undo a return)
    setSaving(index);
    const res = await fetch("/api/admin/aipc/stock", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, soldAdjust: direction }),
    });
    setSaving(null);
    if (res.ok) {
      showToast(direction === -1 ? "↩ Return recorded — stock restored!" : "↪ Re-sale recorded!");
      fetchBooks();
    } else {
      showToast("Failed to update.", "error");
    }
  };

  const handleDelete = async (index: number, name: string) => {
    if (!confirm(`Delete "${name}" from the AIPC inventory?\n\nThis cannot be undone.`)) return;
    setSaving(index);
    const res = await fetch("/api/admin/aipc/stock", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index }),
    });
    setSaving(null);
    if (res.ok) {
      showToast(`"${name}" deleted from inventory.`);
      fetchBooks();
    } else {
      showToast("Failed to delete book.", "error");
    }
  };

  const handleAddBook = async () => {
    if (!newBook.name.trim()) { showToast("Book name is required.", "error"); return; }
    const res = await fetch("/api/admin/aipc/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newBook.name,
        sku: newBook.sku,
        isbn: newBook.isbn,
        mrp: Number(newBook.mrp) || 0,
        salePrice: Number(newBook.salePrice) || 0,
        aipcPrice: Number(newBook.aipcPrice) || 0,
        qty: Number(newBook.qty) || 0,
      }),
    });
    if (res.ok) {
      showToast("New book added successfully!");
      setNewBook({ name: "", sku: "", isbn: "", mrp: "", salePrice: "", aipcPrice: "", qty: "" });
      setShowAddForm(false);
      fetchBooks();
    } else {
      showToast("Failed to add book.", "error");
    }
  };

  const filtered = books.filter(b =>
    !search || b.Name?.toLowerCase().includes(search.toLowerCase()) || b.SKU?.toLowerCase().includes(search.toLowerCase())
  );

  const getValue = (book: AipcBook, field: keyof AipcBook) =>
    editValues[book.index]?.[field] ?? book[field];

  const isDirty = (index: number) => !!editValues[index] && Object.keys(editValues[index]).length > 0;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-bold shadow-xl text-white transition-all ${toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-navy">AIPC Stock Manager</h1>
          <p className="text-xs text-slate-500 mt-1">Update stock quantities or add new books to the AIPC conference inventory.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/pos/aipc" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-navy shadow-sm transition-colors hover:bg-slate-100">
            ← Back to AIPC POS
          </Link>
          <button
            onClick={() => setShowAddForm(p => !p)}
            className="flex items-center gap-2 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-navy/80"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Add New Book
          </button>
        </div>
      </div>

      {/* Add New Book Form */}
      {showAddForm && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <h2 className="mb-4 font-display text-base font-bold text-emerald-900">➕ Add New Book to AIPC Inventory</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { label: "Book Title *", key: "name", type: "text", span: true },
              { label: "SKU", key: "sku", type: "text", span: false },
              { label: "ISBN", key: "isbn", type: "text", span: false },
              { label: "MRP (₹)", key: "mrp", type: "number", span: false },
              { label: "Sale Price (₹)", key: "salePrice", type: "number", span: false },
              { label: "AIPC Special Price (₹)", key: "aipcPrice", type: "number", span: false },
              { label: "Initial Stock (QTY)", key: "qty", type: "number", span: false },
            ].map(({ label, key, type, span }) => (
              <div key={key} className={span ? "col-span-2 sm:col-span-3 lg:col-span-4" : ""}>
                <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
                <input
                  type={type}
                  value={(newBook as any)[key]}
                  onChange={e => setNewBook(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder={label}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleAddBook} className="rounded-xl bg-emerald-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700">
              Add Book
            </button>
            <button onClick={() => setShowAddForm(false)} className="rounded-xl border border-slate-200 bg-white px-6 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by book title or SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none shadow-sm focus:border-navy"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Book Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3 text-right">MRP (₹)</th>
              <th className="px-4 py-3 text-right">AIPC Price (₹)</th>
              <th className="px-4 py-3 text-center">Sold (↩ Return)</th>
              <th className="px-4 py-3 text-right">Current QTY</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-12 text-center text-sm text-slate-400">Loading inventory...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-sm text-slate-400">No books found.</td></tr>
            ) : filtered.map((book) => (
              <tr key={book.index} className={`border-b border-slate-100 transition-colors ${isDirty(book.index) ? "bg-amber-50" : "hover:bg-slate-50"}`}>
                <td className="px-4 py-2 font-mono text-xs text-slate-400">{book["S. No"]}</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={String(getValue(book, "Name"))}
                    onChange={e => handleFieldChange(book.index, "Name", e.target.value)}
                    className="w-full min-w-[180px] rounded-lg border border-transparent bg-transparent px-2 py-1 font-medium text-navy outline-none focus:border-slate-300 focus:bg-white"
                  />
                </td>
                <td className="px-4 py-2 font-mono text-xs text-slate-500">{book.SKU}</td>
                <td className="px-4 py-2 text-right">
                  <input
                    type="number"
                    value={String(getValue(book, "MRP"))}
                    onChange={e => handleFieldChange(book.index, "MRP", e.target.value)}
                    className="w-20 rounded-lg border border-transparent bg-transparent px-2 py-1 text-right font-medium outline-none focus:border-slate-300 focus:bg-white"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <input
                    type="number"
                    value={String(getValue(book, "AIPC Special Price"))}
                    onChange={e => handleFieldChange(book.index, "AIPC Special Price", e.target.value)}
                    className="w-20 rounded-lg border border-transparent bg-transparent px-2 py-1 text-right font-medium text-emerald-700 outline-none focus:border-slate-300 focus:bg-white"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      title="Undo sale (return 1 book to stock)"
                      onClick={() => handleReturn(book.index, -1)}
                      disabled={saving === book.index || (book["AIPC Sold"] || 0) === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-rose-600">
                      {book["AIPC Sold"] || 0}
                    </span>
                    <button
                      title="Add to sold (re-sell returned book)"
                      onClick={() => handleReturn(book.index, 1)}
                      disabled={saving === book.index || (book["AIPC QTY"] || 0) === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-500 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  <input
                    type="number"
                    min="0"
                    value={String(getValue(book, "AIPC QTY"))}
                    onChange={e => handleFieldChange(book.index, "AIPC QTY", e.target.value)}
                    className={`w-20 rounded-lg border px-2 py-1 text-right font-bold outline-none focus:bg-white ${isDirty(book.index) ? "border-amber-400 bg-amber-50 text-amber-800" : "border-transparent bg-transparent text-navy"}`}
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {isDirty(book.index) && (
                      <button
                        onClick={() => handleSave(book.index)}
                        disabled={saving === book.index}
                        className="rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-navy/80 disabled:opacity-50"
                      >
                        {saving === book.index ? "Saving..." : "Save"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(book.index, String(book.Name))}
                      disabled={saving === book.index}
                      title="Delete this book from AIPC inventory"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-slate-300 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-right text-xs text-slate-400">{filtered.length} of {books.length} books shown</p>
    </div>
  );
}
