"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";

const LINKS = [
  { label: "Dashboard", href: "/account/dashboard" },
  { label: "Orders", href: "/account/orders" },
  { label: "Downloads", href: "/account/downloads" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Profile", href: "/account/profile" },
];

/** Account layout with sidebar nav + auth guard. */
export function AccountShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <p className="overline-label mb-2">My Account</p>
      <h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside>
          <div className="rounded-2xl border border-sand bg-white p-5 shadow-card">
            <p className="truncate font-serif font-bold">{user.firstName || user.email}</p>
            <p className="truncate text-xs text-charcoal/45">{user.email}</p>
            <nav className="mt-5 space-y-1">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition-smooth ${
                    pathname === link.href
                      ? "bg-gold-gradient text-white shadow-gold"
                      : "text-charcoal/65 hover:bg-cream hover:text-gold-dark"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-charcoal/65 transition-smooth hover:bg-cream hover:text-red-600"
              >
                Log out
              </button>
            </nav>
          </div>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
