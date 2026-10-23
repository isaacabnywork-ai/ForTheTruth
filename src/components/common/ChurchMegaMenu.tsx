"use client";

import Link from "next/link";
import { CHURCH_LINKS, CHURCH_NEEDS, CHURCH_SUPPORT } from "@/utils/constants";
import { RecentlyViewedMegaSection } from "./RecentlyViewedMegaSection";

const itemCls =
  "block rounded-lg px-3 py-1.5 text-sm text-charcoal/70 transition-smooth hover:bg-cream hover:text-gold-dark";

/** Church Resources mega menu: ministry needs · curriculum & resources · support. */
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
      className={`fixed left-1/2 top-[96px] z-[100] w-[min(880px,calc(100vw-3rem))] -translate-x-1/2 transition-all duration-300 before:absolute before:-top-5 before:inset-x-0 before:h-5 before:content-[''] ${
        open
          ? "pointer-events-auto visible translate-y-0 opacity-100"
          : "pointer-events-none invisible -translate-y-2 opacity-0"
      }`}
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-panel">
        <div className="grid grid-cols-3">
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

          {/* Curriculum & Resources */}
          <div className="border-r border-sand p-7">
            <p className="overline-label mb-4">Ministry Resources</p>
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
          <div className="p-7">
            <p className="overline-label mb-4">Support &amp; Guidance</p>
            <ul className="space-y-0.5">
              {CHURCH_SUPPORT.map((c) => (
                <li key={`${c.href}-${c.label}`}>
                  <Link href={c.href} onClick={onNavigate} className={itemCls}>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recently Viewed Books Section */}
        <RecentlyViewedMegaSection onNavigate={onNavigate} />
      </div>
    </div>
  );
}
