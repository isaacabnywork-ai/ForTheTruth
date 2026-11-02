import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAuthorBySlug, AUTHORS } from "@/data/authors";
import { getProducts } from "@/services/woocommerce";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types/product";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const author = getAuthorBySlug(params.slug);
  if (!author) return { title: "Author Not Found" };
  return {
    title: `${author.name} — Books & Biography`,
    description: author.bio,
    alternates: {
      canonical: `/authors/${params.slug}`,
    },
    openGraph: {
      title: `${author.name} — Books & Biography | For The Truth`,
      description: author.bio,
      url: `https://forthetruth.in/authors/${params.slug}`,
      siteName: "For The Truth",
      locale: "en_IN",
      type: "profile",
      images: [
        {
          url: author.imageUrl,
          alt: author.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name} — Books & Biography`,
      description: author.bio,
      images: [author.imageUrl],
    },
  };
}

export async function generateStaticParams() {
  return AUTHORS.map((a) => ({ slug: a.slug }));
}

export default async function AuthorProfilePage(props: PageProps) {
  const params = await props.params;
  const author = getAuthorBySlug(params.slug);
  if (!author) notFound();

  // Fetch products that match the author's name
  let products: Product[] = [];
  try {
    products = await getProducts({ search: author.name, perPage: 24 });
  } catch (error) {
    console.error("Failed to fetch author products:", error);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forthetruth.in";

  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${author.name} — Theological Books & Biography`,
    description: author.bio,
    url: `${baseUrl}/authors/${author.slug}`,
    mainEntity: {
      "@type": "Person",
      name: author.name,
      description: author.bio,
      image: author.imageUrl,
    },
  };

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
      {
        "@type": "ListItem",
        position: 3,
        name: author.name,
        item: `${baseUrl}/authors/${author.slug}`,
      },
    ],
  };

  return (
    <main className="bg-offwhite min-h-screen py-12 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Back Link */}
        <Link
          href="/authors"
          className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal/60 transition-colors hover:text-gold-dark"
        >
          <span aria-hidden="true">←</span> Back to Authors
        </Link>

        {/* Profile Header */}
        <div className="mb-16 grid items-start gap-8 md:grid-cols-[1fr_2fr] lg:gap-16">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-cream shadow-card">
            <Image
              src={author.imageUrl}
              alt={author.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col justify-center py-4">
            <h1 className="font-display text-4xl font-black text-charcoal md:text-5xl lg:text-6xl">
              {author.name}
            </h1>
            <p className="mt-6 text-base leading-loose text-charcoal/80 md:text-lg">
              {author.bio}
            </p>
            <div className="mt-8 flex items-center gap-4 border-t border-sand pt-8">
              <div className="text-center">
                <span className="block font-display text-3xl font-black text-gold-dark">
                  {products.length}
                </span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-charcoal/50">
                  Titles Available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Author's Books */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-sand pb-4">
            <h2 className="font-display text-2xl font-bold text-charcoal">
              Books by {author.name}
            </h2>
          </div>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-sand bg-white py-16 text-center shadow-sm">
              <h3 className="font-display text-xl font-bold text-charcoal">No books found</h3>
              <p className="mt-2 text-sm text-charcoal/60">
                We currently don't have any books by this author in stock.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
