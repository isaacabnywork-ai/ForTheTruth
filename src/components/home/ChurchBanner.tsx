import Link from "next/link";
import { CHURCH_TRUST } from "@/utils/constants";

/** Navy band inviting pastors/church buyers into the bulk flow. */
export function ChurchBanner() {
  return (
    <section className="bg-navy-gradient py-16 text-white md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-light">
            For pastors &amp; ministry leaders
          </p>
          <h2 className="mt-4 font-display text-display-sm font-black text-white md:text-display-md">
            Order for your whole <em className="text-gradient-gold">church</em>
          </h2>
          <p className="mt-4 max-w-lg text-white/60">
            Small-group sets, curriculum kits, and leadership libraries — with
            tiered discounts, purchase orders, and a person you can actually
            call.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/church-resources#quote" className="btn-cta">
              Request a Quote
            </Link>
            <Link
              href="/church-resources"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/25 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-smooth hover:border-gold hover:text-gold-light"
            >
              See Bulk Pricing
            </Link>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {CHURCH_TRUST.map((t) => (
            <div
              key={t.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
            >
              <dt className="font-display text-base font-bold text-gold-light">
                {t.title}
              </dt>
              <dd className="mt-1 text-sm text-white/55">{t.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
