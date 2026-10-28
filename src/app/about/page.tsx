import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | For The Truth",
  description:
    "For The Truth is an online Christian Bookstore in India. FOR THE TRUTH is a publishing ministry that exists to publish, distribute, and develop faithful biblical resources for the Church in India.",
};

const GOALS = [
  {
    number: "01",
    title: "Publish",
    description:
      "Publish quality, and theologically sound titles in English for the Church in India.",
  },
  {
    number: "02",
    title: "Distribute",
    description:
      "Distribute both classic and contemporary titles in English at affordable prices for the Church in India.",
  },
  {
    number: "03",
    title: "Develop",
    description:
      "Develop, publish, and distribute English resources produced by Indian writers for the Church in India.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-offwhite min-h-screen">
      {/* Hero Section */}
      <section className="bg-navy-gradient py-16 text-white md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-light">
            About Us
          </p>
          <h1 className="mt-4 font-display text-3xl font-black text-white sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">
            FOR THE <span className="text-gradient-gold">TRUTH</span>
          </h1>
          <p className="mx-auto mt-4 text-base font-semibold text-gold-light sm:text-lg">
            For The Truth is an online Christian Bookstore in India.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl font-medium">
            FOR THE TRUTH is a publishing ministry that exists to publish, distribute, and develop faithful biblical resources for the Church in India.
          </p>
        </div>
      </section>

      {/* Main Content: Vision & Goals */}
      <section className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        {/* Our Vision Card */}
        <div className="rounded-3xl border border-sand bg-white p-8 shadow-card md:p-12">
          <p className="overline-label mb-2 text-gold-dark">Our Vision</p>
          <h2 className="font-display text-2xl font-bold text-charcoal md:text-3xl">
            Meeting the Need for Faithful Theological Resources
          </h2>
          <div className="mt-6 text-sm sm:text-base leading-relaxed text-charcoal/80 space-y-4">
            <p>
              There is a vast amount of faithful theological resources in English available across the globe. But the average Indian is unable to benefit from these resources for reasons such as: prohibitive cost, hard to find, difficult to procure, and inaccessible due to language and cultural differences. There is also a dearth of faithful resources created by and for the Indian church in English and various Indian vernaculars.
            </p>
          </div>
        </div>

        {/* We Hope To Section */}
        <div className="mt-12">
          <div className="mb-8 text-center sm:text-left">
            <p className="overline-label text-gold-dark">Our Mission</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-charcoal">
              We hope to:
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {GOALS.map((g) => (
              <div
                key={g.number}
                className="relative rounded-2xl border border-sand bg-white p-6 sm:p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-card-hover flex flex-col justify-between"
              >
                <div>
                  <span className="font-display text-2xl font-black text-gold-dark/40">
                    {g.number}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold text-charcoal">
                    {g.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/75">
                    {g.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-3xl bg-cream p-8 text-center border border-sand/80 shadow-sm md:p-12">
          <h3 className="font-display text-2xl font-bold text-charcoal">
            Explore our curated resources
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-charcoal/65">
            Discover classic and contemporary Christian literature chosen with theological discernment.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/products" className="btn-cta text-sm px-6 py-2.5">
              Browse Books <span aria-hidden="true">→</span>
            </Link>
            <Link href="/statement-of-faith" className="btn-outline text-sm px-6 py-2.5">
              Statement of Faith
            </Link>
            <Link href="/contact" className="btn-outline text-sm px-6 py-2.5">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
