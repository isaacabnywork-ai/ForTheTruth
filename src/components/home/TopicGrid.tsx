import Image from "next/image";
import Link from "next/link";
import type { WCCategory } from "@/types/product";
import type { Product } from "@/types/product";

/**
 * Quick-browse topic cards with overlapping cover thumbnails,
 * so readers can jump straight into a subject.
 */
export function TopicGrid({
  categories,
  coversByCategory,
}: {
  categories: WCCategory[];
  coversByCategory: Record<number, Product[]>;
}) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="overline-label mb-2">Quick browse</p>
          <h2 className="section-title">Find your topic</h2>
        </div>
        <Link
          href="/categories"
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-dark transition-smooth hover:gap-3.5"
        >
          All topics <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.slice(0, 8).map((cat) => {
          const covers = (coversByCategory[cat.id] ?? []).slice(0, 3);
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-sand bg-white p-5 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-card-hover"
            >
              {/* Overlapping covers */}
              <div className="flex h-20 items-end justify-center">
                {covers.length > 0 ? (
                  covers.map((p, i) => (
                    <span
                      key={p.id}
                      className="relative block h-[72px] w-12 overflow-hidden rounded shadow-book transition-transform duration-500 group-hover:-translate-y-1"
                      style={{
                        marginLeft: i === 0 ? 0 : -14,
                        zIndex: 3 - i,
                        transform: `rotate(${(i - 1) * 5}deg)`,
                      }}
                    >
                      {p.images[0] ? (
                        <Image src={p.images[0].src} alt="" fill sizes="60px" className="object-cover" />
                      ) : (
                        <span className="block h-full w-full bg-gold-gradient" />
                      )}
                    </span>
                  ))
                ) : (
                  <span className="block h-[72px] w-12 rounded bg-gold-gradient shadow-book" />
                )}
              </div>

              <p className="mt-4 text-center font-display text-[15px] font-bold text-charcoal transition-colors group-hover:text-gold-dark">
                {cat.name}
              </p>
              {cat.count != null && (
                <p className="mt-0.5 text-center text-[11px] uppercase tracking-wider text-charcoal/40">
                  {cat.count} {cat.count === 1 ? "book" : "books"}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
