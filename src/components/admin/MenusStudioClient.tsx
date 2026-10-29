"use client";

import { useState } from "react";
import type { MenuItem, SiteMenusConfig } from "@/types/menus";

interface MenusStudioClientProps {
  initialConfig: SiteMenusConfig;
}

export function MenusStudioClient({ initialConfig }: MenusStudioClientProps) {
  const [config, setConfig] = useState<SiteMenusConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setToastMsg("");
    try {
      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save menus");
      setToastMsg("🎉 Menu structure & links saved successfully!");
      setTimeout(() => setToastMsg(""), 6000);
    } catch (err: unknown) {
      alert((err as Error).message || "Error saving menus.");
    } finally {
      setSaving(false);
    }
  };

  // Header Nav helpers
  const handleUpdateHeaderItem = (idx: number, updates: Partial<MenuItem>) => {
    const list = [...config.headerNav];
    list[idx] = { ...list[idx], ...updates };
    setConfig({ ...config, headerNav: list });
  };

  const handleAddHeaderItem = () => {
    const newItem: MenuItem = {
      id: `h-${Date.now()}`,
      label: "New Link",
      href: "/products",
      menuType: "link",
    };
    setConfig({ ...config, headerNav: [...config.headerNav, newItem] });
  };

  const handleRemoveHeaderItem = (idx: number) => {
    const list = config.headerNav.filter((_, i) => i !== idx);
    setConfig({ ...config, headerNav: list });
  };

  const handleMoveHeaderItem = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= config.headerNav.length) return;
    const list = [...config.headerNav];
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setConfig({ ...config, headerNav: list });
  };

  // Footer Column helpers
  type FooterColKey = "footerShop" | "footerCompany" | "footerQuick";

  const handleUpdateFooterItem = (
    col: FooterColKey,
    idx: number,
    updates: Partial<MenuItem>
  ) => {
    const list = [...config[col]];
    list[idx] = { ...list[idx], ...updates };
    setConfig({ ...config, [col]: list });
  };

  const handleAddFooterItem = (col: FooterColKey) => {
    const newItem: MenuItem = {
      id: `f-${col}-${Date.now()}`,
      label: "New Page",
      href: "/",
    };
    setConfig({ ...config, [col]: [...config[col], newItem] });
  };

  const handleRemoveFooterItem = (col: FooterColKey, idx: number) => {
    const list = config[col].filter((_, i) => i !== idx);
    setConfig({ ...config, [col]: list });
  };

  const handleMoveFooterItem = (
    col: FooterColKey,
    idx: number,
    dir: "up" | "down"
  ) => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= config[col].length) return;
    const list = [...config[col]];
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setConfig({ ...config, [col]: list });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/15 text-gold-dark text-xl font-black">
              🧭
            </span>
            <div>
              <h1 className="font-display text-2xl font-black text-navy sm:text-3xl">
                Header &amp; Footer Menu Studio
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Manage navigation links, dropdown types, footer columns, and contact info like WordPress!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-gold px-7 py-3 text-sm font-black shadow-lg shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? "Saving..." : "💾 SAVE ALL MENUS"}
        </button>
      </div>

      {toastMsg && (
        <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-800 font-bold text-sm shadow-sm flex items-center gap-2 animate-in fade-in">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 mb-8 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("header")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "header"
              ? "bg-navy text-white shadow-md shadow-navy/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span>📌 Header Navigation &amp; Announcement</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
            {config.headerNav.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("footer")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "footer"
              ? "bg-navy text-white shadow-md shadow-navy/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span>🦶 Footer Columns &amp; Contact Info</span>
        </button>
      </div>

      {/* TAB 1: HEADER NAVIGATION */}
      {activeTab === "header" && (
        <div className="space-y-6 max-w-4xl">
          {/* Announcement Bar */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-base font-black text-navy border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
              <span>📣 Top Announcement Bar Banner</span>
            </h2>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Banner Text across India:
            </label>
            <input
              type="text"
              value={config.announcement}
              onChange={(e) => setConfig({ ...config, announcement: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-navy outline-none focus:border-gold"
              placeholder="e.g. Free shipping across India on orders over ₹150..."
            />
          </div>

          {/* Navigation Items */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
              <h2 className="font-display text-base font-black text-navy flex items-center gap-2">
                <span>🔗 Header Main Navigation Menu Items</span>
              </h2>
              <button
                type="button"
                onClick={handleAddHeaderItem}
                className="rounded-xl bg-gold/15 px-3 py-1.5 text-xs font-bold text-gold-dark hover:bg-gold/25 transition-colors cursor-pointer"
              >
                + Add Menu Item
              </button>
            </div>

            <div className="space-y-3">
              {config.headerNav.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-[#FAFBFD] p-3.5 shadow-2xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy font-mono text-xs font-bold text-white">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleUpdateHeaderItem(idx, { label: e.target.value })}
                      placeholder="Label (e.g. Home)"
                      className="w-36 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-navy outline-none focus:border-gold"
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => handleUpdateHeaderItem(idx, { href: e.target.value })}
                      placeholder="Link URL (e.g. /products)"
                      className="w-48 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-700 outline-none focus:border-gold"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={item.menuType || "link"}
                      onChange={(e) =>
                        handleUpdateHeaderItem(idx, {
                          menuType: e.target.value as "link" | "books" | "categories",
                        })
                      }
                      className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-gold"
                    >
                      <option value="link">Standard Link</option>
                      <option value="books">Books MegaMenu Dropdown</option>
                      <option value="categories">Categories MegaMenu Dropdown</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleMoveHeaderItem(idx, "up")}
                      disabled={idx === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveHeaderItem(idx, "down")}
                      disabled={idx === config.headerNav.length - 1}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveHeaderItem(idx)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FOOTER COLUMNS */}
      {activeTab === "footer" && (
        <div className="space-y-6 max-w-5xl">
          {/* Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Shop */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <h3 className="font-display text-sm font-black text-navy">
                  🛍️ Column 1: Shop Links
                </h3>
                <button
                  type="button"
                  onClick={() => handleAddFooterItem("footerShop")}
                  className="rounded-lg bg-gold/15 px-2 py-1 text-[11px] font-bold text-gold-dark hover:bg-gold/25 cursor-pointer"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {config.footerShop.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#FAFBFD] p-2"
                  >
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) =>
                        handleUpdateFooterItem("footerShop", idx, { label: e.target.value })
                      }
                      placeholder="Label"
                      className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-navy outline-none"
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) =>
                        handleUpdateFooterItem("footerShop", idx, { href: e.target.value })
                      }
                      placeholder="/link"
                      className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-700 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFooterItem("footerShop", idx)}
                      className="text-rose-600 hover:text-rose-800 font-bold px-1 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Our Company */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <h3 className="font-display text-sm font-black text-navy">
                  🏛️ Column 2: Our Company
                </h3>
                <button
                  type="button"
                  onClick={() => handleAddFooterItem("footerCompany")}
                  className="rounded-lg bg-gold/15 px-2 py-1 text-[11px] font-bold text-gold-dark hover:bg-gold/25 cursor-pointer"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {config.footerCompany.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#FAFBFD] p-2"
                  >
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) =>
                        handleUpdateFooterItem("footerCompany", idx, { label: e.target.value })
                      }
                      placeholder="Label"
                      className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-navy outline-none"
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) =>
                        handleUpdateFooterItem("footerCompany", idx, { href: e.target.value })
                      }
                      placeholder="/link"
                      className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-700 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFooterItem("footerCompany", idx)}
                      className="text-rose-600 hover:text-rose-800 font-bold px-1 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Quick Links */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <h3 className="font-display text-sm font-black text-navy">
                  ⚡ Column 3: Quick Links
                </h3>
                <button
                  type="button"
                  onClick={() => handleAddFooterItem("footerQuick")}
                  className="rounded-lg bg-gold/15 px-2 py-1 text-[11px] font-bold text-gold-dark hover:bg-gold/25 cursor-pointer"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {config.footerQuick.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#FAFBFD] p-2"
                  >
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) =>
                        handleUpdateFooterItem("footerQuick", idx, { label: e.target.value })
                      }
                      placeholder="Label"
                      className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-navy outline-none"
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) =>
                        handleUpdateFooterItem("footerQuick", idx, { href: e.target.value })
                      }
                      placeholder="/link"
                      className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-700 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFooterItem("footerQuick", idx)}
                      className="text-rose-600 hover:text-rose-800 font-bold px-1 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Info & Legal */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-base font-black text-navy border-b border-slate-200 pb-3 mb-4">
              📞 Column 4: Contact &amp; Copyright Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Support Phone Number:
                </label>
                <input
                  type="text"
                  value={config.contactPhone}
                  onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-navy outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Support Email Address:
                </label>
                <input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-navy outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Copyright Notice Text:
                </label>
                <input
                  type="text"
                  value={config.copyrightText}
                  onChange={(e) => setConfig({ ...config, copyrightText: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-navy outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
