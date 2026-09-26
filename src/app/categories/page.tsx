import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isWooConfigured } from "@/config/env";
import { getCategories } from "@/services/woocommerce";
import type { WCCategory } from "@/types/product";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse books by category.",
};

export default async function CategoriesPage() {
  let categories: WCCategory[] = [];
  if (isWooConfigured()) {
    categories = await getCategories().catch(() => []);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-10 text-center">
        <p className="overline-label mb-3">Find your genre</p>
        <h1 className="font-display text-4xl font-bold">Browse by Category</h1>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-sand bg-white p-8 text-center shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-card-hover"
            >
              {cat.image?.src && (
                <div className="relative mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full shadow-card">
                  <Image src={cat.image.src} alt="" fill sizes="64px" className="object-cover" />
                </div>
              )}
              <p className="font-display text-lg font-bold text-charcoal transition-colors group-hover:text-gold-dark">
                {cat.name}
              </p>
              {cat.count != null && (
                <p className="mt-1.5 text-xs uppercase tracking-wider text-charcoal/40">
                  {cat.count} {cat.count === 1 ? "book" : "books"}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-sand bg-white p-16 text-center text-charcoal/50">
          Categories will appear once the store is connected.
        </p>
      )}
    </div>
  );
}
