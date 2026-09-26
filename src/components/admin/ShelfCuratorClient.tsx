"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/types/product";
import { getAuthor } from "@/types/product";
import type { CuratedShelfConfig } from "@/services/curation";

interface ShelfCuratorClientProps {
  initialProducts: Product[];
  initialConfig: CuratedShelfConfig;
}

type SectionTab = "hero" | "spine" | "editor" | "shelves";

export function ShelfCuratorClient({ initialProducts, initialConfig }: ShelfCuratorClientProps) {
  const [config, setConfig] = useState<CuratedShelfConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<SectionTab>("hero");
  const [activeSubShelf, setActiveSubShelf] = useState<"newArrivalsIds" | "bestsellersIds">("newArrivalsIds");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Helper to determine which array of IDs we are currently editing
  const getCurrentArrayKey = (): "heroIds" | "spineIds" | "newArrivalsIds" | "bestsellersIds" | null => {
    if (activeTab === "hero") return "heroIds";
    if (activeTab === "spine") return "spineIds";
    if (activeTab === "shelves") return activeSubShelf;
    return null; // editor pick is a single ID
  };

  const currentArrayKey = getCurrentArrayKey();
  const currentArray = currentArrayKey ? config[currentArrayKey] : [];

  // Input string state for direct comma-separated shortcode style entry
  const [rawInput, setRawInput] = useState<string>(() =>
    currentArray.join(", ")
  );

  // When switching tabs, sync raw input
  const handleTabSwitch = (tab: SectionTab) => {
    setActiveTab(tab);
    if (tab === "hero") setRawInput(config.heroIds.join(", "));
    else if (tab === "spine") setRawInput(config.spineIds.join(", "));
    else if (tab === "shelves") setRawInput(config[activeSubShelf].join(", "));
    else setRawInput("");
  };

  const handleSubShelfSwitch = (shelf: "newArrivalsIds" | "bestsellersIds") => {
    setActiveSubShelf(shelf);
    setRawInput(config[shelf].join(", "));
  };

  const handleRawInputChange = (val: string) => {
    setRawInput(val);
    if (!currentArrayKey) return;
    const parsedIds = val
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);
    setConfig((prev) => ({ ...prev, [currentArrayKey]: parsedIds }));
  };

  const handleAddBook = (id: number) => {
    if (activeTab === "editor") {
      setConfig((prev) => ({ ...prev, featuredPickId: id }));
      return;
    }
    if (!currentArrayKey) return;
    if (!currentArray.includes(id)) {
      const nextList = [...currentArray, id];
      setConfig((prev) => ({ ...prev, [currentArrayKey]: nextList }));
      setRawInput(nextList.join(", "));
    }
  };

  const handleRemoveBook = (id: number) => {
    if (activeTab === "editor") {
      setConfig((prev) => ({ ...prev, featuredPickId: null }));
      return;
    }
    if (!currentArrayKey) return;
    const nextList = currentArray.filter((i) => i !== id);
    setConfig((prev) => ({ ...prev, [currentArrayKey]: nextList }));
    setRawInput(nextList.join(", "));
  };

  const handleMove = (idx: number, dir: "up" | "down") => {
    if (!currentArrayKey) return;
    const list = [...currentArray];
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setConfig((prev) => ({ ...prev, [currentArrayKey]: list }));
    setRawInput(list.join(", "));
  };

  const handleSave = async () => {
    setSaving(true);
    setToastMsg("");
    try {
      const res = await fetch("/api/admin/curator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      setToastMsg("🎉 All customizations & book overrides saved! Homepage is live with your choices!");
      setTimeout(() => setToastMsg(""), 6000);
    } catch (err: unknown) {
      alert((err as Error).message || "Network error saving curation.");
    } finally {
      setSaving(false);
    }
  };

  // Filter products for catalog selector
  const filteredProducts = initialProducts.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (getAuthor(p) || "").toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q) ||
      p.id.toString().includes(q)
    );
  });

  // Map active IDs to actual product objects
  const activeProducts = currentArray
    .map((id) => initialProducts.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const editorProduct = initialProducts.find((p) => p.id === config.featuredPickId);

  const tabs: { key: SectionTab; label: string; badge: string; desc: string }[] = [
    {
      key: "hero",
      label: "⭐ 1. Top Hero Section",
      badge: `${config.heroIds.length} Books`,
      desc: "Above-the-fold main banner ('Happy reading, friend') & rotating book display.",
    },
    {
      key: "spine",
      label: "📚 2. Spine Shelf Slider",
      badge: `${config.spineIds.length} Spines`,
      desc: "Interactive standing book spine shelf ('Explore this month's essentials').",
    },
    {
      key: "editor",
      label: "✨ 3. Editor's Choice",
      badge: editorProduct ? `#${editorProduct.id} Selected` : "Auto Pick",
      desc: "Single high-impact featured book highlight ('This Month's Essential Read').",
    },
    {
      key: "shelves",
      label: "📦 4. New & Bestseller Shelves",
      badge: `${config.newArrivalsIds.length + config.bestsellersIds.length} Overrides`,
      desc: "Customize headings and book lists for New Arrivals and Bestsellers rows.",
    },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <h1 className="font-display text-3xl font-black text-navy tracking-tight">
            Homepage Curation &amp; Text Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete management over headings, badges, descriptions, and exact book choices across your homepage sections!
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-2xl bg-cta px-8 py-3.5 font-display text-sm font-black tracking-wide text-white shadow-lg shadow-cta/25 hover:bg-cta-dark active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>SAVING CHANGES...</span>
            </>
          ) : (
            <span>💾 SAVE ALL OVERRIDES</span>
          )}
        </button>
      </div>

      {toastMsg && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-6 py-4 text-sm font-extrabold text-emerald-900 shadow-sm animate-in fade-in zoom-in-95">
          <span className="text-lg">✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Section Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => handleTabSwitch(t.key)}
              className={`flex flex-col justify-between rounded-3xl p-5 text-left transition-all border ${
                active
                  ? "border-navy bg-navy text-white shadow-xl shadow-navy/20 scale-[1.02]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-display text-sm font-black line-clamp-1">{t.label}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold shrink-0 ${
                    active ? "bg-gold-light text-navy" : "bg-slate-100 text-slate-600"
                  }`}>
                    {t.badge}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${active ? "text-white/70" : "text-slate-400"}`}>
                  {t.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT / CENTER PANE: Text Config & Curated Book List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Box 1: Text & Heading Overrides */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-black text-navy border-b border-slate-200 pb-3 mb-5 flex items-center gap-2">
              <span>✍️ Section Text &amp; Titles Customization</span>
            </h2>

            {activeTab === "hero" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Overline Badge:</label>
                  <input
                    type="text"
                    value={config.heroBadge || ""}
                    onChange={(e) => setConfig({ ...config, heroBadge: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-navy outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Main Headline (Use comma to colorize 2nd phrase):</label>
                  <input
                    type="text"
                    value={config.heroTitle || ""}
                    onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-display text-sm font-extrabold text-navy outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Subtitle / Store Description:</label>
                  <textarea
                    rows={3}
                    value={config.heroSubtitle || ""}
                    onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-gold leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeTab === "spine" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Overline Badge:</label>
                  <input
                    type="text"
                    value={config.spineBadge || ""}
                    onChange={(e) => setConfig({ ...config, spineBadge: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-navy outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Section Heading:</label>
                  <input
                    type="text"
                    value={config.spineTitle || ""}
                    onChange={(e) => setConfig({ ...config, spineTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-display text-sm font-extrabold text-navy outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Instructions Subtitle:</label>
                  <textarea
                    rows={2}
                    value={config.spineSubtitle || ""}
                    onChange={(e) => setConfig({ ...config, spineSubtitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-gold leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeTab === "editor" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Overline Badge:</label>
                  <input
                    type="text"
                    value={config.featuredBadge || ""}
                    onChange={(e) => setConfig({ ...config, featuredBadge: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-navy outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Section Heading:</label>
                  <input
                    type="text"
                    value={config.featuredTitle || ""}
                    onChange={(e) => setConfig({ ...config, featuredTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-display text-sm font-extrabold text-navy outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Editorial Subtitle:</label>
                  <textarea
                    rows={2}
                    value={config.featuredSubtitle || ""}
                    onChange={(e) => setConfig({ ...config, featuredSubtitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-gold leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeTab === "shelves" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">New Arrivals Row Title:</label>
                  <input
                    type="text"
                    value={config.newArrivalsTitle || ""}
                    onChange={(e) => setConfig({ ...config, newArrivalsTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-display text-sm font-extrabold text-navy outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Bestsellers Row Title:</label>
                  <input
                    type="text"
                    value={config.bestsellersTitle || ""}
                    onChange={(e) => setConfig({ ...config, bestsellersTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-display text-sm font-extrabold text-navy outline-none focus:border-gold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Box 2: Book Curation Overrides */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-200 pb-3 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="font-display text-lg font-black text-navy flex items-center gap-2">
                <span>📚 Book Selection &amp; Order Overrides</span>
              </h2>

              {activeTab === "shelves" && (
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => handleSubShelfSwitch("newArrivalsIds")}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                      activeSubShelf === "newArrivalsIds" ? "bg-navy text-white shadow" : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    New Arrivals Shelf
                  </button>
                  <button
                    onClick={() => handleSubShelfSwitch("bestsellersIds")}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                      activeSubShelf === "bestsellersIds" ? "bg-navy text-white shadow" : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Bestsellers Shelf
                  </button>
                </div>
              )}
            </div>

            {/* If editing a multiple-book shelf */}
            {activeTab !== "editor" ? (
              <>
                <div className="mb-5 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-1.5">
                    ⚡ Shortcode Style ID String (Comma-Separated):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 102, 241, 512, 890"
                    value={rawInput}
                    onChange={(e) => handleRawInputChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 font-mono text-sm font-bold text-navy outline-none focus:border-gold shadow-inner"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    Type IDs directly, or search &amp; click &ldquo;+ Add&rdquo; on any book from the catalog on the right!
                  </p>
                </div>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {activeProducts.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400">
                      <p className="font-display text-sm font-bold text-slate-600">No Custom Overrides Active</p>
                      <p className="text-xs mt-0.5">This section is currently displaying automatic fallback items from WooCommerce.</p>
                    </div>
                  ) : (
                    activeProducts.map((p, idx) => {
                      const author = getAuthor(p);
                      const thumb = p.images?.[0]?.src || "/images/placeholder.jpg";
                      const isFirst = idx === 0;
                      const isLast = idx === activeProducts.length - 1;

                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy font-mono text-xs font-black text-white">
                              #{idx + 1}
                            </span>
                            <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-50">
                              <Image src={thumb} alt={p.name} fill sizes="36px" className="object-contain" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-display text-sm font-bold text-navy line-clamp-1">{p.name}</h4>
                              <p className="text-xs text-slate-400 font-semibold line-clamp-1">
                                ID: <span className="font-mono font-bold text-slate-600">#{p.id}</span> | {author || "Unknown Author"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleMove(idx, "up")}
                              disabled={isFirst}
                              title="Move Up"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => handleMove(idx, "down")}
                              disabled={isLast}
                              title="Move Down"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              ▼
                            </button>
                            <button
                              onClick={() => handleRemoveBook(p.id)}
                              title="Remove"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              /* If editing Editor's single featured pick */
              <div className="p-4">
                {editorProduct ? (
                  <div className="flex items-center justify-between gap-4 rounded-3xl border border-gold bg-gold/10 p-5">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
                        <Image src={editorProduct.images?.[0]?.src || "/images/placeholder.jpg"} alt={editorProduct.name} fill sizes="60px" className="object-contain" />
                      </div>
                      <div>
                        <span className="rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-extrabold text-gold uppercase tracking-wider">
                          Current Featured Essential Read
                        </span>
                        <h4 className="font-display text-lg font-black text-navy mt-1">{editorProduct.name}</h4>
                        <p className="text-xs text-slate-600 font-semibold">
                          Book ID: <span className="font-mono font-extrabold">#{editorProduct.id}</span> | {getAuthor(editorProduct) || "Unknown Author"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveBook(editorProduct.id)}
                      className="rounded-xl border border-rose-300 bg-white px-4 py-2 font-display text-xs font-bold text-rose-700 hover:bg-rose-50 shadow-2xs shrink-0"
                    >
                      Clear Override
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400">
                    <p className="font-display text-sm font-bold text-slate-600">No Editor&apos;s Pick Chosen</p>
                    <p className="text-xs mt-0.5">Currently displaying automatic fallback (bestselling title). Choose a book from the right catalog to override!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Catalog Selector */}
        <div className="lg:col-span-5 flex flex-col rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm max-h-[950px]">
          <div className="border-b border-slate-200 pb-4 mb-4">
            <h3 className="font-display text-lg font-black text-navy">Live Book Catalog</h3>
            <p className="text-xs text-slate-500 mt-0.5">Search and click to add any title directly to your selected section.</p>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by title, author, ID or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-gold shadow-xs"
            />
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-bold">No matching titles in catalog.</div>
            ) : (
              filteredProducts.map((p) => {
                const author = getAuthor(p);
                const thumb = p.images?.[0]?.src || "/images/placeholder.jpg";
                
                const isSelected = activeTab === "editor"
                  ? config.featuredPickId === p.id
                  : (currentArray.includes(p.id));

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative h-11 w-8 shrink-0 overflow-hidden rounded border border-slate-100 bg-slate-50">
                        <Image src={thumb} alt={p.name} fill sizes="32px" className="object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-xs font-bold text-navy line-clamp-1">{p.name}</p>
                        <p className="text-[11px] text-slate-400 font-semibold line-clamp-1">
                          ID: <span className="font-mono text-slate-600 font-bold">#{p.id}</span> | ₹{p.price || p.regular_price || 0}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => (isSelected ? handleRemoveBook(p.id) : handleAddBook(p.id))}
                      className={`shrink-0 rounded-xl px-3 py-1.5 font-display text-[11px] font-extrabold transition-all ${
                        isSelected
                          ? "border border-emerald-300 bg-emerald-100 text-emerald-900 shadow-2xs"
                          : "bg-navy text-white hover:bg-navy-light shadow-2xs"
                      }`}
                    >
                      {isSelected ? "✓ Active" : "+ Select"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
