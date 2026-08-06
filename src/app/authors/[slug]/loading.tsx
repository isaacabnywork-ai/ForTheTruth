/** Loading skeleton for an individual author profile page */
export default function AuthorProfileLoading() {
  return (
    <main className="bg-offwhite min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Back link skeleton */}
        <div className="mb-8 h-4 w-28 animate-pulse rounded-full bg-sand" />

        {/* Profile header skeleton */}
        <div className="mb-16 grid animate-pulse items-start gap-8 md:grid-cols-[1fr_2fr] lg:gap-16">
          <div className="aspect-square w-full rounded-3xl bg-sand/60" />
          <div className="py-4 space-y-4">
            <div className="h-12 w-3/4 rounded-2xl bg-sand" />
            <div className="h-4 w-full rounded-full bg-sand/60" />
            <div className="h-4 w-5/6 rounded-full bg-sand/60" />
            <div className="h-4 w-4/5 rounded-full bg-sand/60" />
            <div className="mt-8 h-16 w-40 rounded-2xl bg-sand/60" />
          </div>
        </div>

        {/* Books grid skeleton */}
        <div className="grid grid-cols-2 gap-4 animate-pulse sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-sand/60 aspect-[2/3]" />
          ))}
        </div>
      </div>
    </main>
  );
}
