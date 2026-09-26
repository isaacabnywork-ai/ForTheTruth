/** Loading skeleton for the Authors listing page */
export default function AuthorsLoading() {
  return (
    <main className="bg-offwhite min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-12 animate-pulse border-b border-sand pb-8">
          <div className="mb-2 h-3 w-24 rounded-full bg-sand" />
          <div className="h-10 w-72 rounded-2xl bg-sand" />
          <div className="mt-4 h-4 w-96 max-w-full rounded-full bg-sand/70" />
        </div>
        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-2xl border border-sand bg-white shadow-card"
            >
              <div className="aspect-square w-full bg-sand/60" />
              <div className="space-y-2 p-5">
                <div className="h-5 w-3/4 rounded-full bg-sand" />
                <div className="h-3 w-full rounded-full bg-sand/60" />
                <div className="h-3 w-5/6 rounded-full bg-sand/60" />
                <div className="h-3 w-2/3 rounded-full bg-sand/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
