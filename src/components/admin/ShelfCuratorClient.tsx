"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Product } from "@/types/product";
import { getAuthor } from "@/types/product";
import { formatPrice } from "@/utils/currency";
import type { CuratedShelfConfig, TestimonialItem } from "@/types/curation";

interface ShelfCuratorClientProps {
  initialProducts: Product[];
  initialConfig: CuratedShelfConfig;
}

type SectionTab = "hero" | "categories" | "spine" | "editor" | "reviews";

type CategoryShelfKey =
  | "newArrivalsIds"
  | "bibleSpeaksTodayIds"
  | "christianLivingIds"
  | "ministryIds"
  | "theologyIds"
  | "bestsellersIds";

interface CategoryShelfDef {
  key: CategoryShelfKey;
  label: string;
  titleField: keyof CuratedShelfConfig;
  defaultTitle: string;
  modeField?: "christianLivingMode" | "ministryMode" | "theologyMode" | "bestsellersMode";
  categoryId?: number;
  categoryName?: string;
  allowCategoryMode: boolean;
}

const CATEGORY_SHELVES: CategoryShelfDef[] = [
  {
    key: "newArrivalsIds",
    label: "1. New Arrivals",
    titleField: "newArrivalsTitle",
    defaultTitle: "New Arrivals",
    allowCategoryMode: false,
  },
  {
    key: "bibleSpeaksTodayIds",
    label: "2. The Bible Speaks Today",
    titleField: "bibleSpeaksTodayTitle",
    defaultTitle: "The Bible Speaks Today",
    allowCategoryMode: false,
  },
  {
    key: "christianLivingIds",
    label: "3. Christian Living",
    titleField: "christianLivingTitle",
    defaultTitle: "Christian Living",
    modeField: "christianLivingMode",
    categoryId: 112,
    categoryName: "Christian Living",
    allowCategoryMode: true,
  },
  {
    key: "ministryIds",
    label: "4. Ministry",
    titleField: "ministryTitle",
    defaultTitle: "Ministry",
    modeField: "ministryMode",
    categoryId: 1727,
    categoryName: "Ministry",
    allowCategoryMode: true,
  },
  {
    key: "theologyIds",
    label: "5. Theology",
    titleField: "theologyTitle",
    defaultTitle: "Theology",
    modeField: "theologyMode",
    categoryId: 1717,
    categoryName: "Theology",
    allowCategoryMode: true,
  },
  {
    key: "bestsellersIds",
    label: "6. Children Books Shelf",
    titleField: "bestsellersTitle",
    defaultTitle: "Children Books",
    modeField: "bestsellersMode",
    categoryId: 114,
    categoryName: "Children",
    allowCategoryMode: true,
  },
];

export function ShelfCuratorClient({
  initialProducts,
  initialConfig,
}: ShelfCuratorClientProps) {
  const [config, setConfig] = useState<CuratedShelfConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<SectionTab>("hero");
  const [activeCategoryShelf, setActiveCategoryShelf] =
    useState<CategoryShelfKey>("newArrivalsIds");
  const [search, setSearch] = useState("");
  const [catalogStatusFilter, setCatalogStatusFilter] = useState<
    "all" | "publish" | "draft" | "private"
  >("all");
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Catalog products map for instant lookup by ID
  const [productCatalogMap, setProductCatalogMap] = useState<Map<number, Product>>(() => {
    const map = new Map<number, Product>();
    initialProducts.forEach((p) => map.set(p.id, p));
    return map;
  });

  // Helper to determine which array of IDs we are currently editing
  const getCurrentArrayKey = ():
    | "heroIds"
    | "spineIds"
    | CategoryShelfKey
    | null => {
    if (activeTab === "hero") return "heroIds";
    if (activeTab === "spine") return "spineIds";
    if (activeTab === "categories") return activeCategoryShelf;
    return null;
  };

  const currentArrayKey = getCurrentArrayKey();
  const currentArray = currentArrayKey
    ? (config[currentArrayKey] as number[]) || []
    : [];

  // Input string state for direct comma-separated shortcode style entry
  const [rawInput, setRawInput] = useState<string>(() =>
    currentArray.join(", ")
  );

  // When switching tabs, sync raw input
  const handleTabSwitch = (tab: SectionTab) => {
    setActiveTab(tab);
    if (tab === "hero") setRawInput(config.heroIds.join(", "));
    else if (tab === "spine") setRawInput(config.spineIds.join(", "));
    else if (tab === "categories")
      setRawInput(
        ((config[activeCategoryShelf] as number[]) || []).join(", ")
      );
    else setRawInput("");
  };

  const handleCategoryShelfSwitch = (shelf: CategoryShelfKey) => {
    setActiveCategoryShelf(shelf);
    setRawInput(((config[shelf] as number[]) || []).join(", "));
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

  // Fetch missing book details automatically if an entered ID is not in productCatalogMap
  useEffect(() => {
    const idsToCheck = [...currentArray];
    if (activeTab === "editor" && config.featuredPickId) {
      idsToCheck.push(config.featuredPickId);
    }
    const missingIds = idsToCheck.filter((id) => !productCatalogMap.has(id));
    if (missingIds.length === 0) return;

    let cancelled = false;
    fetch(`/api/products?include=${missingIds.join(",")}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.products || !Array.isArray(data.products)) return;
        setProductCatalogMap((prev) => {
          const next = new Map(prev);
          data.products.forEach((p: Product) => next.set(p.id, p));
          return next;
        });
      })
      .catch((err) => console.warn("Failed to fetch missing book details:", err));

    return () => {
      cancelled = true;
    };
  }, [currentArray, activeTab, config.featuredPickId, productCatalogMap]);

  // Review management handlers
  const handleAddReview = () => {
    const newRev: TestimonialItem = {
      id: `rev-${Date.now()}`,
      quote: "Genuinely thoughtful curation and sound theological resources.",
      name: "Reader Name",
      role: "Reader · City",
      rating: 5,
      audience: "reader",
    };
    setConfig((prev) => ({
      ...prev,
      reviews: [...(prev.reviews || []), newRev],
    }));
  };

  const handleUpdateReview = (
    id: string,
    updates: Partial<TestimonialItem>
  ) => {
    setConfig((prev) => ({
      ...prev,
      reviews: (prev.reviews || []).map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  };

  const handleRemoveReview = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      reviews: (prev.reviews || []).filter((r) => r.id !== id),
    }));
  };

  const handleMoveReview = (idx: number, dir: "up" | "down") => {
    const list = [...(config.reviews || [])];
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setConfig((prev) => ({ ...prev, reviews: list }));
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
      setToastMsg(
        "🎉 All book curation settings & category modes saved! Homepage is updated live!"
      );
      setTimeout(() => setToastMsg(""), 6000);
    } catch (err: unknown) {
      alert((err as Error).message || "Network error saving curation.");
    } finally {
      setSaving(false);
    }
  };

  // Filter products for catalog selector
  const catalogList = Array.from(productCatalogMap.values());
  const catalogPublishedCount = catalogList.filter((p) => (p.status || "publish") === "publish").length;
  const catalogDraftCount = catalogList.filter((p) => p.status === "draft").length;
  const catalogPrivateCount = catalogList.filter((p) => p.status === "private").length;

  const filteredProducts = catalogList.filter((p) => {
    if (catalogStatusFilter !== "all") {
      const pStatus = p.status || "publish";
      if (pStatus !== catalogStatusFilter) return false;
    }
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (getAuthor(p) || "").toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q) ||
      p.id.toString().includes(q)
    );
  });

  const editorProduct = config.featuredPickId
    ? productCatalogMap.get(config.featuredPickId)
    : null;

  const currentShelfMeta = CATEGORY_SHELVES.find(
    (s) => s.key === activeCategoryShelf
  );

  const tabs: {
    key: SectionTab;
    label: string;
    badge: string;
    desc: string;
  }[] = [
    {
      key: "hero",
      label: "⭐ 1. Hero Section Slider",
      badge: `${config.heroIds.length} Books`,
      desc: "Top rotating banner hero slider with title, subtitle & exact book IDs.",
    },
    {
      key: "categories",
      label: "📚 2. Six Category Shelves",
      badge: "6 Shelves",
      desc: "Customize book IDs, titles & dynamic category auto-rotation for homepage rows.",
    },
    {
      key: "spine",
      label: "📖 3. Spine Shelf Slider",
      badge: `${config.spineIds.length} Spines`,
      desc: "Interactive 3D book spine shelf ('Explore Children Books').",
    },
    {
      key: "editor",
      label: "✨ 4. Editor's Choice",
      badge: config.featuredPickId ? `#${config.featuredPickId}` : "None",
      desc: "Featured book of the month highlight with custom badge & headline.",
    },
    {
      key: "reviews",
      label: "💬 5. Reviews Slider",
      badge: `${config.reviews?.length || 0} Reviews`,
      desc: "Manage customer testimonials that automatically slide on the homepage.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/15 text-gold-dark text-xl font-black">
              🎨
            </span>
            <div>
              <h1 className="font-display text-2xl font-black text-navy sm:text-3xl">
                Homepage Curation &amp; Text Studio
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Change, replace, or rotate books across all homepage shelves dynamically through categories or exact book IDs!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-gold px-7 py-3 text-sm font-black shadow-lg shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? "Saving..." : "💾 SAVE ALL OVERRIDES"}
        </button>
      </div>

      {toastMsg && (
        <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-800 font-bold text-sm shadow-sm flex items-center gap-2 animate-in fade-in">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Section Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => handleTabSwitch(t.key)}
              className={`flex flex-col justify-between rounded-3xl p-4 sm:p-5 text-left transition-all border cursor-pointer ${
                active
                  ? "border-navy bg-navy text-white shadow-xl shadow-navy/20 scale-[1.02]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-display text-xs sm:text-sm font-black line-clamp-1">
                    {t.label}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold shrink-0 ${
                      active
                        ? "bg-gold-light text-navy"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {t.badge}
                  </span>
                </div>
                <p
                  className={`text-[11px] leading-relaxed line-clamp-2 ${
                    active ? "text-white/70" : "text-slate-400"
                  }`}
                >
                  {t.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* REVIEWS TAB VIEW */}
      {activeTab === "reviews" ? (
        <div className="space-y-6 max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
              <div>
                <h2 className="font-display text-lg font-black text-navy flex items-center gap-2">
                  <span>💬 Homepage Customer Reviews Slider</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  These reviews automatically slide in groups of three on the homepage!
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddReview}
                className="rounded-xl bg-gold/15 px-3.5 py-2 text-xs font-bold text-gold-dark hover:bg-gold/25 transition-colors cursor-pointer"
              >
                + Add Review
              </button>
            </div>

            <div className="space-y-4">
              {(config.reviews || []).map((rev, idx) => (
                <div
                  key={rev.id || idx}
                  className="rounded-2xl border border-slate-200 bg-[#FAFBFD] p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-navy font-mono text-[11px] font-bold text-white">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-navy font-display">
                        Review by: {rev.name || "Anonymous"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveReview(idx, "up")}
                        disabled={idx === 0}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveReview(idx, "down")}
                        disabled={idx === (config.reviews || []).length - 1}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveReview(rev.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                        title="Delete Review"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Quote Text:
                    </label>
                    <textarea
                      rows={2}
                      value={rev.quote}
                      onChange={(e) =>
                        handleUpdateReview(rev.id, { quote: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-700 outline-none focus:border-gold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={rev.name}
                        onChange={(e) =>
                          handleUpdateReview(rev.id, { name: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-navy outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Role &amp; City
                      </label>
                      <input
                        type="text"
                        value={rev.role}
                        onChange={(e) =>
                          handleUpdateReview(rev.id, { role: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Rating (1-5)
                      </label>
                      <select
                        value={rev.rating || 5}
                        onChange={(e) =>
                          handleUpdateReview(rev.id, {
                            rating: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-gold-dark outline-none"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                        <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                        <option value="3">⭐⭐⭐ (3 Stars)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Audience Tag
                      </label>
                      <select
                        value={rev.audience || "reader"}
                        onChange={(e) =>
                          handleUpdateReview(rev.id, {
                            audience: e.target.value as "reader" | "church",
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 outline-none"
                      >
                        <option value="reader">Reader</option>
                        <option value="church">Church</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* WORKSPACE AREA FOR HERO, CATEGORIES, SPINE & EDITOR */
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
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Overline Badge:
                    </label>
                    <input
                      type="text"
                      value={config.heroBadge || ""}
                      onChange={(e) =>
                        setConfig({ ...config, heroBadge: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-navy outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Main Headline:
                    </label>
                    <input
                      type="text"
                      value={config.heroTitle || ""}
                      onChange={(e) =>
                        setConfig({ ...config, heroTitle: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-display text-sm font-extrabold text-navy outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Subtitle / Store Description:
                    </label>
                    <textarea
                      rows={2}
                      value={config.heroSubtitle || ""}
                      onChange={(e) =>
                        setConfig({ ...config, heroSubtitle: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-gold leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {activeTab === "categories" && currentShelfMeta && (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Shelf Title for &ldquo;{currentShelfMeta.label}&rdquo;:
                    </label>
                    <input
                      type="text"
                      value={
                        (config[currentShelfMeta.titleField] as string) || ""
                      }
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          [currentShelfMeta.titleField]: e.target.value,
                        })
                      }
                      placeholder={currentShelfMeta.defaultTitle}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-display text-sm font-extrabold text-navy outline-none focus:border-gold"
                    />
                  </div>

                  {/* Dynamic Category Mode vs Specific Book IDs Selection */}
                  {currentShelfMeta.allowCategoryMode && currentShelfMeta.modeField ? (
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
                            onClick={() =>
                              setConfig({
                                ...config,
                                [currentShelfMeta.modeField!]: "category",
                              })
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                              config[currentShelfMeta.modeField!] !== "manual"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-navy"
                            }`}
                          >
                            🎲 Dynamic Category (Auto-rotates)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfig({
                                ...config,
                                [currentShelfMeta.modeField!]: "manual",
                              })
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                              config[currentShelfMeta.modeField!] === "manual"
                                ? "bg-navy text-white shadow-xs"
                                : "text-slate-600 hover:text-navy"
                            }`}
                          >
                            📌 Specific Book IDs
                          </button>
                        </div>
                      </div>

                      {config[currentShelfMeta.modeField!] !== "manual" ? (
                        <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-medium leading-relaxed">
                          <span className="text-base shrink-0">🎲</span>
                          <div>
                            <strong>Dynamic Category Auto-Rotation Active:</strong> Every visitor page refresh displays 6 freshly shuffled books from the <strong>{currentShelfMeta.categoryName}</strong> category ({currentShelfMeta.categoryId ? `ID: ${currentShelfMeta.categoryId}` : ""}).
                            <span className="text-emerald-700 block mt-1">
                              Your {currentArray.length} book IDs below are preserved and used as fallback if WooCommerce is offline.
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 font-medium leading-relaxed">
                          <span className="text-base shrink-0">📌</span>
                          <div>
                            <strong>Specific Book IDs Mode Active:</strong> Only the {currentArray.length} books selected below will be displayed in this shelf on the homepage in exact order.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                      <span className="text-base">📌</span>
                      <div>
                        <strong>Curated by Book IDs Only:</strong> This shelf ({currentShelfMeta.label}) displays strictly by the exact book IDs specified below. (Category auto-rotation is not applicable).
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "spine" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Overline Badge:
                    </label>
                    <input
                      type="text"
                      value={config.spineBadge || ""}
                      onChange={(e) =>
                        setConfig({ ...config, spineBadge: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-navy outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Section Heading:
                    </label>
                    <input
                      type="text"
                      value={config.spineTitle || ""}
                      onChange={(e) =>
                        setConfig({ ...config, spineTitle: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-display text-sm font-extrabold text-navy outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Instructions Subtitle:
                    </label>
                    <textarea
                      rows={2}
                      value={config.spineSubtitle || ""}
                      onChange={(e) =>
                        setConfig({ ...config, spineSubtitle: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-gold leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {activeTab === "editor" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Overline Badge:
                    </label>
                    <input
                      type="text"
                      value={config.featuredBadge || ""}
                      onChange={(e) =>
                        setConfig({ ...config, featuredBadge: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-navy outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Section Heading:
                    </label>
                    <input
                      type="text"
                      value={config.featuredTitle || ""}
                      onChange={(e) =>
                        setConfig({ ...config, featuredTitle: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-display text-sm font-extrabold text-navy outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Editorial Subtitle:
                    </label>
                    <textarea
                      rows={2}
                      value={config.featuredSubtitle || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          featuredSubtitle: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-700 outline-none focus:border-gold leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Box 2: Book Curation Overrides */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-200 pb-3 mb-5 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-black text-navy flex items-center gap-2">
                    <span>📚 Book Selection &amp; Order Overrides</span>
                  </h2>
                </div>

                {/* Sub-shelf selector for the 6 Category Shelves */}
                {activeTab === "categories" && (
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                    {CATEGORY_SHELVES.map((shelf) => {
                      const isSel = activeCategoryShelf === shelf.key;
                      const isCatMode =
                        shelf.allowCategoryMode &&
                        shelf.modeField &&
                        config[shelf.modeField] !== "manual";
                      const count = (
                        (config[shelf.key] as number[]) || []
                      ).length;

                      return (
                        <button
                          key={shelf.key}
                          type="button"
                          onClick={() => handleCategoryShelfSwitch(shelf.key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSel
                              ? "bg-navy text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <span>{shelf.label}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isSel
                                ? isCatMode
                                  ? "bg-emerald-400 text-navy"
                                  : "bg-gold-light text-navy"
                                : isCatMode
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-white text-slate-600"
                            }`}
                          >
                            {isCatMode ? "🎲 Dynamic" : `${count} IDs`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Multiple-book shelf view */}
              {activeTab !== "editor" ? (
                <>
                  <div className="mb-5 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-1.5">
                      ⚡ Comma-Separated Book IDs String:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 47592, 46237, 48904"
                      value={rawInput}
                      onChange={(e) => handleRawInputChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 font-mono text-sm font-bold text-navy outline-none focus:border-gold shadow-inner"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                      Type book IDs directly, or search &amp; click &ldquo;+ Select&rdquo; on any book from the catalog on the right!
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {currentArray.length === 0 ? (
                      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400">
                        <p className="font-display text-sm font-bold text-slate-600">
                          No Custom Books Added Yet
                        </p>
                        <p className="text-xs mt-1">
                          Select books from the Live Catalog on the right or enter comma-separated IDs above.
                        </p>
                      </div>
                    ) : (
                      currentArray.map((id, idx) => {
                        const p = productCatalogMap.get(id);
                        const isFirst = idx === 0;
                        const isLast = idx === currentArray.length - 1;

                        if (!p) {
                          return (
                            <div
                              key={`${id}-${idx}`}
                              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-all"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy font-mono text-xs font-black text-white">
                                  #{idx + 1}
                                </span>
                                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100 flex items-center justify-center">
                                  <span className="text-slate-400 text-xs font-mono font-bold animate-pulse">
                                    📖
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-display text-sm font-bold text-navy line-clamp-1 flex items-center gap-2">
                                    <span>Book #{id}</span>
                                    <span className="text-[10px] font-sans font-medium text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                      Loading details...
                                    </span>
                                  </h4>
                                  <p className="text-xs text-slate-400 font-medium mt-0.5 font-mono">
                                    ID: #{id}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleMove(idx, "up")}
                                  disabled={isFirst}
                                  title="Move Up"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMove(idx, "down")}
                                  disabled={isLast}
                                  title="Move Down"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  ▼
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBook(id)}
                                  title="Remove Book"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 ml-1.5 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        }

                        const author = getAuthor(p);
                        const thumb =
                          p.images?.[0]?.src || "/images/placeholder.jpg";

                        return (
                          <div
                            key={`${p.id}-${idx}`}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-all"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy font-mono text-xs font-black text-white">
                                #{idx + 1}
                              </span>
                              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                                <Image
                                  src={thumb}
                                  alt={p.name}
                                  fill
                                  sizes="40px"
                                  className="object-contain"
                                />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-display text-sm font-bold text-navy line-clamp-1">
                                  {p.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                                  <span>
                                    ID:{" "}
                                    <strong className="font-mono text-navy font-bold">
                                      #{p.id}
                                    </strong>
                                  </span>
                                  {author && <span>· {author}</span>}
                                  <span className="font-bold text-gold-dark">
                                    {formatPrice(p.price || p.regular_price || 0)}
                                  </span>
                                  {p.on_sale && (
                                    <span className="rounded bg-rose-50 px-1.5 py-0.2 text-[9px] font-bold text-rose-600">
                                      SALE
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMove(idx, "up")}
                                disabled={isFirst}
                                title="Move Up"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMove(idx, "down")}
                                disabled={isLast}
                                title="Move Down"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveBook(p.id)}
                                title="Remove Book"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 ml-1.5 cursor-pointer"
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
                /* Single Featured Essential Read */
                <div className="p-4">
                  {editorProduct ? (
                    <div className="flex items-center justify-between gap-4 rounded-3xl border border-gold bg-gold/10 p-5">
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
                          <Image
                            src={
                              editorProduct.images?.[0]?.src ||
                              "/images/placeholder.jpg"
                            }
                            alt={editorProduct.name}
                            fill
                            sizes="60px"
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <span className="rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-extrabold text-gold uppercase tracking-wider">
                            Current Featured Essential Read
                          </span>
                          <h4 className="font-display text-lg font-black text-navy mt-1">
                            {editorProduct.name}
                          </h4>
                          <p className="text-xs text-slate-600 font-semibold">
                            Book ID:{" "}
                            <span className="font-mono font-extrabold">
                              #{editorProduct.id}
                            </span>{" "}
                            | {getAuthor(editorProduct) || "Unknown Author"} |{" "}
                            {formatPrice(editorProduct.price)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBook(editorProduct.id)}
                        className="rounded-xl border border-rose-300 bg-white px-4 py-2 font-display text-xs font-bold text-rose-700 hover:bg-rose-50 shadow-2xs shrink-0 cursor-pointer"
                      >
                        Clear Override
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400">
                      <p className="font-display text-sm font-bold text-slate-600">
                        No Featured Book Selected
                      </p>
                      <p className="text-xs mt-1">
                        Select a book from the Live Catalog on the right to set it as this month&apos;s Essential Read.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE: Live Book Catalog Selector */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-6">
              <div className="border-b border-slate-200 pb-3 mb-4">
                <h2 className="font-display text-base font-black text-navy flex items-center justify-between">
                  <span>📖 Live Book Catalog</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 font-mono">
                    {filteredProducts.length} of {catalogList.length} books
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Search &amp; click &ldquo;+ Select&rdquo; to add any title to the currently active section.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => setCatalogStatusFilter("all")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    catalogStatusFilter === "all"
                      ? "bg-navy text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All ({catalogList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogStatusFilter("publish")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    catalogStatusFilter === "publish"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  Published ({catalogPublishedCount})
                </button>
                {catalogDraftCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setCatalogStatusFilter("draft")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      catalogStatusFilter === "draft"
                        ? "bg-amber-600 text-white shadow-2xs"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    Drafts ({catalogDraftCount})
                  </button>
                )}
                {catalogPrivateCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setCatalogStatusFilter("private")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      catalogStatusFilter === "private"
                        ? "bg-purple-600 text-white shadow-2xs"
                        : "bg-purple-50 text-purple-800 hover:bg-purple-100"
                    }`}
                  >
                    Private ({catalogPrivateCount})
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search by title, author, ID or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2 pl-9 text-xs font-semibold text-navy outline-none focus:border-gold focus:bg-white shadow-inner"
                />
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* Book List */}
              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                {filteredProducts.map((p) => {
                  const author = getAuthor(p);
                  const thumb =
                    p.images?.[0]?.src || "/images/placeholder.jpg";
                  const isAlreadyInActive =
                    activeTab === "editor"
                      ? config.featuredPickId === p.id
                      : currentArray.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-150 bg-[#FAFBFD] p-2.5 hover:border-slate-300 hover:bg-white transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-11 w-8 shrink-0 overflow-hidden rounded border border-slate-200 bg-white">
                          <Image
                            src={thumb}
                            alt={p.name}
                            fill
                            sizes="32px"
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-display text-xs font-bold text-navy line-clamp-1">
                            {p.name}
                          </h5>
                          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-slate-600">
                              #{p.id}
                            </span>{" "}
                            <span>| {formatPrice(p.price || p.regular_price || 0)}</span>{" "}
                            {author ? <span>· {author}</span> : null}
                            {p.status && p.status !== "publish" && (
                              <span
                                className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                                  p.status === "draft"
                                    ? "bg-amber-100 text-amber-800"
                                    : p.status === "private"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {p.status}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          isAlreadyInActive
                            ? handleRemoveBook(p.id)
                            : handleAddBook(p.id)
                        }
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                          isAlreadyInActive
                            ? "bg-slate-200 text-slate-700 hover:bg-rose-100 hover:text-rose-700"
                            : "bg-navy text-white hover:bg-gold hover:text-navy shadow-xs"
                        }`}
                      >
                        {isAlreadyInActive ? "✓ Added" : "+ Select"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
