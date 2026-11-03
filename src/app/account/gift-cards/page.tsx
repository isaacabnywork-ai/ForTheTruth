"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { GiftCard } from "@/types/giftCard";
import { formatPrice } from "@/utils/currency";

export default function AccountGiftCardsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCards() {
      try {
        const res = await fetch("/api/account/gift-cards");
        const data = await res.json();
        if (res.ok && data.cards) {
          setCards(data.cards);
        }
      } catch (err) {
        console.error("Failed to load customer gift cards:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user?.email) {
      fetchCards();
    }
  }, [user]);

  const userEmail = (user?.email || "").toLowerCase();
  const receivedCards = cards.filter(
    (c) => c.recipientEmail.toLowerCase() === userEmail
  );
  const sentCards = cards.filter(
    (c) => c.senderEmail.toLowerCase() === userEmail
  );

  const activeReceivedBalance = receivedCards
    .filter((c) => c.status === "active")
    .reduce((sum, c) => sum + c.remainingBalance, 0);

  const displayedCards = tab === "received" ? receivedCards : sentCards;

  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  }

  return (
    <AccountShell title="My Gift Cards">
      <div className="space-y-8">
        
        {/* Top Summary Banner */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-gradient-to-br from-[#11426B] to-[#0A2942] p-6 text-white shadow-md">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F0C968]">
              Available Gift Card Balance
            </span>
            <p className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-white">
              {formatPrice(activeReceivedBalance)}
            </p>
            <p className="mt-2 text-xs text-slate-300">
              Across {receivedCards.filter((c) => c.status === "active").length} active received gift card(s)
            </p>
          </div>

          <div className="rounded-3xl border border-sand bg-white p-6 shadow-card flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">
                Send a Gift of Reading
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Bless someone with an illustrated Christian digital gift card for any occasion.
              </p>
            </div>
            <div className="mt-4 flex gap-3">
              <Link
                href="/gift-cards"
                className="btn-gold text-xs py-2.5 px-4 font-bold"
              >
                + Buy a Gift Card
              </Link>
              <Link
                href="/gift-cards/check-balance"
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Check Balance
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-sand">
          <button
            type="button"
            onClick={() => setTab("received")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all mr-6 ${
              tab === "received"
                ? "border-[#11426B] text-[#11426B]"
                : "border-transparent text-charcoal/50 hover:text-charcoal"
            }`}
          >
            Received Cards ({receivedCards.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("sent")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              tab === "sent"
                ? "border-[#11426B] text-[#11426B]"
                : "border-transparent text-charcoal/50 hover:text-charcoal"
            }`}
          >
            Sent Cards ({sentCards.length})
          </button>
        </div>

        {/* Cards Content */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner size={32} />
          </div>
        ) : displayedCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand p-10 text-center bg-white">
            <span className="text-3xl block mb-2">🎁</span>
            <p className="font-display text-base font-bold text-slate-800">
              {tab === "received"
                ? "No gift cards received yet"
                : "You haven't sent any gift cards yet"}
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {tab === "received"
                ? "When someone gifts you a For The Truth gift card to your email, it will appear here."
                : "Surprise your friends, family, or church members with a digital bookstore gift card."}
            </p>
            {tab === "sent" && (
              <Link href="/gift-cards" className="btn-gold mt-5 inline-flex text-xs py-2 px-4">
                Explore Gift Cards →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {displayedCards.map((card) => {
              const isExpired =
                card.status === "expired" ||
                (card.expiryDate && new Date(card.expiryDate).getTime() < Date.now());
              return (
                <div
                  key={card.id}
                  className="rounded-3xl border border-sand bg-white p-5 shadow-card flex flex-col justify-between"
                >
                  <div>
                    {/* Header with status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {card.designTitle}
                      </span>
                      {card.status === "active" && !isExpired && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                          Active
                        </span>
                      )}
                      {card.status === "redeemed" && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                          Redeemed
                        </span>
                      )}
                      {isExpired && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                          Expired
                        </span>
                      )}
                    </div>

                    {/* Artwork */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 mb-4 shadow-sm">
                      <Image
                        src={card.designImage}
                        alt={card.designTitle}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Balance */}
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs text-slate-500">Available Balance:</span>
                      <span className="font-display text-xl font-black text-[#0F5132]">
                        {formatPrice(card.remainingBalance)}
                      </span>
                    </div>

                    {/* Code Display */}
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 flex items-center justify-between text-xs font-mono font-bold text-slate-800 mb-3">
                      <span>{card.code}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(card.code)}
                        className="text-[11px] font-sans font-bold text-[#11426B] hover:underline"
                      >
                        {copiedCode === card.code ? "Copied! ✓" : "Copy"}
                      </button>
                    </div>

                    {/* Meta info */}
                    <div className="text-[11px] text-slate-500 space-y-1">
                      {tab === "received" ? (
                        <p>Gifted by: <strong className="text-slate-700">{card.senderName}</strong></p>
                      ) : (
                        <p>Sent to: <strong className="text-slate-700">{card.recipientName}</strong> ({card.recipientEmail})</p>
                      )}
                      <p>
                        Valid until:{" "}
                        <span className="text-slate-700">
                          {card.expiryDate
                            ? new Date(card.expiryDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "No expiry"}
                        </span>
                      </p>
                      {card.message && (
                        <p className="italic text-slate-600 pt-1 border-t border-slate-100">
                          &ldquo;{card.message}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer button */}
                  {tab === "received" && card.remainingBalance > 0 && card.status === "active" && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <Link
                        href="/shop"
                        className="block w-full text-center rounded-xl bg-[#11426B] py-2 text-xs font-bold text-white hover:bg-[#0c2f4d] transition-colors"
                      >
                        Redeem at Checkout →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AccountShell>
  );
}
