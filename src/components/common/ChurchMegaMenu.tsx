"use client";

import Link from "next/link";
import { CHURCH_LINKS, CHURCH_NEEDS, CHURCH_SUPPORT } from "@/utils/constants";

const itemCls =
  "block rounded-lg px-3 py-1.5 text-sm text-charcoal/70 transition-smooth hover:bg-cream hover:text-gold-dark";

const TIERS = [
  { qty: "6 – 10 copies", off: "10% off" },
  { qty: "11 – 25 copies", off: "20% off" },
  { qty: "26+ copies", off: "30% off" },
];

/** Church Resources mega menu: ministry needs · bulk & pricing · support · CTA. */
export function ChurchMegaMenu({
  open,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: {
  open: boolean;
  onNavigate: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <div
      className={`fixed left-1/2 top-[108px] w-[min(1120px,calc(100vw-3rem))] -translate-x-1/2 transition-all duration-300 ${
        open
          ? "pointer-events-auto visible translate-y-0 opacity-100"
          : "pointer-events-none invisible -translate-y-2 opacity-0"
      }`}
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-panel">
        <div className="grid grid-cols-4">
          {/* Shop by ministry need */}
          <div className="border-r border-sand p-7">
            <p className="overline-label mb-4">Shop by Need</p>
            <ul className="space-y-0.5">
              {CHURCH_NEEDS.map((c) => (
                <li key={`${c.href}-${c.label}`}>
                  <Link href={c.href} onClick={onNavigate} className={itemCls}>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bulk & ordering */}
          <div className="border-r border-sand p-7">
            <p className="overline-label mb-4">Bulk &amp; Ordering</p>
            <ul className="space-y-0.5">
              {CHURCH_LINKS.map((c) => (
                <li key={`${c.href}-${c.label}`}>
                  <Link href={c.href} onClick={onNavigate} className={itemCls}>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="border-r border-sand p-7">
            <p className="overline-label mb-4">Support</p>
            <ul className="space-y-0.5">
              {CHURCH_SUPPORT.map((c) => (
                <li key={`${c.href}-${c.label}`}>
                  <Link href={c.href} onClick={onNavigate} className={itemCls}>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Pricing snapshot */}
            <div className="mt-5 rounded-xl bg-cream/70 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold-dark">
                Bulk discounts
              </p>
              <dl className="mt-2 space-y-1">
                {TIERS.map((t) => (
                  <div key={t.qty} className="flex justify-between text-xs">
                    <dt className="text-charcoal/55">{t.qty}</dt>
                    <dd className="font-bold text-charcoal">{t.off}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* CTA panel */}
          <div className="flex flex-col justify-between bg-navy-gradient p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-light">
                Free &amp; no obligation
              </p>
              <p className="mt-3 font-display text-xl font-bold leading-snug text-white">
                Get a quote for your church
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Tell us your titles, quantities, and date — we reply within one
                working day with pricing and availability.
              </p>
            </div>
            <Link
              href="/church-resources#quote"
              onClick={onNavigate}
              className="btn-cta mt-6 !px-5 !py-2.5 !text-xs"
            >
              Request a Quote <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
