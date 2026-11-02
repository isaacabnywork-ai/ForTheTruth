"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME, COLLECTIONS } from "@/utils/constants";
import type { SiteMenusConfig } from "@/types/menus";

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Statement of Faith", href: "/statement-of-faith" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms and Conditions", href: "/terms" },
];

const QUICK_LINKS = [
  { label: "Out of Stock", href: "/shop?availability=outofstock" },
  { label: "My Account", href: "/account/dashboard" },
  { label: "My Cart", href: "/cart" },
  { label: "Free E-Books", href: "/free-ebooks" },
  { label: "Hindi Books", href: "https://margsatyajeevan.com/shop/", external: true },
  { label: "FAQ's", href: "/faq" },
];

export function Footer({ menusConfig }: { menusConfig?: SiteMenusConfig }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const shopLinks = menusConfig?.footerShop && menusConfig.footerShop.length > 0
    ? menusConfig.footerShop
    : COLLECTIONS.map((c) => ({ ...c }));
  const companyLinks = menusConfig?.footerCompany && menusConfig.footerCompany.length > 0
    ? menusConfig.footerCompany
    : COMPANY_LINKS;
  const quickLinks = menusConfig?.footerQuick && menusConfig.footerQuick.length > 0
    ? menusConfig.footerQuick
    : QUICK_LINKS;
  const phone = menusConfig?.contactPhone || "+918604685533";
  const email = menusConfig?.contactEmail || "contact@forthetruth.in";
  const copyright = menusConfig?.copyrightText || `© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.`;

  return (
    <footer className="bg-navy-gradient text-white">
      {/* Link columns (Hidden on mobile/tablet as requested) */}
      <div className="hidden mx-auto lg:grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-4 lg:px-8">
        <FooterNav title="Shop" links={shopLinks} />
        <FooterNav title="Our Company" links={companyLinks} />
        <FooterNav title="Quick Links" links={quickLinks} />
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
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="transition-smooth hover:text-gold-light text-white/80 font-medium"
                >
                  {phone}
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
                  href={`mailto:${email}`}
                  className="transition-smooth hover:text-gold-light text-white/80 font-medium"
                >
                  {email}
                </a>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-28 text-xs text-white/40 lg:px-8 lg:py-5">
          <p>{copyright}</p>
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
  links: readonly { label: string; href: string; external?: boolean }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-gold-light">
        {title}
      </p>
      <ul className="space-y-3 text-sm">
        {links.map((link) => {
          const isExternal = "external" in link ? link.external : link.href.startsWith("http");
          return (
            <li key={link.href + link.label}>
              {isExternal ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/55 transition-smooth hover:text-gold-light inline-flex items-center gap-1.5"
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true" className="text-xs opacity-60">↗</span>
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="text-white/55 transition-smooth hover:text-gold-light"
                >
                  {link.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
