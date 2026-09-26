import Link from "next/link";
import { motion } from "framer-motion";

// Note: not-found.tsx is a server component, so we can't use framer-motion directly here.
// We'll use CSS animations instead via Tailwind for the best effect.
export default function NotFound() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-offwhite px-4">
      <div className="mx-auto max-w-xl text-center">
        {/* Large decorative number */}
        <div className="relative mx-auto mb-8 h-48 w-48">
          <svg viewBox="0 0 200 200" fill="none" className="h-full w-full">
            <circle cx="100" cy="100" r="95" stroke="#C89B3C" strokeWidth="2" strokeDasharray="8 6" opacity="0.3" />
            <circle cx="100" cy="100" r="70" fill="#FDF6EC" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-7xl font-black text-gold-dark/80">
            404
          </span>
        </div>

        <p className="overline-label">Page Not Found</p>
        <h1 className="mt-3 font-display text-4xl font-black text-charcoal md:text-5xl">
          This shelf is empty
        </h1>
        <p className="mt-4 text-base leading-relaxed text-charcoal/55">
          The page you&apos;re looking for was moved, renamed, or never existed.
          Let&apos;s get you back to something good.
        </p>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-gold">
            Back Home
          </Link>
          <Link href="/products" className="btn-outline">
            Browse Books
          </Link>
          <Link href="/faq" className="btn-outline">
            Help & FAQ
          </Link>
        </div>

        {/* Suggestions */}
        <div className="mt-12 rounded-3xl border border-sand bg-white p-6 text-left shadow-card">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-charcoal/50">
            You might be looking for…
          </p>
          <ul className="space-y-2.5">
            {[
              { label: "Bestselling Books", href: "/products?orderby=popularity" },
              { label: "Bible Study Titles", href: "/categories" },
              { label: "Church Bulk Orders", href: "/church-resources" },
              { label: "My Account & Orders", href: "/account/dashboard" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-2 text-sm font-semibold text-charcoal/70 transition-colors hover:text-gold-dark"
                >
                  <span className="text-gold-dark" aria-hidden="true">→</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
