"use client";

import React from "react";
import Image from "next/image";
import { formatPrice } from "@/utils/currency";
import {
  REWARD_TIERS,
  MAX_REWARD_THRESHOLD,
  getUnlockedRewards,
  getNextReward,
} from "@/utils/rewards";

interface RewardOfferBoxProps {
  subtotal: number;
}

export function RewardOfferBox({ subtotal }: RewardOfferBoxProps) {
  const unlockedRewards = getUnlockedRewards(subtotal);
  const nextReward = getNextReward(subtotal);
  const progressPercent = Math.min(
    100,
    Math.max(2, Math.round((subtotal / MAX_REWARD_THRESHOLD) * 100))
  );

  return (
    <div className="rounded-xl border border-sky-100 bg-[#f7faff] p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl" role="img" aria-label="Gift">
          🎁
        </span>
        <h3 className="font-display text-base font-bold text-[#103460]">
          Reformation Week Offer - Free Books
        </h3>
      </div>

      <p className="mt-1 text-xs text-charcoal/70 font-medium">
        {unlockedRewards.length > 0
          ? `Congratulations! You have unlocked ${unlockedRewards.length} free book(s).`
          : "Unlock free book rewards as your cart total reaches each tier!"}
      </p>

      {/* Unlocked Books Grid */}
      {unlockedRewards.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {unlockedRewards.map((reward) => (
            <div
              key={reward.productId}
              className="flex items-center gap-3.5 rounded-lg border border-sky-100/80 bg-white p-3 shadow-xs"
            >
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-cream/40 shadow-xs border border-sand/40">
                <Image
                  src={reward.image}
                  alt={reward.title}
                  fill
                  sizes="48px"
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <h4 className="font-serif text-xs sm:text-sm font-bold text-charcoal line-clamp-2 leading-snug">
                  {reward.title}
                </h4>
                <span className="mt-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">
                  FREE
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar towards Maximum Reward Tier */}
      <div className="mt-5 h-2 w-full rounded-full bg-sky-200/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#1b4372] transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-charcoal/60">
        <span>{formatPrice(subtotal)} eligible book subtotal</span>
        <span>{formatPrice(MAX_REWARD_THRESHOLD)} maximum reward tier</span>
      </div>

      {/* Reminder Banner */}
      <div className="mt-4 rounded-r-md border-l-4 border-amber-400 bg-amber-50/90 px-4 py-2.5 text-xs text-charcoal/85 leading-relaxed font-medium shadow-xs">
        {nextReward ? (
          <>
            Add books worth{" "}
            <strong className="font-bold text-charcoal">
              {formatPrice(nextReward.threshold - subtotal)}
            </strong>{" "}
            more to unlock{" "}
            <strong className="font-bold text-charcoal">
              {nextReward.title}
            </strong>
            !
          </>
        ) : (
          <span className="font-bold text-emerald-800">
            🎉 Congratulations! You have unlocked all 4 free reward books!
          </span>
        )}
      </div>
    </div>
  );
}
