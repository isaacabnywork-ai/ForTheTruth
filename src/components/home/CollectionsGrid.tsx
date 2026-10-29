import Image from "next/image";
import Link from "next/link";

interface CollectionItem {
  id: string;
  subheading: string;
  heading: string;
  href: string;
  image: string;
  alt: string;
}

const COLLECTIONS: CollectionItem[] = [
  {
    id: "children",
    subheading: "HANDCRAFTED",
    heading: "Books for Your Children",
    href: "/categories/children",
    image: "/images/collections/children.png",
    alt: "Books for Your Children collection",
  },
  {
    id: "church",
    subheading: "DEEP STUDY",
    heading: "Books for Your Church",
    href: "/categories/church",
    image: "/images/collections/church.png",
    alt: "Books for Your Church collection",
  },
  {
    id: "christian-living",
    subheading: "SACRED TEXTS",
    heading: "Books for Your Christian Living",
    href: "/categories/christian-living",
    image: "/images/collections/christian-living.png",
    alt: "Books for Your Christian Living collection",
  },
];

interface CollectionsGridProps {
  badge?: string;
  title?: string;
  collections?: CollectionItem[];
}

export function CollectionsGrid({
  badge = "Curated for you",
  title = "The Collections",
  collections = COLLECTIONS,
}: CollectionsGridProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:px-8">
      {/* Section Header */}
      <div className="mb-10 sm:mb-12 text-left">
        <p className="overline-label mb-2">{badge}</p>
        <h2 className="section-title">{title}</h2>
      </div>

      {/* 3-Column Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={col.href}
            className="group flex flex-col transition-all duration-300"
          >
            {/* Image Collage Container */}
            <div className="relative w-full aspect-[1.12/1] overflow-hidden transition-transform duration-500 ease-out group-hover:scale-[1.02]">
              <Image
                src={col.image}
                alt={col.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain object-bottom drop-shadow-sm transition-transform duration-500"
                priority={false}
              />
            </div>

            {/* Collection Details */}
            <div className="mt-6 flex flex-col items-start">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C6B2D]">
                {col.subheading}
              </span>
              <h3 className="mt-2 font-display text-2xl sm:text-[26px] font-bold text-charcoal leading-snug transition-colors duration-200 group-hover:text-gold-dark">
                {col.heading}
              </h3>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-charcoal/90 transition-all duration-300 group-hover:gap-2.5 group-hover:text-gold-dark">
                Explore Collection{" "}
                <span aria-hidden="true" className="text-sm font-semibold transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
