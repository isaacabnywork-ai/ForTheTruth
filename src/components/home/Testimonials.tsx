import { RatingStars } from "@/components/products/RatingStars";

const TESTIMONIALS = [
  {
    quote:
      "The devotionals I ordered changed how I approach my quiet time. Genuinely thoughtful curation — not the usual shelf filler.",
    name: "Priya M.",
    role: "Reader · Chennai",
    audience: "reader" as const,
  },
  {
    quote:
      "We ordered 50 copies for our small groups. The bulk pricing made it affordable for every family, and delivery was quick.",
    name: "Pastor James",
    role: "Grace Church · Bangalore",
    audience: "church" as const,
  },
  {
    quote:
      "Sound theology, fair prices, no gimmicks. This is the bookstore I recommend to everyone in our congregation.",
    name: "Rev. Maria",
    role: "Youth Ministry · Chennai",
    audience: "church" as const,
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
      <div className="mb-10 text-center">
        <p className="overline-label">Trusted by readers &amp; churches</p>
        <h2 className="section-title mt-3">What people say</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col rounded-2xl border border-sand bg-white p-6 shadow-card"
          >
            <RatingStars rating={5} />
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-charcoal/75">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5 border-t border-sand pt-4">
              <span className="block text-sm font-bold text-charcoal">
                {t.name}
              </span>
              <span className="mt-0.5 flex items-center gap-2 text-xs text-charcoal/45">
                {t.role}
                {t.audience === "church" && (
                  <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">
                    Church
                  </span>
                )}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
