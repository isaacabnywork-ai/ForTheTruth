"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  GiftCard,
  GiftCardOverview,
  GiftCardSettings,
  GiftCardTransaction,
  DEFAULT_GIFT_CARD_DESIGNS,
} from "@/types/giftCard";
import { formatPrice } from "@/utils/currency";

interface Props {
  initialOverview: GiftCardOverview;
  initialCards: GiftCard[];
  initialTransactions: GiftCardTransaction[];
  initialSettings: GiftCardSettings;
  totalCards: number;
  totalTransactions: number;
}

export function AdminGiftCardsClient({
  initialOverview,
  initialCards,
  initialTransactions,
  initialSettings,
  totalCards: initialTotalCards,
  totalTransactions: initialTotalTransactions,
}: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "cards" | "transactions" | "settings">("overview");

  const [overview, setOverview] = useState<GiftCardOverview>(initialOverview);
  const [cards, setCards] = useState<GiftCard[]>(initialCards);
  const [transactions, setTransactions] = useState<GiftCardTransaction[]>(initialTransactions);
  const [settings, setSettings] = useState<GiftCardSettings>(initialSettings);

  // Search & Filter state for Cards
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadingCards, setLoadingCards] = useState(false);

  // Selected Card for Drawer
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);

  // Modals state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [adjustTargetCard, setAdjustTargetCard] = useState<GiftCard | null>(null);

  // Issue Form state
  const [issueForm, setIssueForm] = useState({
    recipientName: "",
    recipientEmail: "",
    senderName: "For The Truth Press",
    senderEmail: "contact@forthetruth.in",
    amount: 1000,
    designId: "classic-gift-card",
    message: "",
    expiryDays: 365,
    sendEmail: true,
    notes: "",
  });
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueSuccessCode, setIssueSuccessCode] = useState<string | null>(null);
  const [issueError, setIssueError] = useState("");

  // Adjust Form state
  const [adjustType, setAdjustType] = useState<"admin_credit" | "admin_debit">("admin_credit");
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState("");

  // Expiry Form state
  const [expiryDateInput, setExpiryDateInput] = useState("");
  const [expiryReason, setExpiryReason] = useState("");
  const [expiryLoading, setExpiryLoading] = useState(false);
  const [expiryError, setExpiryError] = useState("");

  // Settings Form state
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState("");

  // Refresh Cards Table
  async function refreshCards(search = searchTerm, status = statusFilter) {
    setLoadingCards(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (status !== "all") q.set("status", status);
      q.set("limit", "50");
      q.set("overview", "true");

      const res = await fetch(`/api/admin/gift-cards?${q.toString()}`);
      const data = await res.json();
      if (res.ok && data.cards) {
        setCards(data.cards);
        if (data.overview) setOverview(data.overview);
      }
    } catch (e) {
      console.error("Failed to refresh cards:", e);
    } finally {
      setLoadingCards(false);
    }
  }

  // Refresh Transactions
  async function refreshTransactions() {
    try {
      const res = await fetch("/api/admin/gift-cards/transactions?limit=50");
      const data = await res.json();
      if (res.ok && data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (e) {
      console.error("Failed to refresh transactions:", e);
    }
  }

  // Submit Manual Issue
  async function handleManualIssue(e: React.FormEvent) {
    e.preventDefault();
    setIssueLoading(true);
    setIssueError("");
    setIssueSuccessCode(null);

    try {
      const res = await fetch("/api/admin/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issueForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setIssueError(data.error || "Failed to issue gift card");
      } else {
        setIssueSuccessCode(data.fullCode);
        refreshCards();
        refreshTransactions();
      }
    } catch {
      setIssueError("Network error while issuing gift card");
    } finally {
      setIssueLoading(false);
    }
  }

  // Submit Balance Adjustment
  async function handleAdjustBalance(e: React.FormEvent) {
    e.preventDefault();
    if (!adjustTargetCard) return;

    setAdjustLoading(true);
    setAdjustError("");

    try {
      const res = await fetch(`/api/admin/gift-cards/${adjustTargetCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "balance",
          type: adjustType,
          amount: adjustAmount,
          reason: adjustReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAdjustError(data.error || "Failed to adjust balance");
      } else {
        setShowAdjustModal(false);
        setAdjustTargetCard(null);
        setAdjustReason("");
        refreshCards();
        refreshTransactions();
      }
    } catch {
      setAdjustError("Network error while adjusting balance");
    } finally {
      setAdjustLoading(false);
    }
  }

  // Submit Expiry Extension
  async function handleExtendExpiry(e: React.FormEvent) {
    e.preventDefault();
    if (!adjustTargetCard) return;

    setExpiryLoading(true);
    setExpiryError("");

    try {
      const res = await fetch(`/api/admin/gift-cards/${adjustTargetCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "expiry",
          newExpiryDate: expiryDateInput ? new Date(expiryDateInput).toISOString() : null,
          reason: expiryReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setExpiryError(data.error || "Failed to update expiry");
      } else {
        setShowExpiryModal(false);
        setAdjustTargetCard(null);
        setExpiryReason("");
        setExpiryDateInput("");
        refreshCards();
      }
    } catch {
      setExpiryError("Network error while updating expiry");
    } finally {
      setExpiryLoading(false);
    }
  }

  // Toggle Card Status (Active/Disabled)
  async function handleToggleStatus(card: GiftCard) {
    const nextStatus = card.status === "disabled" ? "active" : "disabled";
    const confirmPrompt = window.confirm(
      `Are you sure you want to mark this gift card as ${nextStatus.toUpperCase()}?`
    );
    if (!confirmPrompt) return;

    try {
      const res = await fetch(`/api/admin/gift-cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "status",
          status: nextStatus,
          reason: `Admin toggled status to ${nextStatus}`,
        }),
      });
      if (res.ok) {
        refreshCards();
        if (selectedCard?.id === card.id) {
          setSelectedCard({ ...card, status: nextStatus });
        }
      }
    } catch (e) {
      alert("Failed to toggle status");
    }
  }

  // Resend Email Action
  async function handleResendEmail(card: GiftCard) {
    const ok = window.confirm(`Resend gift card email to ${card.recipientEmail}?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/gift-cards/${card.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend-email" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Gift card email dispatched successfully!");
        refreshCards();
      } else {
        alert(`Could not dispatch email: ${data.error || "Unknown error"}`);
      }
    } catch {
      alert("Network error dispatching email");
    }
  }

  // Save Settings
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSavedMsg("");

    try {
      const res = await fetch("/api/admin/gift-cards/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setSettingsSavedMsg("Settings saved successfully!");
        setTimeout(() => setSettingsSavedMsg(""), 4000);
      } else {
        alert(data.error || "Failed to save settings");
      }
    } catch {
      alert("Network error saving settings");
    } finally {
      setSavingSettings(false);
    }
  }

  // Export Cards CSV
  function exportCardsCSV() {
    const headers = [
      "ID",
      "Masked Code",
      "Status",
      "Type",
      "Design",
      "Initial Value",
      "Remaining Balance",
      "Recipient Name",
      "Recipient Email",
      "Sender Name",
      "Sender Email",
      "Order ID",
      "Expiry Date",
      "Created At",
    ];

    const rows = cards.map((c) => [
      c.id,
      c.code,
      c.status,
      c.type,
      `"${c.designTitle}"`,
      c.initialAmount,
      c.remainingBalance,
      `"${c.recipientName}"`,
      c.recipientEmail,
      `"${c.senderName}"`,
      c.senderEmail,
      c.orderId || "",
      c.expiryDate || "Never",
      c.createdAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ftt_gift_cards_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C89B3C]">
            Store Administration
          </span>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Gift Cards System
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Issue, audit, track balances, and manage digital gift cards for For The Truth bookstore.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setShowIssueModal(true);
              setIssueSuccessCode(null);
              setIssueError("");
            }}
            className="rounded-2xl bg-[#11426B] px-5 py-3 text-xs font-bold text-white hover:bg-[#0c2f4d] shadow-md shadow-[#11426B]/20 transition-all flex items-center gap-2"
          >
            <span>+</span> Issue Gift Card
          </button>
          <button
            type="button"
            onClick={exportCardsCSV}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <span>📥</span> Export CSV
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: "overview", label: "Overview & Analytics" },
          { id: "cards", label: `All Gift Cards (${overview.totalIssued})` },
          { id: "transactions", label: `Audit Ledger (${transactions.length})` },
          { id: "settings", label: "Settings & Designs" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-[#11426B] text-[#11426B]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Value Issued
              </span>
              <p className="mt-2 font-display text-2xl lg:text-3xl font-extrabold text-[#11426B]">
                {formatPrice(overview.totalValueIssued)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {overview.totalIssued} total cards created
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Redeemed
              </span>
              <p className="mt-2 font-display text-2xl lg:text-3xl font-extrabold text-emerald-700">
                {formatPrice(overview.totalRedeemedValue)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {overview.totalValueIssued > 0
                  ? Math.round((overview.totalRedeemedValue / overview.totalValueIssued) * 100)
                  : 0}
                % redemption rate
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Outstanding Liability
              </span>
              <p className="mt-2 font-display text-2xl lg:text-3xl font-extrabold text-amber-600">
                {formatPrice(overview.outstandingBalance)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Unspent customer balances
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Gift Cards
              </span>
              <p className="mt-2 font-display text-2xl lg:text-3xl font-extrabold text-slate-900">
                {overview.activeCount}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {overview.redeemedCount} fully used &bull; {overview.expiredCount} expired
              </p>
            </div>
          </div>

          {/* Quick Recent Activity & Highlights */}
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-slate-900 text-base flex items-center justify-between">
                <span>Recent Card Issuances</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("cards")}
                  className="text-xs text-[#11426B] hover:underline font-bold"
                >
                  View All &rarr;
                </button>
              </h3>

              <div className="divide-y divide-slate-100">
                {cards.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCard(c)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-16 overflow-hidden rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                        <Image src={c.designImage} alt={c.designTitle} fill className="object-contain" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 font-mono">{c.code}</p>
                        <p className="text-[11px] text-slate-500">
                          To: {c.recipientName} &bull; From: {c.senderName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-[#0F5132]">{formatPrice(c.remainingBalance)}</p>
                      <span className="text-[10px] text-slate-400 capitalize">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-slate-900 text-base flex items-center justify-between">
                <span>Recent Audit Ledger</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("transactions")}
                  className="text-xs text-[#11426B] hover:underline font-bold"
                >
                  View Ledger &rarr;
                </button>
              </h3>

              <div className="space-y-3">
                {transactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="rounded-2xl bg-slate-50 p-3 border border-slate-100 text-xs flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.type === "issuance" ? "bg-blue-100 text-blue-800" :
                          t.type === "redemption" ? "bg-emerald-100 text-emerald-800" :
                          "bg-purple-100 text-purple-800"
                        }`}>
                          {t.type}
                        </span>
                        <span className="font-mono text-slate-600 font-semibold">{t.giftCardCodeMasked}</span>
                      </div>
                      <p className="mt-1 text-slate-500 text-[11px] line-clamp-1">{t.note}</p>
                    </div>
                    <span className="font-bold text-slate-900 text-xs shrink-0 ml-2">
                      {t.type === "redemption" ? "-" : "+"}{formatPrice(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL GIFT CARDS TABLE */}
      {activeTab === "cards" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex-1 w-full relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && refreshCards(searchTerm, statusFilter)}
                placeholder="Search by code, recipient, sender name, or email…"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#11426B] focus:outline-none"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  refreshCards(searchTerm, e.target.value);
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="redeemed">Redeemed</option>
                <option value="expired">Expired</option>
                <option value="disabled">Disabled</option>
              </select>
              <button
                type="button"
                onClick={() => refreshCards(searchTerm, statusFilter)}
                className="rounded-2xl bg-[#11426B] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0c2f4d]"
              >
                Filter
              </button>
            </div>
          </div>

          {/* Cards Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Card</th>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Sender</th>
                  <th className="py-3.5 px-4 text-right">Initial</th>
                  <th className="py-3.5 px-4 text-right">Balance</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Expiry</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingCards ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Loading gift cards…
                    </td>
                  </tr>
                ) : cards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No gift cards match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  cards.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-14 overflow-hidden rounded-md bg-slate-100 border border-slate-200 shrink-0">
                            <Image src={c.designImage} alt={c.designTitle} fill className="object-contain" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-slate-900 block">{c.code}</span>
                            <span className="text-[10px] text-slate-400">{c.designTitle}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{c.recipientName}</p>
                        <p className="text-[11px] text-slate-400">{c.recipientEmail}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{c.senderName}</p>
                        <p className="text-[11px] text-slate-400">{c.senderEmail}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        {formatPrice(c.initialAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#0F5132]">
                        {formatPrice(c.remainingBalance)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            c.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : c.status === "redeemed"
                              ? "bg-slate-100 text-slate-700"
                              : c.status === "expired"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-IN") : "Never"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCard(c)}
                            title="View Card Details"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 transition-colors"
                          >
                            👁
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustTargetCard(c);
                              setShowAdjustModal(true);
                            }}
                            title="Adjust Balance"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 transition-colors"
                          >
                            ₹±
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustTargetCard(c);
                              setShowExpiryModal(true);
                            }}
                            title="Extend Expiry"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 transition-colors"
                          >
                            ⏳
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(c)}
                            title={c.status === "disabled" ? "Enable Card" : "Disable Card"}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 transition-colors"
                          >
                            {c.status === "disabled" ? "🔓" : "🔒"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResendEmail(c)}
                            title="Resend Delivery Email"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 transition-colors"
                          >
                            ✉️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTION AUDIT LEDGER */}
      {activeTab === "transactions" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Card Reference</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Before &rarr; After</th>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Notes / Performed By</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No gift card transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {tx.id}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {tx.giftCardCodeMasked}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            tx.type === "issuance"
                              ? "bg-blue-100 text-blue-800"
                              : tx.type === "redemption"
                              ? "bg-emerald-100 text-emerald-800"
                              : tx.type === "admin_credit"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        {tx.type === "redemption" || tx.type === "admin_debit" ? "-" : "+"}
                        {formatPrice(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                        {formatPrice(tx.balanceBefore)} &rarr; {formatPrice(tx.balanceAfter)}
                      </td>
                      <td className="py-3.5 px-4">
                        {tx.orderId ? (
                          <span className="font-semibold text-slate-900">#{tx.orderId}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-slate-800 font-medium line-clamp-1">{tx.note || "—"}</p>
                        <p className="text-[10px] text-slate-400">{tx.performedBy || "System"}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS & DESIGNS */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="space-y-8 animate-in fade-in duration-200">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-display font-bold text-slate-900 text-lg">
              Gift Card General Rules
            </h3>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Minimum Purchase Amount (₹)
                </label>
                <input
                  type="number"
                  min={10}
                  max={50000}
                  value={settings.minAmount}
                  onChange={(e) => setSettings({ ...settings, minAmount: parseInt(e.target.value) || 100 })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Maximum Purchase Amount (₹)
                </label>
                <input
                  type="number"
                  min={100}
                  max={100000}
                  value={settings.maxAmount}
                  onChange={(e) => setSettings({ ...settings, maxAmount: parseInt(e.target.value) || 10000 })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Default Validity Period (Days)
                </label>
                <input
                  type="number"
                  min={0}
                  max={3650}
                  value={settings.defaultValidityDays}
                  onChange={(e) => setSettings({ ...settings, defaultValidityDays: parseInt(e.target.value) || 365 })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold"
                />
                <p className="mt-1 text-[11px] text-slate-400">Set to 0 for cards that never expire.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Notification Sender Name
                </label>
                <input
                  type="text"
                  value={settings.senderName}
                  onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-3 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowPartialRedemption}
                  onChange={(e) => setSettings({ ...settings, allowPartialRedemption: e.target.checked })}
                  className="h-4 w-4 rounded text-[#11426B]"
                />
                Allow partial redemption (remaining balance carries forward)
              </label>
              <label className="flex items-center gap-3 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowGuestRedemption}
                  onChange={(e) => setSettings({ ...settings, allowGuestRedemption: e.target.checked })}
                  className="h-4 w-4 rounded text-[#11426B]"
                />
                Allow guest customers to redeem gift cards without logging in
              </label>
            </div>
          </div>

          {/* Manage Illustrated Designs */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-display font-bold text-slate-900 text-lg">
              Manage Gift Card Designs
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {settings.designs.map((design, index) => (
                <div key={design.id} className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <Image src={design.image} alt={design.title} fill className="object-contain p-1" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{design.title}</p>
                      <p className="text-[11px] text-slate-400">{design.subtitle}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={design.enabled}
                        onChange={(e) => {
                          const updated = [...settings.designs];
                          updated[index] = { ...design, enabled: e.target.checked };
                          setSettings({ ...settings, designs: updated });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {settingsSavedMsg && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800">
              ✓ {settingsSavedMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={savingSettings}
            className="rounded-2xl bg-[#11426B] px-8 py-3.5 font-bold text-white hover:bg-[#0c2f4d] shadow-md transition-all text-xs disabled:opacity-50"
          >
            {savingSettings ? "Saving Settings…" : "Save All Settings"}
          </button>
        </form>
      )}

      {/* DRAWER: CARD DETAILS */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Gift Card Details
                </span>
                <h3 className="font-mono text-lg font-bold text-slate-900 mt-0.5">
                  {selectedCard.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Artwork */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
              <Image src={selectedCard.designImage} alt={selectedCard.designTitle} fill className="object-contain p-2" />
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Remaining</span>
                <p className="font-display text-2xl font-black text-[#0F5132] mt-0.5">
                  {formatPrice(selectedCard.remainingBalance)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Initial Amount</span>
                <p className="font-display text-2xl font-bold text-slate-700 mt-0.5">
                  {formatPrice(selectedCard.initialAmount)}
                </p>
              </div>
            </div>

            {/* Recipient & Sender */}
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold uppercase text-slate-900">{selectedCard.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-semibold text-slate-900">{selectedCard.recipientName} ({selectedCard.recipientEmail})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Sender:</span>
                <span className="font-semibold text-slate-900">{selectedCard.senderName} ({selectedCard.senderEmail})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Expiry Date:</span>
                <span className="font-semibold text-slate-900">
                  {selectedCard.expiryDate ? new Date(selectedCard.expiryDate).toLocaleDateString("en-IN") : "Never"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Issued Date:</span>
                <span className="font-semibold text-slate-900">{new Date(selectedCard.createdAt).toLocaleString("en-IN")}</span>
              </div>
              {selectedCard.message && (
                <div className="py-2">
                  <span className="text-slate-400 block mb-1">Personal Message:</span>
                  <p className="italic bg-slate-50 p-3 rounded-xl border border-slate-100">&ldquo;{selectedCard.message}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Email History */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs">Email Delivery Log</h4>
              {selectedCard.emailHistory.length === 0 ? (
                <p className="text-[11px] text-slate-400">No emails logged yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedCard.emailHistory.map((h, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-2 text-[11px] flex justify-between items-center border border-slate-100">
                      <span>{h.recipientEmail}</span>
                      <span className={`font-bold capitalize ${h.status === "sent" ? "text-emerald-700" : "text-red-600"}`}>
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              <button
                type="button"
                onClick={() => handleResendEmail(selectedCard)}
                className="w-full rounded-xl bg-[#11426B] py-3 text-xs font-bold text-white hover:bg-[#0c2f4d]"
              >
                ✉️ Resend Delivery Email to Recipient
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustTargetCard(selectedCard);
                  setShowAdjustModal(true);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                ₹ Adjust Card Balance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL ISSUANCE */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-900 text-lg">
                Manual Gift Card Issuance
              </h3>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {issueSuccessCode ? (
              <div className="text-center py-6 space-y-4">
                <span className="text-4xl block">🎉</span>
                <h4 className="font-display font-bold text-slate-900 text-lg">
                  Gift Card Issued Successfully!
                </h4>
                <div className="rounded-2xl bg-slate-50 border-2 border-dashed border-[#11426B] p-4 text-center">
                  <span className="text-xs uppercase text-slate-400 font-bold block mb-1">
                    Unique Gift Card Code
                  </span>
                  <span className="font-mono text-2xl font-black text-[#11426B] tracking-widest select-all">
                    {issueSuccessCode}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {issueForm.sendEmail
                    ? `Delivery email dispatched to ${issueForm.recipientEmail}.`
                    : "No email was sent. Please share this code manually with the recipient."}
                </p>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="rounded-xl bg-[#11426B] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0c2f4d]"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleManualIssue} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={issueForm.amount}
                    onChange={(e) => setIssueForm({ ...issueForm, amount: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={issueForm.recipientName}
                      onChange={(e) => setIssueForm({ ...issueForm, recipientName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Recipient Email</label>
                    <input
                      type="email"
                      value={issueForm.recipientEmail}
                      onChange={(e) => setIssueForm({ ...issueForm, recipientEmail: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={issueForm.senderName}
                      onChange={(e) => setIssueForm({ ...issueForm, senderName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sender Email</label>
                    <input
                      type="email"
                      value={issueForm.senderEmail}
                      onChange={(e) => setIssueForm({ ...issueForm, senderEmail: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Illustrated Design</label>
                  <select
                    value={issueForm.designId}
                    onChange={(e) => setIssueForm({ ...issueForm, designId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                  >
                    {DEFAULT_GIFT_CARD_DESIGNS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} ({d.subtitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    min={0}
                    value={issueForm.expiryDays}
                    onChange={(e) => setIssueForm({ ...issueForm, expiryDays: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                  <span className="text-[10px] text-slate-400">0 = Never expires</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Personal Message / Reason</label>
                  <textarea
                    rows={2}
                    value={issueForm.message}
                    onChange={(e) => setIssueForm({ ...issueForm, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                    placeholder="Complimentary gift card from ministry leaders..."
                  />
                </div>

                <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={issueForm.sendEmail}
                    onChange={(e) => setIssueForm({ ...issueForm, sendEmail: e.target.checked })}
                    className="h-4 w-4 rounded text-[#11426B]"
                  />
                  Dispatch email notification immediately to recipient
                </label>

                {issueError && (
                  <p className="rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-600">
                    ⚠ {issueError}
                  </p>
                )}

                <div className="pt-3 flex gap-2">
                  <button
                    type="submit"
                    disabled={issueLoading}
                    className="flex-1 rounded-xl bg-[#11426B] py-3 text-xs font-bold text-white hover:bg-[#0c2f4d] disabled:opacity-50"
                  >
                    {issueLoading ? "Issuing Card…" : "Issue Card Now"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    className="rounded-xl border border-slate-300 px-4 py-3 text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADJUST BALANCE */}
      {showAdjustModal && adjustTargetCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 text-left">
            <h3 className="font-display font-bold text-slate-900 text-base">
              Adjust Balance — {adjustTargetCard.code}
            </h3>
            <p className="text-xs text-slate-500">
              Current Available Balance: <strong>{formatPrice(adjustTargetCard.remainingBalance)}</strong>
            </p>

            <form onSubmit={handleAdjustBalance} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("admin_credit")}
                    className={`rounded-xl py-2 font-bold border ${
                      adjustType === "admin_credit"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-slate-200"
                    }`}
                  >
                    + Credit Balance
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("admin_debit")}
                    className={`rounded-xl py-2 font-bold border ${
                      adjustType === "admin_debit"
                        ? "border-red-600 bg-red-50 text-red-800"
                        : "border-slate-200"
                    }`}
                  >
                    - Debit Balance
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjustment Amount (₹)</label>
                <input
                  type="number"
                  min={1}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mandatory Audit Reason</label>
                <textarea
                  rows={2}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Compensation for delayed order #82344"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                  required
                />
              </div>

              {adjustError && (
                <p className="rounded-xl bg-red-50 p-2 text-xs font-semibold text-red-600">
                  ⚠ {adjustError}
                </p>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={adjustLoading}
                  className="flex-1 rounded-xl bg-[#11426B] py-2.5 font-bold text-white hover:bg-[#0c2f4d] disabled:opacity-50"
                >
                  {adjustLoading ? "Applying…" : "Confirm Adjustment"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXTEND EXPIRY */}
      {showExpiryModal && adjustTargetCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 text-left">
            <h3 className="font-display font-bold text-slate-900 text-base">
              Extend Validity — {adjustTargetCard.code}
            </h3>
            <p className="text-xs text-slate-500">
              Current Expiry:{" "}
              <strong>
                {adjustTargetCard.expiryDate
                  ? new Date(adjustTargetCard.expiryDate).toLocaleDateString("en-IN")
                  : "Never"}
              </strong>
            </p>

            <form onSubmit={handleExtendExpiry} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Expiry Date</label>
                <input
                  type="date"
                  value={expiryDateInput}
                  onChange={(e) => setExpiryDateInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
                <p className="mt-1 text-[11px] text-slate-400">Leave blank to make this card never expire.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Extension</label>
                <textarea
                  rows={2}
                  value={expiryReason}
                  onChange={(e) => setExpiryReason(e.target.value)}
                  placeholder="e.g. Customer requested validity extension via support ticket"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                  required
                />
              </div>

              {expiryError && (
                <p className="rounded-xl bg-red-50 p-2 text-xs font-semibold text-red-600">
                  ⚠ {expiryError}
                </p>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={expiryLoading}
                  className="flex-1 rounded-xl bg-[#11426B] py-2.5 font-bold text-white hover:bg-[#0c2f4d] disabled:opacity-50"
                >
                  {expiryLoading ? "Updating…" : "Update Expiry Date"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExpiryModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
