export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Page Header Skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-4 w-32 rounded bg-slate-200 mb-3" />
        <div className="h-9 w-64 rounded-xl bg-slate-300 mb-2" />
        <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
      </div>

      {/* Filter and Shelf Grid Skeleton */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0 animate-pulse">
          <div className="h-64 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm" />
        </div>
        <div className="flex-1 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col items-center">
              <div className="h-52 w-36 rounded-xl bg-slate-200 mb-4 shadow-inner" />
              <div className="h-4 w-11/12 rounded bg-slate-200 mb-2" />
              <div className="h-3 w-3/4 rounded bg-slate-100 mb-4" />
              <div className="h-9 w-full rounded-2xl bg-slate-200 mt-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
