"use client";

import type { WCCategory } from "@/types/product";
import type { CustomCategoryShelf } from "@/types/curation";

interface CustomCategoryShelfEditorProps {
  shelf: CustomCategoryShelf;
  displayNumber: number;
  customIndex: number;
  totalCustomCount: number;
  availableCategories: WCCategory[];
  pendingDelete: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onMove: (dir: "prev" | "next") => void;
  onUpdate: (updates: Partial<CustomCategoryShelf>) => void;
}

export function CustomCategoryShelfEditor({
  shelf,
  displayNumber,
  customIndex,
  totalCustomCount,
  availableCategories,
  pendingDelete,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  onMove,
  onUpdate,
}: CustomCategoryShelfEditorProps) {
  const isDynamicMode = shelf.mode !== "manual";
  const selectedCategory =
    typeof shelf.categoryId === "number"
      ? availableCategories.find((c) => c.id === shelf.categoryId)
      : undefined;
  const activeCatName =
    shelf.categoryName || selectedCategory?.name || (shelf.categoryId ? `Category #${shelf.categoryId}` : "");

  const handleCategorySelect = (rawId: string) => {
    const catId = Number(rawId);
    if (!catId || isNaN(catId)) {
      onUpdate({
        categoryId: undefined,
        categorySlug: undefined,
        categoryName: undefined,
      });
      return;
    }

    const cat = availableCategories.find((c) => c.id === catId);
    if (!cat) {
      onUpdate({ categoryId: catId });
      return;
    }

    const isDefaultTitle =
      !shelf.title.trim() || /^Category Section \d+$/i.test(shelf.title.trim());
    const shouldAutoLink =
      !shelf.viewAllHref || shelf.viewAllHref.startsWith("/categories/");

    onUpdate({
      categoryId: cat.id,
      categorySlug: cat.slug,
      categoryName: cat.name,
      title: isDefaultTitle ? cat.name : shelf.title,
      viewAllHref: shouldAutoLink ? `/categories/${cat.slug}` : shelf.viewAllHref,
    });
  };

  return (
    <div className="space-y-5">
      {/* Header Controls for Custom Section */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gold/30 bg-gold/5 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-navy px-2.5 py-1 font-mono text-[11px] font-black text-gold-light">
            Section #{displayNumber}
          </span>
          <span className="text-xs font-bold text-slate-600">
            Custom Homepage Category Shelf
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onMove("prev")}
            disabled={customIndex === 0}
            title="Move section earlier"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => onMove("next")}
            disabled={customIndex >= totalCustomCount - 1}
            title="Move section later"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            ▶
          </button>

          {pendingDelete ? (
            <div className="flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={onConfirmDelete}
                className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700 cursor-pointer"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={onCancelDelete}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onRequestDelete}
              className="ml-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
            >
              🗑 Remove Section
            </button>
          )}
        </div>
      </div>

      {/* Section Title */}
      <div>
        <label className="text-xs font-bold text-slate-600 block mb-1">
          Shelf Title for &ldquo;{displayNumber}. {shelf.title || "Untitled Section"}&rdquo;:
        </label>
        <input
          type="text"
          value={shelf.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder={`Category Section ${displayNumber}`}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-display text-sm font-extrabold text-navy outline-none focus:border-gold"
        />
      </div>

      {/* Display Mode Selector */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-navy">
              Homepage Display Mode
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Rotate books dynamically from category on refresh, or lock to specific book IDs.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => onUpdate({ mode: "category" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                isDynamicMode
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-navy"
              }`}
            >
              🎲 Dynamic Category (Auto-rotates)
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ mode: "manual" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                !isDynamicMode
                  ? "bg-navy text-white shadow-xs"
                  : "text-slate-600 hover:text-navy"
              }`}
            >
              📌 Specific Book IDs
            </button>
          </div>
        </div>

        {isDynamicMode ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  WooCommerce Category (for Auto-Rotation):
                </label>
                <select
                  value={shelf.categoryId ?? ""}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-navy outline-none focus:border-gold"
                >
                  <option value="">-- Select a Store Category --</option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} (ID: {cat.id}
                      {typeof cat.count === "number" ? ` · ${cat.count} books` : ""})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Or Category ID:
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 112"
                  value={shelf.categoryId ?? ""}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-bold text-navy outline-none focus:border-gold"
                />
              </div>
            </div>

            {shelf.categoryId ? (
              <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-medium leading-relaxed">
                <span className="text-base shrink-0">🎲</span>
                <div>
                  <strong>Dynamic Category Auto-Rotation Active:</strong> Every visitor page refresh displays 6 freshly shuffled books from <strong>{activeCatName}</strong> (ID: {shelf.categoryId}).
                  <span className="text-emerald-700 block mt-1">
                    Your {shelf.bookIds.length} book IDs below are preserved and used as fallback if WooCommerce is offline.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 font-medium leading-relaxed">
                <span className="text-base shrink-0">⚠️</span>
                <div>
                  <strong>Select a Category Above:</strong> Choose a WooCommerce category to auto-rotate 6 books on every visit, or switch to <strong>Specific Book IDs</strong> mode.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 font-medium leading-relaxed">
            <span className="text-base shrink-0">📌</span>
            <div>
              <strong>Specific Book IDs Mode Active:</strong> Only the {shelf.bookIds.length} books selected below will be displayed in this shelf on the homepage in exact order.
            </div>
          </div>
        )}
      </div>

      {/* Optional View All Link */}
      <div>
        <label className="text-xs font-bold text-slate-600 block mb-1">
          &ldquo;View all →&rdquo; Link (Optional):
        </label>
        <input
          type="text"
          value={shelf.viewAllHref || ""}
          onChange={(e) => onUpdate({ viewAllHref: e.target.value })}
          placeholder={
            shelf.categorySlug
              ? `/categories/${shelf.categorySlug}`
              : "/shop"
          }
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-xs font-semibold text-slate-700 outline-none focus:border-gold"
        />
      </div>
    </div>
  );
}
