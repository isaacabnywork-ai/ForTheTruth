"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/utils/currency";
import { REWARD_TIERS } from "@/utils/rewards";
import { getAuthor, type Product } from "@/types/product";

export interface BookAdData {
  title: string;
  author?: string;
  badge: string;
  regularPrice: number;
  salePrice: number;
  discountBadge?: string;
  image: string;
  slug: string;
}

interface HomePromoTrioProps {
  leftBook?: Product | null;
  rightBook?: Product | null;
}

export function HomePromoTrio({ leftBook, rightBook }: HomePromoTrioProps) {
  // Resolve Left Book (Fallback: Nine Marks of a Healthy Church)
  const left: BookAdData = {
    title: leftBook?.name || "Nine Marks of a Healthy Church",
    author:
      (leftBook ? getAuthor(leftBook) : undefined) ||
      leftBook?.categories?.find((c) => c.slug.includes("author"))?.name ||
      "Mark Dever",
    badge: "MINISTRY SPOTLIGHT",
    regularPrice: leftBook?.regular_price
      ? parseFloat(leftBook.regular_price)
      : 799,
    salePrice: leftBook?.price ? parseFloat(leftBook.price) : 249,
    discountBadge: "SAVE 68%",
    image:
      leftBook?.images?.[0]?.src ||
      "https://admin.forthetruth.in/wp-content/uploads/2022/01/NineMarksofaHealthyChurch_large.jpg",
    slug: leftBook?.slug || "nine-marks-of-a-healthy-church",
  };

  // Resolve Right Book (Fallback: The Big Picture Story Bible)
  const right: BookAdData = {
    title: rightBook?.name || "The Big Picture Story Bible",
    author:
      (rightBook ? getAuthor(rightBook) : undefined) ||
      rightBook?.categories?.find((c) => c.slug.includes("author"))?.name ||
      "David R. Helm",
    badge: "CHILDREN'S SPOTLIGHT",
    regularPrice: rightBook?.regular_price
      ? parseFloat(rightBook.regular_price)
      : 2900,
    salePrice: rightBook?.price ? parseFloat(rightBook.price) : 999,
    discountBadge: "SAVE 65%",
    image:
      rightBook?.images?.[0]?.src ||
      "https://admin.forthetruth.in/wp-content/uploads/2024/04/The-Big-Picture-Story-Bible.jpeg",
    slug: rightBook?.slug || "the-big-picture-story-bible",
  };

  return (
    <section
      aria-label="Featured Offers & Book Advertisements"
      className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 py-8 sm:py-10 lg:px-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* ========================================================= */}
        {/* 1. LEFT BLOCK: Book Advertisement (Dark Obsidian Theme)     */}
        {/* ========================================================= */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3 flex flex-col">
          <div className="group relative flex flex-col justify-between h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#131B26] via-[#0E1520] to-[#080C12] p-6 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-gold/30">
            {/* Top decorative texture */}
            <div className="pointer-events-none absolute inset-0 bg-radial-vignette opacity-30" />
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gold/10 blur-2xl" />

            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-gold-light">
                  {left.badge}
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  {left.discountBadge}
                </span>
              </div>

              {/* Book 3D Mockup Display */}
              <div className="my-6 flex items-center justify-center">
                <Link
                  href={`/products/${left.slug}`}
                  className="group/img relative block transition-transform duration-300 hover:scale-105"
                >
                  <div className="relative h-48 w-32 sm:h-52 sm:w-36 overflow-hidden rounded-r-md rounded-l-xs bg-slate-800 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.8)] border border-white/10">
                    {/* Simulated Book Spine Sheen */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-white/30 to-transparent z-10" />
                    <Image
                      src={left.image}
                      alt={left.title}
                      fill
                      sizes="(max-width: 640px) 130px, 150px"
                      className="object-cover"
                    />
                  </div>
                </Link>
              </div>

              {/* Title & Author */}
              <div className="text-center">
                <h3 className="font-serif text-base sm:text-lg font-bold text-white leading-snug line-clamp-2">
                  <Link
                    href={`/products/${left.slug}`}
                    className="hover:text-gold-light transition-colors"
                  >
                    {left.title}
                  </Link>
                </h3>
                {left.author && (
                  <p className="mt-1 text-xs text-white/60 font-medium">
                    by {left.author}
                  </p>
                )}
              </div>
            </div>

            {/* Price & CTA */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <div className="flex items-center justify-center gap-2.5 mb-3">
                <span className="text-2xl font-black text-gold-light font-display">
                  {formatPrice(left.salePrice)}
                </span>
                {left.regularPrice > left.salePrice && (
                  <span className="text-xs text-white/40 line-through">
                    {formatPrice(left.regularPrice)}
                  </span>
                )}
              </div>

              <Link
                href={`/products/${left.slug}`}
                className="btn-gold w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all group-hover:bg-[#C89B3C]"
              >
                <span>View This Book</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. MIDDLE BLOCK: Reformation Week Offer Banner (Image 2)   */}
        {/* ========================================================= */}
        <div className="col-span-1 md:col-span-2 lg:col-span-6 flex flex-col order-first md:order-none lg:order-none">
          <div className="relative flex flex-col justify-between h-full rounded-3xl border border-sky-200/80 bg-[#f7faff] p-5 sm:p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:border-sky-300">
            {/* Header: Title & Subtitle */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl" role="img" aria-label="Gift">
                    🎁
                  </span>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#103460] leading-tight">
                      Reformation Week Offer - Free Books
                    </h3>
                    <p className="mt-0.5 text-xs text-charcoal/70 font-medium">
                      Unlock up to 4 free reward books with your order! Available for a limited time.
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-100 border border-emerald-300/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 shrink-0">
                  Limited Time
                </span>
              </div>

              {/* 4 Books Grid (2x2 as shown in Image 2) */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REWARD_TIERS.map((tier) => (
                  <div
                    key={tier.productId}
                    className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white p-2.5 sm:p-3 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all"
                  >
                    <div className="relative h-14 w-11 sm:h-16 sm:w-12 shrink-0 overflow-hidden rounded bg-cream/50 shadow-xs border border-sand/40">
                      <Image
                        src={tier.image}
                        alt={tier.title}
                        fill
                        sizes="48px"
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div className="flex flex-1 flex-col min-w-0">
                      <h4 className="font-serif text-xs font-bold text-charcoal line-clamp-2 leading-snug">
                        {tier.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          FREE
                        </span>
                        <span className="text-[10px] text-charcoal/50 font-medium">
                          Tier {formatPrice(tier.threshold)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Milestones Strip */}
              <div className="mt-4 pt-3 border-t border-sky-100/80">
                <div className="h-2 w-full rounded-full bg-sky-200/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[#1b4372] to-gold transition-all duration-500"
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-charcoal/60">
                  <span>₹700 (1 Book)</span>
                  <span>₹1,000 (2 Books)</span>
                  <span>₹1,400 (3 Books)</span>
                  <span className="text-emerald-700 font-bold">₹2,000 (All 4)</span>
                </div>
              </div>
            </div>

            {/* Bottom Alert Reminder & Shop Link */}
            <div className="mt-4 rounded-xl border-l-4 border-amber-400 bg-amber-50/90 p-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base" role="img" aria-label="Celebration">
                  🎉
                </span>
                <p className="text-xs text-charcoal/85 leading-snug font-medium">
                  Free reward books automatically unlock in your cart! Books accumulate with each tier.
                </p>
              </div>

              <Link
                href="/shop"
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#103460] hover:bg-[#1b4372] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors"
              >
                <span>Claim Free Books</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. RIGHT BLOCK: Book Advertisement (Warm Sunset Coral Theme)*/}
        {/* ========================================================= */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3 flex flex-col">
          <div className="group relative flex flex-col justify-between h-full overflow-hidden rounded-3xl border border-rose-900/20 bg-gradient-to-b from-[#B84328] via-[#A83820] to-[#782310] p-6 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-gold/40">
            {/* Top decorative texture */}
            <div className="pointer-events-none absolute inset-0 bg-radial-vignette opacity-25" />
            <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-full border border-white/40 bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
                  {right.badge}
                </span>
                <span className="rounded-full bg-white text-[#8C2C18] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-xs">
                  {right.discountBadge}
                </span>
              </div>

              {/* Book 3D Mockup Display */}
              <div className="my-6 flex items-center justify-center">
                <Link
                  href={`/products/${right.slug}`}
                  className="group/img relative block transition-transform duration-300 hover:scale-105"
                >
                  <div className="relative h-48 w-36 sm:h-52 sm:w-40 overflow-hidden rounded-r-md rounded-l-xs bg-[#5c1c0e] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.6)] border border-white/20">
                    {/* Simulated Book Spine Sheen */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-white/35 to-transparent z-10" />
                    <Image
                      src={right.image}
                      alt={right.title}
                      fill
                      sizes="(max-width: 640px) 140px, 160px"
                      className="object-cover"
                    />
                  </div>
                </Link>
              </div>

              {/* Title & Author */}
              <div className="text-center">
                <h3 className="font-serif text-base sm:text-lg font-bold text-white leading-snug line-clamp-2">
                  <Link
                    href={`/products/${right.slug}`}
                    className="hover:text-amber-200 transition-colors"
                  >
                    {right.title}
                  </Link>
                </h3>
                {right.author && (
                  <p className="mt-1 text-xs text-white/75 font-medium">
                    by {right.author}
                  </p>
                )}
              </div>
            </div>

            {/* Price & CTA */}
            <div className="mt-6 pt-4 border-t border-white/15 text-center">
              <div className="flex items-center justify-center gap-2.5 mb-3">
                <span className="text-2xl font-black text-white font-display">
                  {formatPrice(right.salePrice)}
                </span>
                {right.regularPrice > right.salePrice && (
                  <span className="text-xs text-white/50 line-through">
                    {formatPrice(right.regularPrice)}
                  </span>
                )}
              </div>

              <Link
                href={`/products/${right.slug}`}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-white hover:bg-cream text-[#8C2C18] shadow-md transition-all hover:scale-[1.02]"
              >
                <span>View This Book</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
