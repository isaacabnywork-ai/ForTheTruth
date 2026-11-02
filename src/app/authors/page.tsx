import type { Metadata } from "next";
import { AuthorCard } from "@/components/authors/AuthorCard";
import { AUTHORS } from "@/data/authors";

export const metadata: Metadata = {
  title: "Featured Authors & Theologians",
  description:
    "Discover sound theological insights and Christian literature from trusted authors, pastors, and theologians throughout history including R.C. Sproul, Charles Spurgeon, John Calvin, and J.I. Packer.",
  alternates: {
    canonical: "/authors",
  },
  openGraph: {
    title: "Featured Authors & Theologians — For The Truth",
    description:
      "Discover sound theological insights from trusted authors throughout church history.",
    url: "https://forthetruth.in/authors",
    siteName: "For The Truth",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Featured Authors & Theologians",
    description:
      "Discover sound theological insights from trusted authors throughout church history.",
  },
};

export default function AuthorsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forthetruth.in";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Authors",
        item: `${baseUrl}/authors`,
      },
    ],
  };

  return (
    <main className="bg-offwhite min-h-screen py-12 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
