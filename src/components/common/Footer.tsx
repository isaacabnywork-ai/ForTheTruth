"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME, COLLECTIONS } from "@/utils/constants";

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Authors", href: "/authors" },
  { label: "Why Choose Us", href: "/about#why" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const QUICK_LINKS = [
  { label: "Out of Stock", href: "/products?availability=outofstock" },
  { label: "My Account", href: "/account/dashboard" },
  { label: "My Cart", href: "/cart" },
  { label: "Free ebooks", href: "/free-ebooks" },
  { label: "Hindi Books", href: "/products?category=hindi" },
  { label: "FAQ’s", href: "/faq" },
];

const TRUST = [
  { title: "Free shipping over ₹150", icon: "M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" },
  { title: "Dispatched in 24 hours", icon: "M12 6v6l4 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" },
  {
    isRazorpay: true,
    logo: "https://admin.forthetruth.in/wp-content/uploads/2026/10/png-transparent-razorpay-logo-tech-companies-thumbnail.png",
  },
  { title: "Curated Christian literature", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-navy-gradient text-white">
      {/* Trust strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {TRUST.map((t, idx) =>
            t.isRazorpay ? (
              <div key={idx} className="flex items-center">
                <img
                  src={t.logo}
                  alt="Razorpay"
                  className="h-8 w-auto max-w-[140px] rounded-md bg-white object-contain px-2.5 py-1 shadow-sm"
                />
              </div>
            ) : (
              <div key={t.title} className="flex items-center gap-3">
                <span className="rounded-full bg-gold/15 p-2 text-gold-light">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d={t.icon} />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-white/80">{t.title}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Link columns (Hidden on mobile/tablet as requested) */}
      <div className="hidden mx-auto lg:grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-4 lg:px-8">
        <FooterNav title="Shop" links={COLLECTIONS.map((c) => ({ ...c }))} />
        <FooterNav title="Company" links={COMPANY_LINKS} />
        <FooterNav title="Quick Links" links={QUICK_LINKS} />
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-gold-light">
            Contact Info
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2.5 text-white/55">
              <span className="text-gold-light/90">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <span>
                Phone:{" "}
                <a
                  href="tel:+918604685533"
                  className="transition-smooth hover:text-gold-light text-white/80 font-medium"
                >
                  +918604685533
                </a>
              </span>
            </li>
            <li className="flex items-center gap-2.5 text-white/55">
              <span className="text-gold-light/90">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <span>
                Email:{" "}
                <a
                  href="mailto:contact@forthetruth.in"
                  className="transition-smooth hover:text-gold-light text-white/80 font-medium"
                >
                  contact@forthetruth.in
                </a>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-28 text-xs text-white/40 lg:px-8 lg:py-5">
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
