"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewsletterForm } from "./NewsletterForm";
import { SITE_NAME, COLLECTIONS, CHURCH_LINKS } from "@/utils/constants";

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Authors", href: "/authors" },
  { label: "Why Choose Us", href: "/about#why" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const HELP_LINKS = [
  { label: "Shipping & Delivery", href: "/shipping" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "Track Your Order", href: "/account/orders" },
  { label: "FAQs", href: "/faq" },
];

const TRUST = [
  { title: "Free shipping over ₹499", icon: "M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" },
  { title: "Dispatched in 24 hours", icon: "M12 6v6l4 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" },
  { title: "Razorpay secure payments", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { title: "Bulk discounts for churches", icon: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-navy-gradient text-white">
      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {TRUST.map((t) => (
            <div key={t.title} className="flex items-center gap-3">
              <span className="rounded-full bg-gold/15 p-2 text-gold-light">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d={t.icon} />
                </svg>
              </span>
              <span className="text-sm font-semibold text-white/80">{t.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-light">
              Stay in the word
            </p>
            <p className="mt-3 font-display text-2xl font-bold text-white md:text-3xl">
              New releases &amp; reading guides, weekly
            </p>
            <p className="mt-2 text-sm text-white/55">
              One thoughtful email a week. Choose what fits you.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/10 p-0.5">
              <Image src="/logo.png" alt="For The Truth" fill className="object-contain" />
            </div>
            <p className="font-display text-2xl font-black text-white">
              For The<span className="text-gradient-gold"> Truth</span>
            </p>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
            An independent Christian bookstore — 600+ handpicked titles for
            personal growth and church ministry. Honest prices, fast delivery.
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { label: "Instagram", d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" },
              { label: "Facebook", d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
              { label: "YouTube", d: "M22.5 7a2.8 2.8 0 0 0-2-2C18.8 4.5 12 4.5 12 4.5s-6.8 0-8.5.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 5 2.8 2.8 0 0 0 2 2c1.7.5 8.5.5 8.5.5s6.8 0 8.5-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-5 29 29 0 0 0-.5-5zM10 15V9l5 3z" },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="rounded-full border border-white/20 p-2.5 text-white/60 transition-smooth hover:border-gold hover:text-gold-light"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d={s.d} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <FooterNav title="Shop" links={COLLECTIONS.map((c) => ({ ...c }))} />
        <FooterNav title="For Churches" links={CHURCH_LINKS.map((c) => ({ ...c }))} />
        <FooterNav title="Company" links={COMPANY_LINKS} />
        <FooterNav title="Help" links={HELP_LINKS} />
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-white/40 lg:px-8">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p className="flex flex-wrap items-center gap-2">
            {["UPI", "Visa", "Mastercard", "RuPay", "Netbanking"].map((m) => (
              <span
                key={m}
                className="rounded border border-white/15 px-2 py-1 text-[10px] font-semibold text-white/50"
              >
                {m}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterNav({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-gold-light">
        {title}
      </p>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-white/55 transition-smooth hover:text-gold-light"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
