import type { Metadata } from "next";
import { AuthorCard } from "@/components/authors/AuthorCard";
import { AUTHORS } from "@/data/authors";

export const metadata: Metadata = {
  title: "Featured Authors | For The Truth",
  description: "Explore the works of our featured theological authors.",
};

export default function AuthorsPage() {
  return (
    <main className="bg-offwhite min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 border-b border-sand pb-8 text-center md:text-left">
          <p className="overline-label">Our Writers</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-charcoal md:text-5xl">
            Featured Authors
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-charcoal/60 md:text-base">
            Discover profound theological insights and practical Christian living guidance from our carefully curated selection of trusted authors, pastors, and theologians throughout history.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {AUTHORS.map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      </div>
    </main>
  );
}
