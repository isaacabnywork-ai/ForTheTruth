import Link from "next/link";
import Image from "next/image";
import type { Author } from "@/data/authors";

export function AuthorCard({ author }: { author: Author }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-sand bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover flex flex-col h-full">
      <div className="relative aspect-square w-full overflow-hidden bg-cream">
        <Image
          src={author.imageUrl}
          alt={author.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-charcoal backdrop-blur shadow-sm">
            {author.bookCount} {author.bookCount === 1 ? "Book" : "Books"}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold text-charcoal">{author.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-charcoal/70 line-clamp-3">
          {author.bio}
        </p>
        <div className="mt-auto pt-4">
          <Link
            href={`/authors/${author.slug}`}
            className="text-xs font-extrabold uppercase tracking-widest text-gold-dark hover:text-gold-deep flex items-center gap-2 group-hover:gap-3 transition-all"
          >
            Explore Profile <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
